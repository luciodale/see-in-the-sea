import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { Check, RotateCcw, Send, Trophy, X, ZoomOut } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CURRENT_CONTEST_CATEGORIES } from '../../../constants/categories';
import AdminTabs from '../../components/AdminTabs';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/judging')({
  component: JudgingPage,
});

// Use R2 domain in production, API endpoint in development
const IMAGE_BASE_URL = import.meta.env.PROD
  ? 'https://images.seeintheseauw.com'
  : '/api/images';

type Placement = 'first' | 'second' | 'third' | 'runner-up' | null;
type FlagStatus = 'pending' | 'shortlisted' | 'rejected';
type FilterStatus = 'all' | 'pending' | 'shortlisted' | 'rejected' | 'winners';

type JudgingSubmission = {
  id: string;
  title: string;
  description: string | null;
  r2ImageId: string | null;
  categoryId: string;
  placement: Placement;
  flagStatus: FlagStatus;
  rating: number | null;
  portfolio?: string | null;
  portfolioPhotoType?: string | null;
  anonymousUserId?: string;
  isSubmitted?: boolean;
};

const PLACEMENTS: { value: Placement; label: string; color: string }[] = [
  { value: 'first', label: '1°', color: 'bg-yellow-500' },
  { value: 'second', label: '2°', color: 'bg-gray-400' },
  { value: 'third', label: '3°', color: 'bg-amber-600' },
  { value: 'runner-up', label: 'M', color: 'bg-blue-500' }, // M = Menzione
];

function JudgingPage() {
  const { isAdmin, isLoaded } = useUserRole();
  const { getToken } = useAuth();

  // State
  const [contestId, setContestId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(
    CURRENT_CONTEST_CATEGORIES[0].id
  );
  const [submissions, setSubmissions] = useState<JudgingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inspectedSubmissionId, setInspectedSubmissionId] = useState<
    string | null
  >(null);
  const [inspectedPortfolioId, setInspectedPortfolioId] = useState<
    string | null
  >(null);
  // For zooming into individual photos within a portfolio modal
  const [zoomedPortfolioPhotoId, setZoomedPortfolioPhotoId] = useState<
    string | null
  >(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Zoom state for inspect modal
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 }); // percentage
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Sync status
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'synced' | 'error'
  >('idle');
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch active contest
  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await fetch('/api/contests');
        const data = (await res.json()) as {
          success: boolean;
          data?: { contest?: { id: string } };
        };
        if (data.success && data.data?.contest?.id) {
          setContestId(data.data.contest.id);
        }
      } catch (err) {
        console.error('Errore nel recupero del concorso:', err);
      }
    };
    fetchContest();
  }, []);

  // Fetch submissions for category
  const fetchSubmissions = useCallback(async () => {
    if (!contestId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const res = await fetch(
        `/api/admin/judging?contestId=${contestId}&categoryId=${activeCategory}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = (await res.json()) as {
        success: boolean;
        data?: JudgingSubmission[];
        message?: string;
      };

      if (data.success) {
        const withFlags = (data.data || []).map(s => ({
          ...s,
          flagStatus: s.flagStatus || 'pending',
          rating: s.rating || null,
        }));
        setSubmissions(withFlags);
      } else {
        setError(data.message || 'Impossibile recuperare le foto');
      }
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  }, [contestId, activeCategory, getToken]);

  useEffect(() => {
    if (contestId) {
      fetchSubmissions();
    }
  }, [contestId, activeCategory, fetchSubmissions]);

  // Reset zoom when closing modal and lock body scroll
  useEffect(() => {
    if (inspectedSubmissionId || inspectedPortfolioId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setZoomLevel(1);
      setZoomOrigin({ x: 50, y: 50 });
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [inspectedSubmissionId, inspectedPortfolioId]);

  // Get image URL
  const getImageUrl = (r2ImageId: string | null): string | null => {
    if (!r2ImageId) return null;
    return `${IMAGE_BASE_URL}/${r2ImageId}`;
  };

  // Background sync function
  const syncToServer = useCallback(
    async (
      submissionId: string,
      type: 'placement' | 'flag' | 'rating',
      value: Placement | FlagStatus | number | null
    ) => {
      try {
        setSyncStatus('syncing');
        const token = await getToken();

        let body;
        if (type === 'placement') {
          body = { action: 'set-placement', submissionId, placement: value };
        } else if (type === 'flag') {
          body = { action: 'set-flag', submissionId, status: value };
        } else {
          body = { action: 'set-rating', submissionId, rating: value };
        }

        const res = await fetch('/api/admin/judging', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          setSyncStatus('synced');
          if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = setTimeout(
            () => setSyncStatus('idle'),
            2000
          );
        } else {
          setSyncStatus('error');
        }
      } catch (e) {
        console.error('Sincronizzazione fallita:', e);
        setSyncStatus('error');
      }
    },
    [getToken]
  );

  // Submit final results
  const submitResults = useCallback(async () => {
    if (!contestId) return;
    if (
      !confirm(
        'Inviare tutti i piazzamenti come risultati finali? Questo sovrascriverà eventuali risultati esistenti.'
      )
    )
      return;

    try {
      setSyncStatus('syncing');
      const token = await getToken();
      const res = await fetch('/api/admin/judging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'submit-results', contestId }),
      });

      if (res.ok) {
        setSyncStatus('synced');
        fetchSubmissions();
        alert('Risultati inviati con successo!');
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [contestId, getToken, fetchSubmissions]);

  // Reset all judging
  const resetJudging = useCallback(async () => {
    if (!contestId) return;
    if (
      !confirm(
        'Azzerare TUTTI i dati della giuria? Questo cancellerà valutazioni, flag e piazzamenti.'
      )
    )
      return;

    try {
      setSyncStatus('syncing');
      const token = await getToken();
      const res = await fetch('/api/admin/judging', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'reset-judging', contestId }),
      });

      if (res.ok) {
        setSyncStatus('synced');
        fetchSubmissions();
        alert('Giuria azzerata con successo!');
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('error');
    }
  }, [contestId, getToken, fetchSubmissions]);

  // Local-first placement update
  const setPlacement = useCallback(
    (submissionId: string, placement: Placement) => {
      setSubmissions(prev => {
        const targetSubmission = prev.find(s => s.id === submissionId);
        if (!targetSubmission) return prev;

        const isUniquePlacement =
          placement === 'first' ||
          placement === 'second' ||
          placement === 'third';

        return prev.map(s => {
          if (s.id === submissionId) {
            return { ...s, placement };
          }
          if (
            isUniquePlacement &&
            s.categoryId === targetSubmission.categoryId &&
            s.placement === placement
          ) {
            syncToServer(s.id, 'placement', null);
            return { ...s, placement: null };
          }
          return s;
        });
      });
      syncToServer(submissionId, 'placement', placement);
    },
    [syncToServer]
  );

  // Local-first flag update
  const setFlagStatus = useCallback(
    (submissionId: string, status: FlagStatus) => {
      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId ? { ...s, flagStatus: status } : s
        )
      );
      syncToServer(submissionId, 'flag', status);
    },
    [syncToServer]
  );

  // Local-first rating update (auto-shortlists)
  const setRating = useCallback(
    (submissionId: string, rating: number) => {
      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId
            ? { ...s, rating, flagStatus: 'shortlisted' }
            : s
        )
      );
      syncToServer(submissionId, 'rating', rating);
      syncToServer(submissionId, 'flag', 'shortlisted');
    },
    [syncToServer]
  );

  // Portfolio-level voting (for Mediterranean) - applies to all photos in the portfolio
  const setPortfolioRating = useCallback(
    (portfolioId: string, rating: number) => {
      setSubmissions(prev => {
        const portfolioSubmissions = prev.filter(
          s => s.portfolio === portfolioId
        );
        portfolioSubmissions.forEach(s => {
          syncToServer(s.id, 'rating', rating);
          syncToServer(s.id, 'flag', 'shortlisted');
        });
        return prev.map(s =>
          s.portfolio === portfolioId
            ? { ...s, rating, flagStatus: 'shortlisted' as FlagStatus }
            : s
        );
      });
    },
    [syncToServer]
  );

  const setPortfolioFlag = useCallback(
    (portfolioId: string, status: FlagStatus) => {
      setSubmissions(prev => {
        const portfolioSubmissions = prev.filter(
          s => s.portfolio === portfolioId
        );
        portfolioSubmissions.forEach(s => {
          syncToServer(s.id, 'flag', status);
        });
        return prev.map(s =>
          s.portfolio === portfolioId ? { ...s, flagStatus: status } : s
        );
      });
    },
    [syncToServer]
  );

  const setPortfolioPlacement = useCallback(
    (portfolioId: string, placement: Placement) => {
      setSubmissions(prev => {
        const portfolioSubmissions = prev.filter(
          s => s.portfolio === portfolioId
        );
        const categoryId = portfolioSubmissions[0]?.categoryId;

        // Clear same placement from other portfolios in category
        const isUniquePlacement =
          placement === 'first' ||
          placement === 'second' ||
          placement === 'third';

        if (isUniquePlacement && placement && categoryId) {
          const otherPortfoliosWithPlacement = prev.filter(
            s =>
              s.categoryId === categoryId &&
              s.portfolio !== portfolioId &&
              s.placement === placement
          );
          // Get unique portfolio IDs
          const otherPortfolioIds = [
            ...new Set(otherPortfoliosWithPlacement.map(s => s.portfolio)),
          ];
          otherPortfolioIds.forEach(pid => {
            if (pid) {
              prev
                .filter(s => s.portfolio === pid)
                .forEach(s => syncToServer(s.id, 'placement', null));
            }
          });
        }

        portfolioSubmissions.forEach(s => {
          syncToServer(s.id, 'placement', placement);
        });

        return prev.map(s => {
          if (s.portfolio === portfolioId) {
            return { ...s, placement };
          }
          if (
            isUniquePlacement &&
            s.categoryId === categoryId &&
            s.placement === placement
          ) {
            return { ...s, placement: null };
          }
          return s;
        });
      });
    },
    [syncToServer]
  );

  // Filter submissions
  const categorySubmissions = submissions.filter(
    s => s.categoryId === activeCategory
  );

  const filteredSubmissions =
    filterStatus === 'all'
      ? categorySubmissions
      : filterStatus === 'winners'
        ? categorySubmissions.filter(s => s.placement !== null)
        : categorySubmissions.filter(s => s.flagStatus === filterStatus);

  // Sort winners by placement order
  const sortedSubmissions =
    filterStatus === 'winners'
      ? [...filteredSubmissions].sort((a, b) => {
          const order = { first: 1, second: 2, third: 3, 'runner-up': 4 };
          const aOrder = a.placement ? order[a.placement] || 99 : 99;
          const bOrder = b.placement ? order[b.placement] || 99 : 99;
          return aOrder - bOrder;
        })
      : filteredSubmissions;

  // Get current inspected submission and navigation
  const inspectedSubmission = inspectedSubmissionId
    ? sortedSubmissions.find(s => s.id === inspectedSubmissionId)
    : null;
  const inspectedIndex = inspectedSubmissionId
    ? sortedSubmissions.findIndex(s => s.id === inspectedSubmissionId)
    : -1;
  const canGoPrev = inspectedIndex > 0;
  const canGoNext =
    inspectedIndex >= 0 && inspectedIndex < sortedSubmissions.length - 1;

  const goToPrevSubmission = () => {
    if (canGoPrev) {
      setInspectedSubmissionId(sortedSubmissions[inspectedIndex - 1].id);
      setZoomLevel(1);
      setZoomOrigin({ x: 50, y: 50 });
    }
  };

  const goToNextSubmission = () => {
    if (canGoNext) {
      setInspectedSubmissionId(sortedSubmissions[inspectedIndex + 1].id);
      setZoomLevel(1);
      setZoomOrigin({ x: 50, y: 50 });
    }
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle zoomed photo within portfolio modal
      if (zoomedPortfolioPhotoId && inspectedPortfolio) {
        if (e.key === 'Escape') {
          setZoomedPortfolioPhotoId(null);
          setZoomLevel(1);
          setZoomOrigin({ x: 50, y: 50 });
        } else if (e.key === 'ArrowLeft') {
          const currentIdx = inspectedPortfolio.submissions.findIndex(
            s => s.id === zoomedPortfolioPhotoId
          );
          if (currentIdx > 0) {
            setZoomedPortfolioPhotoId(
              inspectedPortfolio.submissions[currentIdx - 1].id
            );
            setZoomLevel(1);
            setZoomOrigin({ x: 50, y: 50 });
          }
        } else if (e.key === 'ArrowRight') {
          const currentIdx = inspectedPortfolio.submissions.findIndex(
            s => s.id === zoomedPortfolioPhotoId
          );
          if (currentIdx < inspectedPortfolio.submissions.length - 1) {
            setZoomedPortfolioPhotoId(
              inspectedPortfolio.submissions[currentIdx + 1].id
            );
            setZoomLevel(1);
            setZoomOrigin({ x: 50, y: 50 });
          }
        }
        return;
      }

      // Handle portfolio modal (Mediterranean)
      if (inspectedPortfolioId) {
        if (e.key === 'Escape') {
          setInspectedPortfolioId(null);
        } else if (e.key === 'ArrowLeft') {
          goToPrevPortfolio();
        } else if (e.key === 'ArrowRight') {
          goToNextPortfolio();
        }
        return;
      }

      // Handle individual submission modal
      if (!inspectedSubmissionId) return;

      if (e.key === 'Escape') {
        setInspectedSubmissionId(null);
      } else if (e.key === 'ArrowLeft') {
        goToPrevSubmission();
      } else if (e.key === 'ArrowRight') {
        goToNextSubmission();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Group Mediterranean submissions by user + portfolio number
  // Portfolio is identified by: anonymousUserId + portfolio (e.g., "1" or "2")
  // Each portfolio should have exactly 3 unique photos (macro, wide-angle, free)
  const isMediterranean = activeCategory === 'mediterranean';

  // Build portfolios list with composite key: anonymousUserId + portfolio
  const portfoliosList: {
    portfolioId: string; // Composite key: `${anonymousUserId}-${portfolio}`
    submissions: JudgingSubmission[];
  }[] = [];

  if (isMediterranean) {
    // Group by composite key: anonymousUserId + portfolio number
    const portfolioMap = new Map<string, JudgingSubmission[]>();

    sortedSubmissions.forEach(s => {
      // Create composite key from user and portfolio number
      const userKey = s.anonymousUserId || 'unknown';
      const portfolioNum = s.portfolio || 'ungrouped';
      const compositeKey = `${userKey}-${portfolioNum}`;

      if (!portfolioMap.has(compositeKey)) {
        portfolioMap.set(compositeKey, []);
      }
      const existing = portfolioMap.get(compositeKey)!;
      // Only add if we don't already have this photo type in the portfolio
      const hasPhotoType = existing.some(
        e => e.portfolioPhotoType === s.portfolioPhotoType
      );
      if (!hasPhotoType) {
        existing.push(s);
      }
    });

    // Convert to list, filtering out incomplete portfolios or ungrouped
    portfolioMap.forEach((subs, compositeKey) => {
      if (!compositeKey.endsWith('-ungrouped') && subs.length > 0) {
        portfoliosList.push({ portfolioId: compositeKey, submissions: subs });
      }
    });
  }

  // Legacy grouped structure for backwards compatibility
  const groupedByUser = isMediterranean
    ? portfoliosList.reduce(
        (acc, p) => {
          const userKey = p.submissions[0]?.anonymousUserId || 'unknown';
          if (!acc[userKey]) acc[userKey] = {};
          acc[userKey][p.portfolioId] = p.submissions;
          return acc;
        },
        {} as Record<string, Record<string, JudgingSubmission[]>>
      )
    : null;

  // Get current inspected portfolio and navigation
  const inspectedPortfolio = inspectedPortfolioId
    ? portfoliosList.find(p => p.portfolioId === inspectedPortfolioId)
    : null;
  const inspectedPortfolioIndex = inspectedPortfolioId
    ? portfoliosList.findIndex(p => p.portfolioId === inspectedPortfolioId)
    : -1;
  const canGoToPrevPortfolio = inspectedPortfolioIndex > 0;
  const canGoToNextPortfolio =
    inspectedPortfolioIndex >= 0 &&
    inspectedPortfolioIndex < portfoliosList.length - 1;

  // Zoomed photo within portfolio
  const zoomedPhoto =
    zoomedPortfolioPhotoId && inspectedPortfolio
      ? inspectedPortfolio.submissions.find(
          s => s.id === zoomedPortfolioPhotoId
        )
      : null;
  const zoomedPhotoIndex =
    zoomedPortfolioPhotoId && inspectedPortfolio
      ? inspectedPortfolio.submissions.findIndex(
          s => s.id === zoomedPortfolioPhotoId
        )
      : -1;
  const zoomedImageUrl = zoomedPhoto
    ? getImageUrl(zoomedPhoto.r2ImageId)
    : null;
  const canGoPrevPhoto = zoomedPhotoIndex > 0;
  const canGoNextPhoto =
    inspectedPortfolio && zoomedPhotoIndex >= 0
      ? zoomedPhotoIndex < inspectedPortfolio.submissions.length - 1
      : false;

  const goToPrevPortfolio = () => {
    if (canGoToPrevPortfolio) {
      setZoomedPortfolioPhotoId(null);
      setZoomLevel(1);
      setZoomOrigin({ x: 50, y: 50 });
      setInspectedPortfolioId(
        portfoliosList[inspectedPortfolioIndex - 1].portfolioId
      );
    }
  };

  const goToNextPortfolio = () => {
    if (canGoToNextPortfolio) {
      setZoomedPortfolioPhotoId(null);
      setZoomLevel(1);
      setZoomOrigin({ x: 50, y: 50 });
      setInspectedPortfolioId(
        portfoliosList[inspectedPortfolioIndex + 1].portfolioId
      );
    }
  };

  // Counts - for Mediterranean, count unique portfolios instead of individual photos
  const counts = isMediterranean
    ? {
        total: portfoliosList.length,
        shortlisted: [
          ...new Set(
            categorySubmissions
              .filter(s => s.flagStatus === 'shortlisted')
              .map(s => s.portfolio)
          ),
        ].length,
        rejected: [
          ...new Set(
            categorySubmissions
              .filter(s => s.flagStatus === 'rejected')
              .map(s => s.portfolio)
          ),
        ].length,
        pending: [
          ...new Set(
            categorySubmissions
              .filter(s => s.flagStatus === 'pending')
              .map(s => s.portfolio)
          ),
        ].length,
        winners: [
          ...new Set(
            categorySubmissions
              .filter(s => s.placement !== null)
              .map(s => s.portfolio)
          ),
        ].length,
      }
    : {
        total: categorySubmissions.length,
        shortlisted: categorySubmissions.filter(
          s => s.flagStatus === 'shortlisted'
        ).length,
        rejected: categorySubmissions.filter(s => s.flagStatus === 'rejected')
          .length,
        pending: categorySubmissions.filter(s => s.flagStatus === 'pending')
          .length,
        winners: categorySubmissions.filter(s => s.placement !== null).length,
      };

  // Placement counts - for Mediterranean, count unique portfolios
  const placementCounts = isMediterranean
    ? (['first', 'second', 'third', 'runner-up'] as const).reduce(
        (acc, placement) => {
          const uniquePortfolios = [
            ...new Set(
              categorySubmissions
                .filter(s => s.placement === placement)
                .map(s => s.portfolio)
            ),
          ];
          acc[placement] = uniquePortfolios.length;
          return acc;
        },
        {} as Record<string, number>
      )
    : categorySubmissions.reduce(
        (acc, s) => {
          if (s.placement) acc[s.placement] = (acc[s.placement] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

  // Render submission card
  const renderSubmissionCard = (
    submission: JudgingSubmission,
    size: 'normal' | 'large' = 'normal'
  ) => {
    const imageUrl = getImageUrl(submission.r2ImageId);
    const isRejected = submission.flagStatus === 'rejected';

    return (
      <div
        key={submission.id}
        className={`relative rounded-lg overflow-hidden bg-slate-900 border-2 transition-all group ${
          isRejected
            ? 'border-red-500/50 opacity-50'
            : submission.flagStatus === 'shortlisted'
              ? 'border-emerald-500/50'
              : submission.placement
                ? 'border-yellow-500/50'
                : 'border-slate-800 hover:border-slate-600'
        }`}
      >
        {/* Clickable Image - opens preview */}
        <div
          role="button"
          tabIndex={0}
          className={`${size === 'large' ? 'aspect-[4/3]' : 'aspect-square'} bg-slate-800 relative cursor-pointer`}
          onClick={() => {
            if (imageUrl) {
              setInspectedSubmissionId(submission.id);
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (imageUrl) {
                setInspectedSubmissionId(submission.id);
              }
            }
          }}
        >
          {imageUrl && !failedImages.has(submission.id) ? (
            <img
              src={imageUrl}
              alt={submission.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => {
                setFailedImages(prev => new Set(prev).add(submission.id));
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <span className="text-4xl">📷</span>
              <span className="text-xs">#{submission.id.slice(0, 6)}</span>
            </div>
          )}

          {/* Status badges - always visible */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            {submission.placement && (
              <span
                className={`${PLACEMENTS.find(p => p.value === submission.placement)?.color} w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg`}
              >
                {PLACEMENTS.find(p => p.value === submission.placement)?.label}
              </span>
            )}
            {submission.flagStatus === 'shortlisted' && (
              <span className="bg-emerald-500 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg">
                ✓
              </span>
            )}
            {submission.flagStatus === 'rejected' && (
              <span className="bg-red-500 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg">
                ✗
              </span>
            )}
          </div>

          {/* Rating badge */}
          {submission.rating && submission.rating > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400">
              ★{submission.rating}
            </div>
          )}

          {/* Hover toolbar - compact and organized */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-center gap-1">
              {/* Stars */}
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  key={stars}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setRating(submission.id, stars);
                  }}
                  className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                    submission.rating === stars
                      ? 'bg-yellow-500 text-black'
                      : 'bg-slate-700/80 text-white hover:bg-slate-600'
                  }`}
                >
                  {stars}
                </button>
              ))}

              <div className="w-px h-5 bg-slate-600 mx-1" />

              {/* Flags */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setFlagStatus(submission.id, 'shortlisted');
                }}
                className={`w-6 h-6 rounded text-xs transition-all ${
                  submission.flagStatus === 'shortlisted'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700/80 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                }`}
              >
                ✓
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setFlagStatus(submission.id, 'rejected');
                }}
                className={`w-6 h-6 rounded text-xs transition-all ${
                  submission.flagStatus === 'rejected'
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-700/80 text-red-400 hover:bg-red-600 hover:text-white'
                }`}
              >
                ✗
              </button>

              <div className="w-px h-5 bg-slate-600 mx-1" />

              {/* Placements */}
              {PLACEMENTS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setPlacement(submission.id, p.value);
                  }}
                  className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                    submission.placement === p.value
                      ? `${p.color} text-white ring-1 ring-white`
                      : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {submission.placement && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setPlacement(submission.id, null);
                  }}
                  className="w-6 h-6 rounded text-xs bg-slate-700/80 text-slate-400 hover:bg-slate-600 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description - minimal */}
        <div className="px-2 py-1.5 bg-slate-900">
          <p className="text-xs text-slate-300 truncate">{submission.title}</p>
        </div>
      </div>
    );
  };

  // Render a Mediterranean portfolio card (3 photos + portfolio-level voting)
  const renderPortfolioCard = (
    portfolioId: string,
    portfolioSubmissions: JudgingSubmission[]
  ) => {
    // Get portfolio status from first photo (they should all be the same)
    const firstPhoto = portfolioSubmissions[0];
    if (!firstPhoto) return null;

    const isRejected = firstPhoto.flagStatus === 'rejected';

    return (
      <div
        key={portfolioId}
        className={`relative rounded-xl overflow-hidden bg-slate-900 border-2 transition-all group ${
          isRejected
            ? 'border-red-500/50 opacity-50'
            : firstPhoto.flagStatus === 'shortlisted'
              ? 'border-emerald-500/50'
              : firstPhoto.placement
                ? 'border-yellow-500/50'
                : 'border-slate-800 hover:border-slate-600'
        }`}
      >
        {/* 3 Photos Grid - Clickable to open portfolio preview */}
        <div
          role="button"
          tabIndex={0}
          className="grid grid-cols-3 gap-2 p-2 cursor-pointer"
          onClick={() => setInspectedPortfolioId(portfolioId)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setInspectedPortfolioId(portfolioId);
            }
          }}
        >
          {portfolioSubmissions.map(sub => {
            const imageUrl = getImageUrl(sub.r2ImageId);
            return (
              <div key={sub.id} className="aspect-square bg-slate-800 relative">
                {imageUrl && !failedImages.has(sub.id) ? (
                  <img
                    src={imageUrl}
                    alt={sub.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => {
                      setFailedImages(prev => new Set(prev).add(sub.id));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <span className="text-2xl">📷</span>
                  </div>
                )}
                <div className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-slate-300 px-1.5 py-0.5 rounded capitalize">
                  {sub.portfolioPhotoType}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status badges - portfolio level */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {firstPhoto.placement && (
            <span
              className={`${PLACEMENTS.find(p => p.value === firstPhoto.placement)?.color} w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg`}
            >
              {PLACEMENTS.find(p => p.value === firstPhoto.placement)?.label}
            </span>
          )}
          {firstPhoto.flagStatus === 'shortlisted' && (
            <span className="bg-emerald-500 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg">
              ✓
            </span>
          )}
          {firstPhoto.flagStatus === 'rejected' && (
            <span className="bg-red-500 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-lg">
              ✗
            </span>
          )}
        </div>

        {/* Rating badge - portfolio level */}
        {firstPhoto.rating && firstPhoto.rating > 0 && (
          <div className="absolute top-3 right-3 bg-black/70 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400">
            ★{firstPhoto.rating}
          </div>
        )}

        {/* Hover toolbar - portfolio-level voting */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-center gap-1.5">
            {/* Stars */}
            {[1, 2, 3, 4, 5].map(stars => (
              <button
                key={stars}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPortfolioRating(portfolioId, stars);
                }}
                className={`w-7 h-7 rounded text-sm font-bold transition-all ${
                  firstPhoto.rating === stars
                    ? 'bg-yellow-500 text-black'
                    : 'bg-slate-700/80 text-white hover:bg-slate-600'
                }`}
              >
                {stars}
              </button>
            ))}

            <div className="w-px h-6 bg-slate-600 mx-1.5" />

            {/* Flags */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setPortfolioFlag(portfolioId, 'shortlisted');
              }}
              className={`w-7 h-7 rounded text-sm transition-all ${
                firstPhoto.flagStatus === 'shortlisted'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/80 text-emerald-400 hover:bg-emerald-600 hover:text-white'
              }`}
            >
              ✓
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setPortfolioFlag(portfolioId, 'rejected');
              }}
              className={`w-7 h-7 rounded text-sm transition-all ${
                firstPhoto.flagStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-700/80 text-red-400 hover:bg-red-600 hover:text-white'
              }`}
            >
              ✗
            </button>

            <div className="w-px h-6 bg-slate-600 mx-1.5" />

            {/* Placements */}
            {PLACEMENTS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPortfolioPlacement(portfolioId, p.value);
                }}
                className={`w-7 h-7 rounded text-sm font-bold transition-all ${
                  firstPhoto.placement === p.value
                    ? `${p.color} text-white ring-1 ring-white`
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {p.label}
              </button>
            ))}
            {firstPhoto.placement && (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPortfolioPlacement(portfolioId, null);
                }}
                className="w-7 h-7 rounded text-sm bg-slate-700/80 text-slate-400 hover:bg-slate-600 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Portfolio label */}
        <div className="px-3 py-2 bg-slate-900 text-center">
          <p className="text-xs text-slate-400">Portfolio</p>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-slate-950 text-white">
            <AdminTabs />

            {/* Header */}
            <div className="px-4 py-4 border-b border-slate-800">
              <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-light tracking-wide">
                    Pannello Giuria
                  </h1>
                  <p className="text-slate-400 text-sm mt-1">
                    Clicca per selezionare • Valuta da 1 a 5 stelle • Usa i
                    bottoni per votare
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {syncStatus === 'syncing' && (
                    <span className="text-slate-400 text-sm flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                      Salvataggio...
                    </span>
                  )}
                  {syncStatus === 'synced' && (
                    <span className="text-emerald-400 text-sm flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Salvato
                    </span>
                  )}
                  {syncStatus === 'error' && (
                    <span className="text-red-400 text-sm">
                      Sincronizzazione fallita
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={resetJudging}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Azzera
                  </button>
                  <button
                    type="button"
                    onClick={submitResults}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Invia Risultati
                  </button>
                </div>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
                {CURRENT_CONTEST_CATEGORIES.map(cat => {
                  const catCount = submissions.filter(
                    s => s.categoryId === cat.id
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setFailedImages(new Set());
                        setFilterStatus('all');
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat.name}
                      {catCount > 0 && (
                        <span className="ml-2 text-xs opacity-70">
                          ({catCount})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-4 py-2 bg-slate-900/70 border-b border-slate-800">
              <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
                {(
                  [
                    { value: 'all', label: 'Tutti', count: counts.total },
                    {
                      value: 'pending',
                      label: '○ In attesa',
                      count: counts.pending,
                    },
                    {
                      value: 'shortlisted',
                      label: '✓ Selezionati',
                      count: counts.shortlisted,
                    },
                    {
                      value: 'rejected',
                      label: '✗ Scartati',
                      count: counts.rejected,
                    },
                    {
                      value: 'winners',
                      label: '🏆 Vincitori',
                      count: counts.winners,
                    },
                  ] as const
                ).map(filter => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                      filterStatus === filter.value
                        ? filter.value === 'winners'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="px-4 py-3 bg-slate-900/50 border-b border-slate-800">
              <div className="max-w-7xl mx-auto flex flex-wrap gap-6 text-sm">
                <span className="text-slate-400">
                  Mostrando:{' '}
                  <span className="text-white">{sortedSubmissions.length}</span>
                </span>
                <div className="flex gap-3 border-l border-slate-700 pl-6">
                  {PLACEMENTS.map(p => (
                    <span key={p.value} className="flex items-center gap-1">
                      <span
                        className={`w-5 h-5 rounded ${p.color} flex items-center justify-center text-xs font-bold`}
                      >
                        {p.label}
                      </span>
                      <span className="text-white">
                        {placementCounts[p.value!] || 0}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="max-w-7xl mx-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                  </div>
                ) : error ? (
                  <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-center">
                    {error}
                  </div>
                ) : sortedSubmissions.length === 0 ? (
                  <div className="text-center py-20 text-slate-400">
                    {filterStatus === 'winners' ? (
                      <div>
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nessun vincitore selezionato</p>
                        <p className="text-sm mt-2">
                          Assegna 1°, 2°, 3° o M per vedere i vincitori qui
                        </p>
                      </div>
                    ) : (
                      'Nessuna foto corrisponde a questo filtro'
                    )}
                  </div>
                ) : filterStatus === 'winners' ? (
                  /* Winners Preview - Elegant podium layout */
                  <div className="space-y-8">
                    {/* Podium - 1st, 2nd, 3rd */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['second', 'first', 'third'].map(placement => {
                        const winner = sortedSubmissions.find(
                          s => s.placement === placement
                        );
                        const placementInfo = PLACEMENTS.find(
                          p => p.value === placement
                        );
                        const isFirst = placement === 'first';

                        // For Mediterranean, find the portfolio
                        const winnerPortfolio =
                          isMediterranean && winner?.portfolio
                            ? portfoliosList.find(
                                p => p.portfolioId === winner.portfolio
                              )
                            : null;

                        return (
                          <div
                            key={placement}
                            className={`${isFirst ? 'md:-mt-4 md:order-2' : placement === 'second' ? 'md:order-1' : 'md:order-3'}`}
                          >
                            <div
                              className={`text-center mb-3 ${isFirst ? 'text-2xl' : 'text-lg'}`}
                            >
                              <span
                                className={`${placementInfo?.color} inline-flex items-center justify-center ${isFirst ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'} rounded-full font-bold shadow-lg`}
                              >
                                {placementInfo?.label}
                              </span>
                              <p className="text-slate-300 mt-2 font-medium">
                                {placement === 'first' && '🥇 1° Posto'}
                                {placement === 'second' && '🥈 2° Posto'}
                                {placement === 'third' && '🥉 3° Posto'}
                              </p>
                            </div>
                            {winner ? (
                              <div
                                className={`${isFirst && !(isMediterranean && winnerPortfolio) ? 'ring-2 ring-yellow-500/50' : ''} rounded-lg overflow-hidden`}
                              >
                                {isMediterranean && winnerPortfolio
                                  ? renderPortfolioCard(
                                      winnerPortfolio.portfolioId,
                                      winnerPortfolio.submissions
                                    )
                                  : renderSubmissionCard(winner, 'large')}
                              </div>
                            ) : (
                              <div className="aspect-[4/3] bg-slate-800/50 rounded-lg flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-700">
                                Non assegnato
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Runner-ups */}
                    {sortedSubmissions.filter(s => s.placement === 'runner-up')
                      .length > 0 && (
                      <div className="mt-8 pt-8 border-t border-slate-800">
                        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                          <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                            M
                          </span>
                          <span className="text-slate-300">
                            Menzioni (
                            {isMediterranean
                              ? // Count unique portfolios with runner-up
                                [
                                  ...new Set(
                                    sortedSubmissions
                                      .filter(s => s.placement === 'runner-up')
                                      .map(s => s.portfolio)
                                  ),
                                ].length
                              : sortedSubmissions.filter(
                                  s => s.placement === 'runner-up'
                                ).length}
                            )
                          </span>
                        </h3>
                        <div
                          className={`grid ${isMediterranean ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4`}
                        >
                          {isMediterranean
                            ? // Render unique portfolios with runner-up
                              [
                                ...new Set(
                                  sortedSubmissions
                                    .filter(s => s.placement === 'runner-up')
                                    .map(s => s.portfolio)
                                ),
                              ].map(portfolioId => {
                                const portfolio = portfoliosList.find(
                                  p => p.portfolioId === portfolioId
                                );
                                return portfolio
                                  ? renderPortfolioCard(
                                      portfolio.portfolioId,
                                      portfolio.submissions
                                    )
                                  : null;
                              })
                            : sortedSubmissions
                                .filter(s => s.placement === 'runner-up')
                                .map(submission =>
                                  renderSubmissionCard(submission, 'normal')
                                )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isMediterranean && groupedByUser ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(groupedByUser).flatMap(
                      ([_userId, portfolios]) =>
                        Object.entries(portfolios).map(
                          ([portfolioId, portfolioSubmissions]) =>
                            renderPortfolioCard(
                              portfolioId,
                              portfolioSubmissions
                            )
                        )
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedSubmissions.map(submission =>
                      renderSubmissionCard(submission, 'large')
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Inspect Modal with voting and navigation */}
            {inspectedSubmission && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={inspectedSubmission.title}
                className="fixed inset-0 bg-black z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-white font-medium">
                        {inspectedSubmission.title}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {inspectedIndex + 1} / {sortedSubmissions.length} •{' '}
                        Frecce ←→ per navigare
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs px-2 py-1 bg-slate-800 rounded">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    {zoomLevel > 1 && (
                      <button
                        type="button"
                        className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                        onClick={() => {
                          setZoomLevel(1);
                          setZoomOrigin({ x: 50, y: 50 });
                        }}
                        aria-label="Reimposta zoom"
                      >
                        <ZoomOut className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center"
                      onClick={() => setInspectedSubmissionId(null)}
                      aria-label="Chiudi"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Main content with nav buttons */}
                <div className="flex-1 min-h-0 flex items-stretch relative">
                  {/* Prev button */}
                  <button
                    type="button"
                    onClick={goToPrevSubmission}
                    disabled={!canGoPrev}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      canGoPrev
                        ? 'bg-black/60 hover:bg-black/80 text-white'
                        : 'bg-black/20 text-slate-600 cursor-not-allowed'
                    }`}
                    aria-label="Foto precedente"
                  >
                    ←
                  </button>

                  {/* Image */}
                  <div
                    ref={imageContainerRef}
                    role="button"
                    tabIndex={0}
                    className="flex-1 overflow-auto flex items-center justify-center cursor-zoom-in p-4"
                    onClick={e => {
                      const img = e.currentTarget.querySelector('img');
                      if (img) {
                        const rect = img.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        setZoomOrigin({ x, y });
                      }
                      setZoomLevel(z => (z >= 4 ? 1 : z + 0.5));
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setZoomLevel(z => (z >= 4 ? 1 : z + 0.5));
                      }
                    }}
                  >
                    <img
                      src={getImageUrl(inspectedSubmission.r2ImageId) || ''}
                      alt={inspectedSubmission.title}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                        transition: 'transform 0.2s ease-out',
                      }}
                      className="max-w-full max-h-full object-contain"
                      draggable={false}
                    />
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={goToNextSubmission}
                    disabled={!canGoNext}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      canGoNext
                        ? 'bg-black/60 hover:bg-black/80 text-white'
                        : 'bg-black/20 text-slate-600 cursor-not-allowed'
                    }`}
                    aria-label="Foto successiva"
                  >
                    →
                  </button>
                </div>

                {/* Bottom voting toolbar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* Current status */}
                    <div className="flex items-center gap-2 mr-4">
                      {inspectedSubmission.placement && (
                        <span
                          className={`${PLACEMENTS.find(p => p.value === inspectedSubmission.placement)?.color} px-2 py-1 rounded text-xs font-bold`}
                        >
                          {
                            PLACEMENTS.find(
                              p => p.value === inspectedSubmission.placement
                            )?.label
                          }
                        </span>
                      )}
                      {inspectedSubmission.rating && (
                        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                          ★{inspectedSubmission.rating}
                        </span>
                      )}
                      {inspectedSubmission.flagStatus !== 'pending' && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            inspectedSubmission.flagStatus === 'shortlisted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {inspectedSubmission.flagStatus === 'shortlisted'
                            ? 'Selezionato'
                            : 'Scartato'}
                        </span>
                      )}
                    </div>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() =>
                            setRating(inspectedSubmission.id, stars)
                          }
                          className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                            inspectedSubmission.rating === stars
                              ? 'bg-yellow-500 text-black'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {stars}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Flags */}
                    <button
                      type="button"
                      onClick={() =>
                        setFlagStatus(inspectedSubmission.id, 'shortlisted')
                      }
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        inspectedSubmission.flagStatus === 'shortlisted'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      ✓ Seleziona
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFlagStatus(inspectedSubmission.id, 'rejected')
                      }
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        inspectedSubmission.flagStatus === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-red-400 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      ✗ Scarta
                    </button>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Placements */}
                    {PLACEMENTS.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() =>
                          setPlacement(inspectedSubmission.id, p.value)
                        }
                        className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                          inspectedSubmission.placement === p.value
                            ? `${p.color} text-white ring-2 ring-white`
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    {inspectedSubmission.placement && (
                      <button
                        type="button"
                        onClick={() =>
                          setPlacement(inspectedSubmission.id, null)
                        }
                        className="w-8 h-8 rounded text-sm bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Modal (Mediterranean) */}
            {inspectedPortfolio && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Portfolio Preview"
                className="fixed inset-0 bg-black z-50 flex flex-col"
              >
                {/* Single Photo Zoom Overlay */}
                {zoomedPhoto && inspectedPortfolio && (
                  <div className="absolute inset-0 bg-black z-60 flex flex-col">
                    {/* Zoom header */}
                    <div className="flex items-center justify-between p-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setZoomedPortfolioPhotoId(null);
                            setZoomLevel(1);
                            setZoomOrigin({ x: 50, y: 50 });
                          }}
                          className="text-slate-400 hover:text-white text-sm flex items-center gap-1"
                        >
                          ← Torna al portfolio
                        </button>
                        <div className="text-white font-medium capitalize">
                          {zoomedPhoto.portfolioPhotoType}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-xs px-2 py-1 bg-slate-800 rounded">
                          {Math.round(zoomLevel * 100)}% — Clicca per ingrandire
                        </span>
                        {zoomLevel > 1 && (
                          <button
                            type="button"
                            className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center"
                            onClick={() => {
                              setZoomLevel(1);
                              setZoomOrigin({ x: 50, y: 50 });
                            }}
                            aria-label="Reimposta zoom"
                          >
                            <ZoomOut className="w-4 h-4 text-white" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center"
                          onClick={() => {
                            setZoomedPortfolioPhotoId(null);
                            setZoomLevel(1);
                            setZoomOrigin({ x: 50, y: 50 });
                          }}
                          aria-label="Chiudi zoom"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Zoomable image */}
                    <div className="flex-1 min-h-0 flex items-stretch relative">
                      {/* Prev photo button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (canGoPrevPhoto) {
                            const idx = zoomedPhotoIndex - 1;
                            const prevSub = inspectedPortfolio.submissions[idx];
                            setZoomedPortfolioPhotoId(prevSub.id);
                            setZoomLevel(1);
                            setZoomOrigin({ x: 50, y: 50 });
                          }
                        }}
                        disabled={!canGoPrevPhoto}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                          canGoPrevPhoto
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        ←
                      </button>

                      <div
                        role="button"
                        tabIndex={0}
                        className="flex-1 overflow-auto flex items-center justify-center cursor-zoom-in p-4"
                        onClick={e => {
                          const img = e.currentTarget.querySelector('img');
                          if (img) {
                            const rect = img.getBoundingClientRect();
                            const x =
                              ((e.clientX - rect.left) / rect.width) * 100;
                            const y =
                              ((e.clientY - rect.top) / rect.height) * 100;
                            setZoomOrigin({ x, y });
                          }
                          setZoomLevel(z => (z >= 4 ? 1 : z + 0.5));
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setZoomLevel(z => (z >= 4 ? 1 : z + 0.5));
                          }
                        }}
                      >
                        {zoomedImageUrl ? (
                          <img
                            src={zoomedImageUrl}
                            alt={zoomedPhoto.title || 'Photo'}
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                              transition: 'transform 0.2s ease-out',
                            }}
                            className="max-w-full max-h-full object-contain"
                            draggable={false}
                          />
                        ) : (
                          <div className="text-slate-500 text-4xl">📷</div>
                        )}
                      </div>

                      {/* Next photo button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (canGoNextPhoto) {
                            const idx = zoomedPhotoIndex + 1;
                            const nextSub = inspectedPortfolio.submissions[idx];
                            setZoomedPortfolioPhotoId(nextSub.id);
                            setZoomLevel(1);
                            setZoomOrigin({ x: 50, y: 50 });
                          }
                        }}
                        disabled={!canGoNextPhoto}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                          canGoNextPhoto
                            ? 'bg-white/20 hover:bg-white/30 text-white'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                      >
                        →
                      </button>
                    </div>

                    {/* Photo info footer */}
                    <div className="shrink-0 p-3 bg-slate-900/90 border-t border-slate-800 text-center">
                      <div className="text-sm text-slate-300">
                        {zoomedPhotoIndex + 1} /{' '}
                        {inspectedPortfolio.submissions.length}
                        {zoomedPhoto.title && (
                          <span className="ml-3 text-slate-500">
                            {zoomedPhoto.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800 shrink-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-white font-medium">
                        Portfolio Mediterranean
                      </div>
                      <div className="text-slate-500 text-xs">
                        {inspectedPortfolioIndex + 1} / {portfoliosList.length}{' '}
                        • Frecce ←→ per navigare • Clicca foto per ingrandire
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center"
                    onClick={() => setInspectedPortfolioId(null)}
                    aria-label="Chiudi"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Main content with nav buttons */}
                <div className="flex-1 min-h-0 flex items-stretch relative">
                  {/* Prev button */}
                  <button
                    type="button"
                    onClick={goToPrevPortfolio}
                    disabled={!canGoToPrevPortfolio}
                    className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      canGoToPrevPortfolio
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    ←
                  </button>

                  {/* Portfolio images - 3 photos in a row, clickable for zoom */}
                  <div className="flex-1 p-6 flex items-center justify-center gap-6 overflow-auto">
                    {inspectedPortfolio.submissions.map(sub => {
                      const imageUrl = getImageUrl(sub.r2ImageId);
                      return (
                        <div
                          key={sub.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setZoomedPortfolioPhotoId(sub.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setZoomedPortfolioPhotoId(sub.id);
                            }
                          }}
                          className="flex-1 max-w-lg flex flex-col bg-slate-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500/50 transition-all group"
                        >
                          <div className="aspect-[4/3] bg-slate-800 relative overflow-hidden">
                            {imageUrl && !failedImages.has(sub.id) ? (
                              <img
                                src={imageUrl}
                                alt={sub.title}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                onError={() => {
                                  setFailedImages(prev =>
                                    new Set(prev).add(sub.id)
                                  );
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <span className="text-4xl">📷</span>
                              </div>
                            )}
                            {/* Zoom hint on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                              <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full">
                                🔍 Clicca per zoom
                              </span>
                            </div>
                          </div>
                          <div className="p-3 text-center bg-slate-900">
                            <span className="text-sm text-slate-300 capitalize font-medium">
                              {sub.portfolioPhotoType}
                            </span>
                            {sub.title && (
                              <p className="text-xs text-slate-500 truncate mt-1">
                                {sub.title}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Next button */}
                  <button
                    type="button"
                    onClick={goToNextPortfolio}
                    disabled={!canGoToNextPortfolio}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      canGoToNextPortfolio
                        ? 'bg-white/20 hover:bg-white/30 text-white'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    →
                  </button>
                </div>

                {/* Bottom voting toolbar */}
                <div className="shrink-0 border-t border-slate-800 bg-slate-900 p-3">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* Current status */}
                    <div className="flex items-center gap-2">
                      {inspectedPortfolio.submissions[0]?.placement && (
                        <span
                          className={`${PLACEMENTS.find(p => p.value === inspectedPortfolio.submissions[0]?.placement)?.color} px-3 py-1 rounded-full text-xs font-bold`}
                        >
                          {
                            PLACEMENTS.find(
                              p =>
                                p.value ===
                                inspectedPortfolio.submissions[0]?.placement
                            )?.label
                          }
                        </span>
                      )}
                      {inspectedPortfolio.submissions[0]?.rating &&
                        inspectedPortfolio.submissions[0].rating > 0 && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-bold">
                            ★{inspectedPortfolio.submissions[0].rating}
                          </span>
                        )}
                      {inspectedPortfolio.submissions[0]?.flagStatus !==
                        'pending' && (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            inspectedPortfolio.submissions[0]?.flagStatus ===
                            'shortlisted'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {inspectedPortfolio.submissions[0]?.flagStatus ===
                          'shortlisted'
                            ? 'Selezionato'
                            : 'Scartato'}
                        </span>
                      )}
                    </div>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Stars */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(stars => (
                        <button
                          key={stars}
                          type="button"
                          onClick={() =>
                            setPortfolioRating(
                              inspectedPortfolio.portfolioId,
                              stars
                            )
                          }
                          className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                            inspectedPortfolio.submissions[0]?.rating === stars
                              ? 'bg-yellow-500 text-black'
                              : 'bg-slate-700 text-white hover:bg-slate-600'
                          }`}
                        >
                          {stars}
                        </button>
                      ))}
                    </div>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Flags */}
                    <button
                      type="button"
                      onClick={() =>
                        setPortfolioFlag(
                          inspectedPortfolio.portfolioId,
                          'shortlisted'
                        )
                      }
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        inspectedPortfolio.submissions[0]?.flagStatus ===
                        'shortlisted'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      ✓ Seleziona
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPortfolioFlag(
                          inspectedPortfolio.portfolioId,
                          'rejected'
                        )
                      }
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                        inspectedPortfolio.submissions[0]?.flagStatus ===
                        'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-700 text-red-400 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      ✗ Scarta
                    </button>

                    <div className="w-px h-6 bg-slate-700" />

                    {/* Placements */}
                    {PLACEMENTS.map(p => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() =>
                          setPortfolioPlacement(
                            inspectedPortfolio.portfolioId,
                            p.value
                          )
                        }
                        className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                          inspectedPortfolio.submissions[0]?.placement ===
                          p.value
                            ? `${p.color} text-white ring-2 ring-white`
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                    {inspectedPortfolio.submissions[0]?.placement && (
                      <button
                        type="button"
                        onClick={() =>
                          setPortfolioPlacement(
                            inspectedPortfolio.portfolioId,
                            null
                          )
                        }
                        className="w-8 h-8 rounded text-sm bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-bold">Accesso Negato</h2>
            </div>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

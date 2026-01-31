import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Check,
  GripVertical,
  RotateCcw,
  Send,
  Trophy,
  X,
  ZoomOut,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PHOTO_TYPES } from '../../../constants';
import { CURRENT_CONTEST_CATEGORIES } from '../../../constants/categories';
import AdminTabs from '../../components/AdminTabs';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';
import { getImageUrl } from '../../utils/imageUtils';

// Hook for localStorage-based ordering (fault tolerant)
function useLocalStorageOrder<T extends { id: string }>(
  key: string,
  items: T[]
): {
  orderedItems: T[];
  handleDragStart: (e: React.DragEvent, id: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetId: string) => void;
  handleDragEnd: () => void;
  draggedId: string | null;
  resetOrder: () => void;
} {
  const [orderMap, setOrderMap] = useState<Record<string, number>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Load order from localStorage on mount/key change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setOrderMap(JSON.parse(stored));
      }
    } catch {
      // Fail silently - fault tolerant
    }
  }, [key]);

  // Compute ordered items
  const orderedItems = useMemo(() => {
    if (Object.keys(orderMap).length === 0) return items;

    return [...items].sort((a, b) => {
      const orderA = orderMap[a.id] ?? Infinity;
      const orderB = orderMap[b.id] ?? Infinity;
      if (orderA === Infinity && orderB === Infinity) return 0;
      return orderA - orderB;
    });
  }, [items, orderMap]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain');
      if (!sourceId || sourceId === targetId) return;

      // Find current positions
      const sourceIdx = orderedItems.findIndex(i => i.id === sourceId);
      const targetIdx = orderedItems.findIndex(i => i.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return;

      // Reorder: move source to target position
      const newOrder = [...orderedItems];
      const [removed] = newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, removed);

      // Create new order map
      const newOrderMap: Record<string, number> = {};
      newOrder.forEach((item, idx) => {
        newOrderMap[item.id] = idx;
      });

      setOrderMap(newOrderMap);

      // Persist to localStorage (fault tolerant)
      try {
        localStorage.setItem(key, JSON.stringify(newOrderMap));
      } catch {
        // Fail silently
      }
    },
    [orderedItems, key]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  const resetOrder = useCallback(() => {
    setOrderMap({});
    try {
      localStorage.removeItem(key);
    } catch {
      // Fail silently
    }
  }, [key]);

  return {
    orderedItems,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    draggedId,
    resetOrder,
  };
}

export const Route = createFileRoute('/admin/judging')({
  component: JudgingPage,
});

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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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
  // Uses submission IDs from the portfolio to update all photos
  const setPortfolioRating = useCallback(
    (submissionIds: string[], rating: number) => {
      const idSet = new Set(submissionIds);
      setSubmissions(prev => {
        submissionIds.forEach(id => {
          syncToServer(id, 'rating', rating);
          syncToServer(id, 'flag', 'shortlisted');
        });
        return prev.map(s =>
          idSet.has(s.id)
            ? { ...s, rating, flagStatus: 'shortlisted' as FlagStatus }
            : s
        );
      });
    },
    [syncToServer]
  );

  const setPortfolioFlag = useCallback(
    (submissionIds: string[], status: FlagStatus) => {
      const idSet = new Set(submissionIds);
      setSubmissions(prev => {
        submissionIds.forEach(id => {
          syncToServer(id, 'flag', status);
        });
        return prev.map(s =>
          idSet.has(s.id) ? { ...s, flagStatus: status } : s
        );
      });
    },
    [syncToServer]
  );

  const setPortfolioPlacement = useCallback(
    (submissionIds: string[], placement: Placement, categoryId: string) => {
      const idSet = new Set(submissionIds);
      setSubmissions(prev => {
        // Clear same placement from other submissions in category
        const isUniquePlacement =
          placement === 'first' ||
          placement === 'second' ||
          placement === 'third';

        if (isUniquePlacement && placement && categoryId) {
          // Find other submissions that have this placement
          const otherSubmissionsWithPlacement = prev.filter(
            s =>
              s.categoryId === categoryId &&
              !idSet.has(s.id) &&
              s.placement === placement
          );
          // Clear placement from them
          otherSubmissionsWithPlacement.forEach(s => {
            syncToServer(s.id, 'placement', null);
          });
        }

        // Set placement on all photos in this portfolio
        submissionIds.forEach(id => {
          syncToServer(id, 'placement', placement);
        });

        return prev.map(s => {
          if (idSet.has(s.id)) {
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

  // Filter submissions by category
  const categorySubmissions = useMemo(
    () => submissions.filter(s => s.categoryId === activeCategory),
    [submissions, activeCategory]
  );

  // Memoize filtered and sorted submissions to avoid recalculation on every render
  const sortedSubmissions = useMemo(() => {
    const filtered =
      filterStatus === 'all'
        ? categorySubmissions
        : filterStatus === 'winners'
          ? categorySubmissions.filter(s => s.placement !== null)
          : categorySubmissions.filter(s => s.flagStatus === filterStatus);

    // Sort winners by placement order
    if (filterStatus === 'winners') {
      return [...filtered].sort((a, b) => {
        const order = { first: 1, second: 2, third: 3, 'runner-up': 4 };
        const aOrder = a.placement ? order[a.placement] || 99 : 99;
        const bOrder = b.placement ? order[b.placement] || 99 : 99;
        return aOrder - bOrder;
      });
    }
    return filtered;
  }, [categorySubmissions, filterStatus]);

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
      setDescriptionExpanded(false);
    }
  };

  const goToNextSubmission = () => {
    if (canGoNext) {
      setInspectedSubmissionId(sortedSubmissions[inspectedIndex + 1].id);
      setZoomLevel(1);
      setZoomOrigin({ x: 50, y: 50 });
      setDescriptionExpanded(false);
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

  // Memoize portfolios list to avoid recalculation on every render
  const portfoliosList = useMemo(() => {
    if (!isMediterranean) return [];

    // Build portfolios list with composite key: anonymousUserId + portfolio
    const result: {
      portfolioId: string; // Composite key: `${anonymousUserId}-${portfolio}`
      submissions: JudgingSubmission[];
    }[] = [];

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

    // Convert to list, filtering out ungrouped
    portfolioMap.forEach((subs, compositeKey) => {
      if (!compositeKey.endsWith('-ungrouped') && subs.length > 0) {
        result.push({ portfolioId: compositeKey, submissions: subs });
      }
    });

    return result;
  }, [isMediterranean, sortedSubmissions]);

  // Legacy grouped structure for backwards compatibility
  const groupedByUser = useMemo(() => {
    if (!isMediterranean) return null;
    return portfoliosList.reduce(
      (acc, p) => {
        const userKey = p.submissions[0]?.anonymousUserId || 'unknown';
        if (!acc[userKey]) acc[userKey] = {};
        acc[userKey][p.portfolioId] = p.submissions;
        return acc;
      },
      {} as Record<string, Record<string, JudgingSubmission[]>>
    );
  }, [isMediterranean, portfoliosList]);

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
  const zoomedImageUrl = zoomedPhoto?.r2ImageId
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

  // Helper to get unique portfolio composite keys from submissions
  const getUniquePortfolioKeys = useCallback(
    (submissions: JudgingSubmission[]) => {
      return [
        ...new Set(
          submissions
            .filter(s => s.portfolio && s.portfolio !== 'ungrouped')
            .map(s => `${s.anonymousUserId || 'unknown'}-${s.portfolio}`)
        ),
      ];
    },
    []
  );

  // Counts - for Mediterranean, count unique portfolios instead of individual photos
  const counts = useMemo(() => {
    if (isMediterranean) {
      // For Mediterranean, use composite keys to identify unique portfolios
      const allPortfolioKeys = getUniquePortfolioKeys(categorySubmissions);
      const shortlistedKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.flagStatus === 'shortlisted')
      );
      const rejectedKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.flagStatus === 'rejected')
      );
      const pendingKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.flagStatus === 'pending')
      );
      const winnersKeys = getUniquePortfolioKeys(
        categorySubmissions.filter(s => s.placement !== null)
      );

      return {
        total: allPortfolioKeys.length,
        shortlisted: shortlistedKeys.length,
        rejected: rejectedKeys.length,
        pending: pendingKeys.length,
        winners: winnersKeys.length,
      };
    }
    const shortlisted = categorySubmissions.filter(
      s => s.flagStatus === 'shortlisted'
    ).length;
    const rejected = categorySubmissions.filter(
      s => s.flagStatus === 'rejected'
    ).length;
    const pending = categorySubmissions.filter(
      s => s.flagStatus === 'pending'
    ).length;
    const winners = categorySubmissions.filter(
      s => s.placement !== null
    ).length;
    return {
      total: categorySubmissions.length,
      shortlisted,
      rejected,
      pending,
      winners,
    };
  }, [isMediterranean, categorySubmissions, getUniquePortfolioKeys]);

  // Placement counts - for Mediterranean, count unique portfolios
  const placementCounts = useMemo(() => {
    if (isMediterranean) {
      return (['first', 'second', 'third', 'runner-up'] as const).reduce(
        (acc, placement) => {
          const uniquePortfolioKeys = getUniquePortfolioKeys(
            categorySubmissions.filter(s => s.placement === placement)
          );
          acc[placement] = uniquePortfolioKeys.length;
          return acc;
        },
        {} as Record<string, number>
      );
    }
    return categorySubmissions.reduce(
      (acc, s) => {
        if (s.placement) acc[s.placement] = (acc[s.placement] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [isMediterranean, categorySubmissions, getUniquePortfolioKeys]);

  // Shortlisted items for reordering
  const shortlistedSubmissions = useMemo(
    () => categorySubmissions.filter(s => s.flagStatus === 'shortlisted'),
    [categorySubmissions]
  );

  const shortlistedPortfolios = useMemo(
    () =>
      portfoliosList
        .filter(p => p.submissions[0]?.flagStatus === 'shortlisted')
        .map(p => ({ id: p.portfolioId, ...p })),
    [portfoliosList]
  );

  // Drag-and-drop reordering for shortlisted items
  const shortlistedOrderKey = `judging-shortlist-order-${activeCategory}`;
  const {
    orderedItems: orderedShortlistedSubmissions,
    handleDragStart: handleSubmissionDragStart,
    handleDragOver: handleSubmissionDragOver,
    handleDrop: handleSubmissionDrop,
    handleDragEnd: handleSubmissionDragEnd,
    draggedId: draggedSubmissionId,
    resetOrder: resetSubmissionOrder,
  } = useLocalStorageOrder(shortlistedOrderKey, shortlistedSubmissions);

  const portfolioOrderKey = `judging-portfolio-order-${activeCategory}`;
  const {
    orderedItems: orderedShortlistedPortfolios,
    handleDragStart: handlePortfolioDragStart,
    handleDragOver: handlePortfolioDragOver,
    handleDrop: handlePortfolioDrop,
    handleDragEnd: handlePortfolioDragEnd,
    draggedId: draggedPortfolioId,
    resetOrder: resetPortfolioOrder,
  } = useLocalStorageOrder(portfolioOrderKey, shortlistedPortfolios);

  // Render submission card
  const renderSubmissionCard = (
    submission: JudgingSubmission,
    size: 'normal' | 'large' = 'normal'
  ) => {
    const imageUrl = submission.r2ImageId
      ? getImageUrl(submission.r2ImageId)
      : null;
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
          className={`${size === 'large' ? 'aspect-[4/3]' : 'aspect-square'} bg-neutral-600 relative cursor-pointer`}
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
          ) : failedImages.has(submission.id) ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/50 gap-2">
              <span className="text-3xl">⚠️</span>
              <span className="text-xs text-red-400 font-medium">
                Errore caricamento
              </span>
              <span className="text-[10px] text-red-500/70">
                #{submission.id.slice(0, 6)}
              </span>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <span className="text-3xl">🖼️</span>
              <span className="text-xs">Nessuna immagine</span>
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
                      ? `${p.color} text-white scale-110`
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

  // Render a Mediterranean portfolio card
  // showImages: false = lightweight icon preview (for main grid)
  // showImages: true = show actual images (for vincitori view)
  const renderPortfolioCard = (
    portfolioId: string,
    portfolioSubmissions: JudgingSubmission[],
    showImages = false
  ) => {
    // Get portfolio status from first photo (they should all be the same)
    const firstPhoto = portfolioSubmissions[0];
    if (!firstPhoto) return null;

    const isRejected = firstPhoto.flagStatus === 'rejected';
    const isIncomplete = portfolioSubmissions.length < PHOTO_TYPES.length;
    const photoCount = portfolioSubmissions.length;

    // Create a map of photo type to submission for quick lookup
    const photoByType = new Map(
      portfolioSubmissions.map(s => [s.portfolioPhotoType, s])
    );

    return (
      <div
        key={portfolioId}
        role="button"
        tabIndex={0}
        onClick={() => setInspectedPortfolioId(portfolioId)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setInspectedPortfolioId(portfolioId);
          }
        }}
        className={`relative rounded-xl overflow-hidden bg-slate-900 border-2 transition-all cursor-pointer group ${
          isRejected
            ? 'border-red-500/50 opacity-50'
            : isIncomplete
              ? 'border-orange-500/50'
              : firstPhoto.flagStatus === 'shortlisted'
                ? 'border-emerald-500/50'
                : firstPhoto.placement
                  ? 'border-yellow-500/50'
                  : 'border-slate-800 hover:border-slate-600'
        }`}
      >
        {showImages ? (
          /* Full image preview - 3 images in a row */
          <div className="grid grid-cols-3 gap-1 p-1">
            {PHOTO_TYPES.map(photoType => {
              const sub = photoByType.get(photoType);
              const imageUrl = sub?.r2ImageId
                ? getImageUrl(sub.r2ImageId)
                : null;
              const hasFailed = sub ? failedImages.has(sub.id) : false;

              return (
                <div
                  key={photoType}
                  className={`aspect-[4/3] relative ${sub ? 'bg-neutral-600' : 'bg-neutral-600/50'}`}
                >
                  {sub && imageUrl && !hasFailed ? (
                    <img
                      src={imageUrl}
                      alt={sub.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(sub.id));
                      }}
                    />
                  ) : hasFailed ? (
                    <div className="w-full h-full flex items-center justify-center bg-red-950/50">
                      <span className="text-xl">⚠️</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <span className="text-xl">🖼️</span>
                    </div>
                  )}
                  <div className="absolute bottom-0.5 left-0.5 text-[9px] bg-black/70 text-slate-300 px-1 py-0.5 rounded capitalize">
                    {photoType.charAt(0)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Simple icon-based preview - no images loaded */
          <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2 p-4">
            <div className="text-4xl">🖼️</div>
            <div className="flex items-center gap-1.5 text-sm">
              <span
                className={`font-medium ${isIncomplete ? 'text-orange-400' : 'text-slate-300'}`}
              >
                {photoCount}/{PHOTO_TYPES.length} foto
              </span>
            </div>
            <div className="flex gap-1 text-xs text-slate-500">
              {PHOTO_TYPES.map(type => {
                const hasType = portfolioSubmissions.some(
                  s => s.portfolioPhotoType === type
                );
                return (
                  <span
                    key={type}
                    className={`px-1.5 py-0.5 rounded ${hasType ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-600'}`}
                  >
                    {type.charAt(0).toUpperCase()}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Status badges - portfolio level */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {firstPhoto.placement && (
            <span
              className={`${PLACEMENTS.find(p => p.value === firstPhoto.placement)?.color} w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg`}
            >
              {PLACEMENTS.find(p => p.value === firstPhoto.placement)?.label}
            </span>
          )}
          {firstPhoto.flagStatus === 'shortlisted' && (
            <span className="bg-emerald-500 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg">
              ✓
            </span>
          )}
          {firstPhoto.flagStatus === 'rejected' && (
            <span className="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg">
              ✗
            </span>
          )}
        </div>

        {/* Rating badge - portfolio level */}
        {firstPhoto.rating && firstPhoto.rating > 0 && (
          <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400">
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
                  setPortfolioRating(
                    portfolioSubmissions.map(s => s.id),
                    stars
                  );
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
                setPortfolioFlag(
                  portfolioSubmissions.map(s => s.id),
                  'shortlisted'
                );
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
                setPortfolioFlag(
                  portfolioSubmissions.map(s => s.id),
                  'rejected'
                );
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
                  setPortfolioPlacement(
                    portfolioSubmissions.map(s => s.id),
                    p.value,
                    firstPhoto.categoryId
                  );
                }}
                className={`w-7 h-7 rounded text-sm font-bold transition-all ${
                  firstPhoto.placement === p.value
                    ? `${p.color} text-white scale-110`
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
                  setPortfolioPlacement(
                    portfolioSubmissions.map(s => s.id),
                    null,
                    firstPhoto.categoryId
                  );
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
                  isMediterranean ? (
                    /* Mediterranean Winners - Single column ordered layout */
                    <div className="grid grid-cols-1 gap-6">
                      {['first', 'second', 'third', 'runner-up'].map(
                        placement => {
                          const placementInfo = PLACEMENTS.find(
                            p => p.value === placement
                          );
                          const placementPortfolios = portfoliosList.filter(p =>
                            p.submissions.some(s => s.placement === placement)
                          );

                          if (placementPortfolios.length === 0) return null;

                          return (
                            <div key={placement} className="space-y-6">
                              <h3 className="text-lg font-medium flex items-center gap-2">
                                <span
                                  className={`${placementInfo?.color} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                                >
                                  {placementInfo?.label}
                                </span>
                                <span className="text-slate-300">
                                  {placement === 'first' && '🥇 1° Posto'}
                                  {placement === 'second' && '🥈 2° Posto'}
                                  {placement === 'third' && '🥉 3° Posto'}
                                  {placement === 'runner-up' &&
                                    `Menzioni (${placementPortfolios.length})`}
                                </span>
                              </h3>
                              <div className="grid grid-cols-1 gap-6">
                                {placementPortfolios.map(portfolio =>
                                  renderPortfolioCard(
                                    portfolio.portfolioId,
                                    portfolio.submissions,
                                    true // Show images in vincitori view
                                  )
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    /* Non-Mediterranean Winners - Elegant podium layout */
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
                                  className={`${isFirst ? 'ring-2 ring-yellow-500/50' : ''} rounded-lg overflow-hidden`}
                                >
                                  {renderSubmissionCard(winner, 'large')}
                                </div>
                              ) : (
                                <div className="aspect-[4/3] bg-slate-800/50 rounded-lg flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-700 gap-2">
                                  <span className="text-4xl">🏆</span>
                                  <span className="text-sm">Non assegnato</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Runner-ups */}
                      {sortedSubmissions.filter(
                        s => s.placement === 'runner-up'
                      ).length > 0 && (
                        <div className="mt-8 pt-8 border-t border-slate-800">
                          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                            <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                              M
                            </span>
                            <span className="text-slate-300">
                              Menzioni (
                              {
                                sortedSubmissions.filter(
                                  s => s.placement === 'runner-up'
                                ).length
                              }
                              )
                            </span>
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {sortedSubmissions
                              .filter(s => s.placement === 'runner-up')
                              .map(submission =>
                                renderSubmissionCard(submission, 'normal')
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : isMediterranean && groupedByUser ? (
                  filterStatus === 'shortlisted' ? (
                    // Full-width cards with images for Selezionati - draggable
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-slate-500">
                          <GripVertical className="w-3 h-3 inline mr-1" />
                          Trascina per riordinare
                        </p>
                        <button
                          type="button"
                          onClick={resetPortfolioOrder}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          Ripristina ordine
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {orderedShortlistedPortfolios.map(portfolio => (
                          <div
                            key={portfolio.portfolioId}
                            draggable
                            onDragStart={e =>
                              handlePortfolioDragStart(e, portfolio.id)
                            }
                            onDragOver={handlePortfolioDragOver}
                            onDrop={e => handlePortfolioDrop(e, portfolio.id)}
                            onDragEnd={handlePortfolioDragEnd}
                            className={`relative transition-all ${
                              draggedPortfolioId === portfolio.id
                                ? 'opacity-50 scale-[0.98]'
                                : ''
                            }`}
                          >
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 cursor-grab active:cursor-grabbing z-10">
                              <GripVertical className="w-5 h-5 text-slate-500 hover:text-white transition-colors" />
                            </div>
                            {renderPortfolioCard(
                              portfolio.portfolioId,
                              portfolio.submissions,
                              true // Show images for Selezionati
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Compact preview for Tutti/In Attesa/Scartati
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
                  )
                ) : filterStatus === 'shortlisted' ? (
                  // Non-Mediterranean shortlisted - draggable
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-slate-500">
                        <GripVertical className="w-3 h-3 inline mr-1" />
                        Trascina per riordinare
                      </p>
                      <button
                        type="button"
                        onClick={resetSubmissionOrder}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Ripristina ordine
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {orderedShortlistedSubmissions.map(submission => (
                        <div
                          key={submission.id}
                          draggable
                          onDragStart={e =>
                            handleSubmissionDragStart(e, submission.id)
                          }
                          onDragOver={handleSubmissionDragOver}
                          onDrop={e => handleSubmissionDrop(e, submission.id)}
                          onDragEnd={handleSubmissionDragEnd}
                          className={`relative transition-all ${
                            draggedSubmissionId === submission.id
                              ? 'opacity-50 scale-95'
                              : ''
                          }`}
                        >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full pb-1 cursor-grab active:cursor-grabbing z-10 opacity-0 hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-slate-400 rotate-90" />
                          </div>
                          {renderSubmissionCard(submission, 'large')}
                        </div>
                      ))}
                    </div>
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
                    <div className="max-w-md">
                      <div className="text-white font-medium">
                        {inspectedSubmission.title}
                      </div>
                      {inspectedSubmission.description?.trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            setDescriptionExpanded(!descriptionExpanded)
                          }
                          className={`text-slate-400 text-xs mt-0.5 text-left hover:text-slate-300 transition-colors ${descriptionExpanded ? '' : 'line-clamp-2'}`}
                        >
                          {inspectedSubmission.description}
                          {!descriptionExpanded &&
                            inspectedSubmission.description.length > 100 && (
                              <span className="text-cyan-400 ml-1">...</span>
                            )}
                        </button>
                      )}
                      <div className="text-slate-500 text-xs mt-1">
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
                    className="flex-1 bg-neutral-600 overflow-auto flex items-center justify-center cursor-zoom-in p-4"
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
                      src={
                        inspectedSubmission.r2ImageId
                          ? getImageUrl(inspectedSubmission.r2ImageId)
                          : ''
                      }
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
                            ? `${p.color} text-white scale-110`
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
                        className="flex-1 bg-neutral-600 overflow-auto flex items-center justify-center cursor-zoom-in p-4"
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
                          <div className="flex flex-col items-center gap-3 text-center">
                            <span className="text-5xl">⚠️</span>
                            <span className="text-red-400 font-medium">
                              Impossibile caricare l'immagine
                            </span>
                          </div>
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
                      {zoomedPhoto.description?.trim() && (
                        <button
                          type="button"
                          onClick={() =>
                            setDescriptionExpanded(!descriptionExpanded)
                          }
                          className={`text-xs text-slate-400 mt-1 max-w-md mx-auto hover:text-slate-300 transition-colors ${descriptionExpanded ? '' : 'line-clamp-2'}`}
                        >
                          {zoomedPhoto.description}
                          {!descriptionExpanded &&
                            zoomedPhoto.description.length > 100 && (
                              <span className="text-cyan-400 ml-1">...</span>
                            )}
                        </button>
                      )}
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
                      const imageUrl = sub.r2ImageId
                        ? getImageUrl(sub.r2ImageId)
                        : null;
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
                          <div className="aspect-[4/3] bg-neutral-600 relative overflow-hidden">
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
                            ) : failedImages.has(sub.id) ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/50 gap-2">
                                <span className="text-3xl">⚠️</span>
                                <span className="text-xs text-red-400">
                                  Errore caricamento
                                </span>
                              </div>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                                <span className="text-3xl">🖼️</span>
                                <span className="text-xs">
                                  Nessuna immagine
                                </span>
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
                              inspectedPortfolio.submissions.map(s => s.id),
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
                          inspectedPortfolio.submissions.map(s => s.id),
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
                          inspectedPortfolio.submissions.map(s => s.id),
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
                            inspectedPortfolio.submissions.map(s => s.id),
                            p.value,
                            inspectedPortfolio.submissions[0]?.categoryId || ''
                          )
                        }
                        className={`w-8 h-8 rounded text-sm font-bold transition-all ${
                          inspectedPortfolio.submissions[0]?.placement ===
                          p.value
                            ? `${p.color} text-white scale-110`
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
                            inspectedPortfolio.submissions.map(s => s.id),
                            null,
                            inspectedPortfolio.submissions[0]?.categoryId || ''
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

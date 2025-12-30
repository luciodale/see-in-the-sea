import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import {
  Check,
  Eye,
  RotateCcw,
  Send,
  Star,
  Trophy,
  X,
  ZoomOut,
} from 'lucide-react';
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
  isSubmitted?: boolean;
};

const PLACEMENTS: { value: Placement; label: string; color: string }[] = [
  { value: 'first', label: '1°', color: 'bg-yellow-500' },
  { value: 'second', label: '2°', color: 'bg-gray-400' },
  { value: 'third', label: '3°', color: 'bg-amber-600' },
  { value: 'runner-up', label: 'M', color: 'bg-blue-500' }, // M = Menzione
];

const STAR_COLORS = [
  'text-slate-600',
  'text-red-400',
  'text-orange-400',
  'text-yellow-400',
  'text-lime-400',
  'text-emerald-400',
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectedImage, setInspectedImage] = useState<{
    url: string;
    title: string;
    description: string | null;
  } | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Zoom state for inspect modal
  const [zoomLevel, setZoomLevel] = useState(1);
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

  // Reset zoom when closing modal
  useEffect(() => {
    if (!inspectedImage) {
      setZoomLevel(1);
    }
  }, [inspectedImage]);

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

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inspectedImage) {
          setInspectedImage(null);
        } else if (selectedId) {
          setSelectedId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedImage, selectedId]);

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

  // Group Mediterranean submissions by portfolio
  const isMediterranean = activeCategory === 'mediterranean';
  const groupedByPortfolio = isMediterranean
    ? sortedSubmissions.reduce(
        (acc, s) => {
          const key = s.portfolio || 'ungrouped';
          if (!acc[key]) acc[key] = [];
          acc[key].push(s);
          return acc;
        },
        {} as Record<string, JudgingSubmission[]>
      )
    : null;

  // Counts
  const counts = {
    total: categorySubmissions.length,
    shortlisted: categorySubmissions.filter(s => s.flagStatus === 'shortlisted')
      .length,
    rejected: categorySubmissions.filter(s => s.flagStatus === 'rejected')
      .length,
    pending: categorySubmissions.filter(s => s.flagStatus === 'pending').length,
    winners: categorySubmissions.filter(s => s.placement !== null).length,
  };

  const placementCounts = categorySubmissions.reduce(
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
    const isSelected = selectedId === submission.id;
    const isRejected = submission.flagStatus === 'rejected';

    return (
      <div
        key={submission.id}
        role="button"
        tabIndex={0}
        className={`relative rounded-lg overflow-hidden bg-slate-900 border-2 transition-all cursor-pointer ${
          isSelected
            ? 'border-emerald-500 ring-2 ring-emerald-500/50 scale-[1.02]'
            : isRejected
              ? 'border-red-500/50 opacity-40'
              : submission.flagStatus === 'shortlisted'
                ? 'border-emerald-500/50'
                : 'border-slate-800 hover:border-slate-600'
        }`}
        onClick={() => setSelectedId(isSelected ? null : submission.id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedId(isSelected ? null : submission.id);
          }
        }}
      >
        {/* Image */}
        <div
          className={`${size === 'large' ? 'aspect-[4/3]' : 'aspect-square'} bg-slate-800 relative group`}
        >
          {imageUrl && !failedImages.has(submission.id) ? (
            <>
              <img
                src={imageUrl}
                alt={submission.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => {
                  setFailedImages(prev => new Set(prev).add(submission.id));
                }}
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setInspectedImage({
                    url: imageUrl,
                    title: submission.title,
                    description: submission.description,
                  });
                }}
                className="absolute top-2 right-2 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Ispeziona immagine"
              >
                <Eye className="w-5 h-5 text-white" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <span className="text-4xl">📷</span>
              <span className="text-xs">#{submission.id.slice(0, 6)}</span>
            </div>
          )}
        </div>

        {/* Placement Badge */}
        {submission.placement && (
          <div className="absolute top-2 left-2">
            <span
              className={`${PLACEMENTS.find(p => p.value === submission.placement)?.color} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg`}
            >
              {PLACEMENTS.find(p => p.value === submission.placement)?.label}
            </span>
          </div>
        )}

        {/* Rating Badge */}
        {submission.rating && submission.rating > 0 && (
          <div className="absolute top-2 right-14 flex items-center gap-0.5 bg-black/60 px-2 py-1 rounded-full">
            {[...Array(submission.rating)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 fill-current ${STAR_COLORS[submission.rating || 0]}`}
              />
            ))}
          </div>
        )}

        {/* Flag Badge */}
        {submission.flagStatus !== 'pending' && (
          <div className="absolute bottom-16 left-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg ${
                submission.flagStatus === 'shortlisted'
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            >
              {submission.flagStatus === 'shortlisted' ? '✓' : '✗'}
            </span>
          </div>
        )}

        {/* Title & Description */}
        <div className="p-2 bg-slate-900">
          <p className="text-sm text-white font-medium truncate">
            {submission.title}
          </p>
          {submission.description && (
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {submission.description}
            </p>
          )}
          {submission.portfolioPhotoType && (
            <p className="text-xs text-slate-500 capitalize mt-0.5">
              {submission.portfolioPhotoType}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {isSelected && (
          <div className="absolute inset-x-0 bottom-14 p-2 bg-gradient-to-t from-black via-black/90 to-transparent">
            {/* Star Rating */}
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  key={stars}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setRating(submission.id, stars);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    submission.rating === stars
                      ? 'bg-yellow-500 ring-2 ring-white scale-110'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                  title={`Valuta ${stars} stelle`}
                >
                  <span className="text-sm font-bold">{stars}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setFlagStatus(submission.id, 'shortlisted');
                }}
                className={`bg-emerald-600 hover:bg-emerald-500 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  submission.flagStatus === 'shortlisted'
                    ? 'ring-2 ring-white scale-110'
                    : ''
                }`}
                title="Seleziona"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setFlagStatus(submission.id, 'rejected');
                }}
                className={`bg-red-600 hover:bg-red-500 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  submission.flagStatus === 'rejected'
                    ? 'ring-2 ring-white scale-110'
                    : ''
                }`}
                title="Scarta"
              >
                ✗
              </button>

              <div className="w-px bg-slate-600 mx-1" />

              {PLACEMENTS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setPlacement(submission.id, p.value);
                  }}
                  className={`${p.color} hover:opacity-90 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    submission.placement === p.value
                      ? 'ring-2 ring-white scale-110'
                      : ''
                  }`}
                  title={p.label}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPlacement(submission.id, null);
                }}
                className="bg-slate-700 hover:bg-slate-600 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                title="Rimuovi piazzamento"
              >
                ✕
              </button>
            </div>
          </div>
        )}
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
                        setSelectedId(null);
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
                  /* Winners Preview - Nice layout */
                  <div className="space-y-6">
                    {['first', 'second', 'third', 'runner-up'].map(
                      placement => {
                        const winners = sortedSubmissions.filter(
                          s => s.placement === placement
                        );
                        if (winners.length === 0) return null;

                        const placementInfo = PLACEMENTS.find(
                          p => p.value === placement
                        );

                        return (
                          <div key={placement}>
                            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                              <span
                                className={`${placementInfo?.color} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                              >
                                {placementInfo?.label}
                              </span>
                              <span className="text-slate-300">
                                {placement === 'first' && '1° Posto'}
                                {placement === 'second' && '2° Posto'}
                                {placement === 'third' && '3° Posto'}
                                {placement === 'runner-up' && 'Menzione'}
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {winners.map(submission =>
                                renderSubmissionCard(submission, 'large')
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : isMediterranean && groupedByPortfolio ? (
                  <div className="space-y-8">
                    {Object.entries(groupedByPortfolio).map(
                      ([portfolioId, portfolioSubmissions]) => (
                        <div
                          key={portfolioId}
                          className="bg-slate-900/50 rounded-xl p-4 border border-slate-800"
                        >
                          <h3 className="text-lg font-medium mb-4 text-slate-300">
                            Portfolio {portfolioId}
                            <span className="text-sm text-slate-500 ml-2">
                              ({portfolioSubmissions.length}/3 foto)
                            </span>
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {portfolioSubmissions.map(submission =>
                              renderSubmissionCard(submission, 'large')
                            )}
                          </div>
                        </div>
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

            {/* Inspect Modal - Click to zoom, only X or ESC to close */}
            {inspectedImage && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={inspectedImage.title}
                className="fixed inset-0 bg-black z-50 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-black/50 absolute top-0 left-0 right-0 z-10">
                  <div>
                    <div className="text-white text-lg font-light">
                      {inspectedImage.title}
                    </div>
                    {inspectedImage.description && (
                      <div className="text-slate-400 text-sm mt-1">
                        {inspectedImage.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm px-3 py-1 bg-slate-800 rounded">
                      {Math.round(zoomLevel * 100)}% — Clicca per ingrandire
                    </span>
                    {zoomLevel > 1 && (
                      <button
                        type="button"
                        className="w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center"
                        onClick={() => setZoomLevel(1)}
                        aria-label="Reimposta zoom"
                      >
                        <ZoomOut className="w-5 h-5 text-white" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center"
                      onClick={() => setInspectedImage(null)}
                      aria-label="Chiudi"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Zoomable Image - Click increases zoom */}
                <div
                  ref={imageContainerRef}
                  role="button"
                  tabIndex={0}
                  className="flex-1 overflow-auto flex items-center justify-center cursor-zoom-in pt-20"
                  onClick={() => setZoomLevel(z => (z >= 4 ? 1 : z + 0.5))}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setZoomLevel(z => (z >= 4 ? 1 : z + 0.5));
                    }
                  }}
                >
                  <img
                    src={inspectedImage.url}
                    alt={inspectedImage.title}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease-out',
                    }}
                    className="max-w-[95vw] max-h-[90vh] object-contain"
                    draggable={false}
                  />
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

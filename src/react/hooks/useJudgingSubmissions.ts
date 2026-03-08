import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
  SyncStatus,
} from '../types/judging';

type UseJudgingSubmissionsParams = {
  contestId: string | null;
  activeCategory: string;
};

type UseJudgingSubmissionsResult = {
  submissions: JudgingSubmission[];
  loading: boolean;
  error: string | null;
  syncStatus: SyncStatus;
  fetchSubmissions: () => Promise<void>;
  setPlacement: (submissionId: string, placement: Placement) => void;
  setFlagStatus: (submissionId: string, status: FlagStatus) => void;
  setPortfolioFlag: (submissionIds: string[], status: FlagStatus) => void;
  setPortfolioPlacement: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
  submitResults: () => Promise<void>;
  resetJudging: () => Promise<void>;
};

export function useJudgingSubmissions({
  contestId,
  activeCategory,
}: UseJudgingSubmissionsParams): UseJudgingSubmissionsResult {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState<JudgingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToServer = useCallback(
    async (
      submissionId: string,
      type: 'placement' | 'flag',
      value: Placement | FlagStatus | null
    ) => {
      try {
        setSyncStatus('syncing');
        const token = await getToken();

        const body =
          type === 'placement'
            ? { action: 'set-placement', submissionId, placement: value }
            : { action: 'set-flag', submissionId, status: value };

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

  const fetchSubmissions = useCallback(async () => {
    if (!contestId) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const res = await fetch(
        `/api/admin/judging?contestId=${contestId}&categoryId=${activeCategory}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
        const isUniquePlacement =
          placement === 'first' ||
          placement === 'second' ||
          placement === 'third';

        if (isUniquePlacement && placement && categoryId) {
          const otherSubmissionsWithPlacement = prev.filter(
            s =>
              s.categoryId === categoryId &&
              !idSet.has(s.id) &&
              s.placement === placement
          );
          otherSubmissionsWithPlacement.forEach(s => {
            syncToServer(s.id, 'placement', null);
          });
        }

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

  const resetJudging = useCallback(async () => {
    if (!contestId) return;
    if (
      !confirm(
        'Azzerare i dati della giuria per questo concorso? Questo cancellerà valutazioni, flag e piazzamenti del concorso selezionato.'
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

  return {
    submissions,
    loading,
    error,
    syncStatus,
    fetchSubmissions,
    setPlacement,
    setFlagStatus,
    setPortfolioFlag,
    setPortfolioPlacement,
    submitResults,
    resetJudging,
  };
}

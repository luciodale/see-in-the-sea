import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useState } from 'react';
import type { ContestSummary } from '../../types/api';
import type { AdminSearchParams } from '../adminSearchSchema';

type UseAdminContestIdResult = {
  contestId: string | null;
  contests: ContestSummary[];
  loading: boolean;
  setContestId: (id: string) => void;
};

export function useAdminContestId(
  searchParams: AdminSearchParams,
  navigateToContest: (id: string) => void
): UseAdminContestIdResult {
  const { getToken } = useAuth();
  const [contests, setContests] = useState<ContestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const contestId = searchParams.contestId ?? null;

  useEffect(() => {
    async function fetchContests() {
      try {
        const token = await getToken();
        const res = await fetch('/api/admin/all-contests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json()) as {
          success: boolean;
          data?: ContestSummary[];
        };
        if (data.success && data.data && data.data.length > 0) {
          setContests(data.data);

          const isValid = data.data.some(c => c.id === searchParams.contestId);
          if (!searchParams.contestId || !isValid) {
            navigateToContest(data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching contests:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchContests();
  }, [getToken, navigateToContest, searchParams.contestId]);

  const setContestId = useCallback(
    (id: string) => {
      navigateToContest(id);
    },
    [navigateToContest]
  );

  return { contestId, contests, loading, setContestId };
}

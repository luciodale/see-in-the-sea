import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useState } from 'react';
import type {
  ContestDetailsData,
  ContestDetailsResponse,
} from '../../types/api';

// The endpoint also returns past submissions, but this page only manages judges
type ContestManagementData = Pick<ContestDetailsData, 'contest' | 'judges'>;

export const useContestManagement = (year: number) => {
  const { getToken } = useAuth();
  const [data, setData] = useState<ContestManagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContestData = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setIsLoading(true);
        setError(null);

        const token = await getToken();
        const contestId = `uw-${year}`;
        const response = await fetch(
          `/api/admin/contest-details?contestId=${contestId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result: ContestDetailsResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.message || 'Errore nel caricamento del concorso'
          );
        }

        setData(result.data);
      } catch (err) {
        console.error('Error fetching contest data:', err);
        setError(err instanceof Error ? err.message : 'Errore imprevisto');
      } finally {
        setIsLoading(false);
      }
    },
    [getToken, year]
  );

  useEffect(() => {
    fetchContestData();
  }, [fetchContestData]);

  // Refetch after a mutation without unmounting the judges panel
  const refreshData = () => {
    fetchContestData(true);
  };

  return {
    data,
    isLoading,
    error,
    refreshData,
  };
};

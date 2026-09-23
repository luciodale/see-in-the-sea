import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { ContestYearsResponse } from '../../types/api';

// The judges pages only need the list of editions; creating one is done
// outside the admin UI.
export function useOldContestYears() {
  const { getToken } = useAuth();
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function fetchYears() {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch('/api/admin/old-contests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result: ContestYearsResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || 'Impossibile caricare le edizioni');
        }
        if (isCurrent) setYears(result.data.years);
      } catch (fetchError) {
        console.error('Error loading contest years:', fetchError);
        if (isCurrent) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Impossibile caricare le edizioni'
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchYears();

    return () => {
      isCurrent = false;
    };
  }, [getToken]);

  return { years, isLoading, error };
}

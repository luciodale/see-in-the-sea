import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type {
  AdminSubmission,
  AdminSubmissionsResponse,
} from '../../types/api';

const FETCH_ERROR = 'Impossibile recuperare le submission';

export function useAdminSubmissions(contestId: string) {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function fetchSubmissions() {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Token di autenticazione non disponibile');
        }

        // Fetch every submission for the contest; filtering happens client side
        const response = await fetch(
          `/api/admin/manage-submissions?contestId=${contestId}&limit=10000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result: AdminSubmissionsResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(FETCH_ERROR);
        }

        if (isCurrent) setSubmissions(result.data || []);
      } catch (fetchError) {
        console.error('Error fetching submissions:', fetchError);
        if (isCurrent) {
          setError(
            fetchError instanceof Error ? fetchError.message : FETCH_ERROR
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchSubmissions();

    return () => {
      isCurrent = false;
    };
  }, [getToken, contestId]);

  return { submissions, isLoading, error };
}

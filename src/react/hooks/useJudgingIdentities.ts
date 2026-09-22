import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { AdminSubmissionsResponse } from '../../types/api';
import { formatFullName } from '../utils/adminFormat';

export type JudgingIdentity = {
  name: string;
  email: string;
};

export type JudgingIdentities = ReadonlyMap<string, JudgingIdentity>;

type LoadedIdentities = {
  contestId: string;
  identities: JudgingIdentities;
};

// Judging is anonymous; authors are fetched only once the admin asks to
// reveal them, and kept per contest.
export function useJudgingIdentities(
  contestId: string | null,
  isRevealed: boolean
) {
  const { getToken } = useAuth();
  const [loaded, setLoaded] = useState<LoadedIdentities | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const identities =
    loaded && loaded.contestId === contestId ? loaded.identities : null;

  useEffect(() => {
    if (!isRevealed || !contestId || identities) return;
    let isCurrent = true;

    async function fetchIdentities(currentContestId: string) {
      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Token di autenticazione non disponibile');

        const response = await fetch(
          `/api/admin/manage-submissions?contestId=${currentContestId}&limit=10000`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result: AdminSubmissionsResponse = await response.json();
        if (!response.ok || !result.success) {
          throw new Error('Impossibile recuperare i nomi');
        }

        const map = new Map<string, JudgingIdentity>(
          (result.data || []).map(submission => [
            submission.id,
            {
              name: formatFullName(submission.firstName, submission.lastName),
              email: submission.userEmail,
            },
          ])
        );
        if (isCurrent) {
          setLoaded({ contestId: currentContestId, identities: map });
        }
      } catch (error) {
        console.error('Error fetching judging identities:', error);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchIdentities(contestId);

    return () => {
      isCurrent = false;
    };
  }, [isRevealed, contestId, identities, getToken]);

  return { identities: isRevealed ? identities : null, isLoading };
}

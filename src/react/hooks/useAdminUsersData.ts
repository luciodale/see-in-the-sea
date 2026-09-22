import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type {
  AdminUsersData,
  AdminUsersResponse,
} from '../../pages/api/admin/users';

export type AdminUserWithoutUploads =
  AdminUsersData['usersWithoutUploads'][number];

export function useAdminUsersData(contestId: string) {
  const { getToken } = useAuth();
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersWithoutUploads, setUsersWithoutUploads] = useState<
    AdminUserWithoutUploads[]
  >([]);
  const [userPayments, setUserPayments] = useState<
    AdminUsersData['userPayments']
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function fetchUsersData() {
      setIsLoading(true);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error('Token di autenticazione non disponibile');
        }

        const response = await fetch(
          `/api/admin/users?contestId=${contestId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result: AdminUsersResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error('Impossibile recuperare i dati degli utenti');
        }

        if (isCurrent) {
          setTotalUsers(result.data.totalUsers);
          setUsersWithoutUploads(result.data.usersWithoutUploads);
          setUserPayments(result.data.userPayments);
        }
      } catch (fetchError) {
        console.error('Error fetching users data:', fetchError);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    fetchUsersData();

    return () => {
      isCurrent = false;
    };
  }, [getToken, contestId]);

  return { totalUsers, usersWithoutUploads, userPayments, isLoading };
}

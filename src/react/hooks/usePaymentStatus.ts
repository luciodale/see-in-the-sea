import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { PaymentStatusResponse } from '../../types/api';

export function usePaymentStatus(contestId: string | null) {
  const { getToken } = useAuth();
  const [hasPaid, setHasPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contestId) {
      setLoading(false);
      return;
    }

    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await getToken();
        if (!token) {
          throw new Error('Authentication token not available');
        }

        const response = await fetch(
          `/api/payment-status?contestId=${encodeURIComponent(contestId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to check payment status');
        }

        const result: PaymentStatusResponse = await response.json();

        if (result.success && result.data) {
          setHasPaid(result.data.hasPaid);
        } else {
          throw new Error(result.message || 'Failed to check payment status');
        }
      } catch (err) {
        console.error('Error checking payment status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setHasPaid(false);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [contestId, getToken]);

  return { hasPaid, loading, error };
}

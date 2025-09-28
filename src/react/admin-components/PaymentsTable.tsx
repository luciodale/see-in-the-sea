import { useEffect, useState } from 'react';
import type {
  AdminPayment,
  AdminPaymentsResponse,
  DeletePaymentResponse,
} from '../../types/api';

export function PaymentsTable() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/payments');
      const data: AdminPaymentsResponse = await response.json();

      if (data.success && data.data) {
        setPayments(data.data);
      } else {
        setError(data.message || 'Failed to fetch payments');
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete payment
  const deletePayment = async (paymentId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this payment? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setDeletingId(paymentId);

      const response = await fetch(`/api/admin/payments/delete/${paymentId}`, {
        method: 'DELETE',
      });
      const data: DeletePaymentResponse = await response.json();

      if (data.success) {
        // Remove the payment from the list
        setPayments(prev => prev.filter(payment => payment.id !== paymentId));
      } else {
        alert(data.message || 'Failed to delete payment');
      }
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert('Failed to delete payment');
    } finally {
      setDeletingId(null);
    }
  };

  // Format amount from cents to euros
  const formatAmount = (amountInCents: number, currency: string) => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-slate-300">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
        <div className="text-red-300 font-medium">Error</div>
        <div className="text-red-200 mt-1">{error}</div>
        <button
          onClick={fetchPayments}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">
          💳 Payments Management
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          {payments.length} payment{payments.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/40">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                User Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Contest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Paid At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Stripe Session
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No payments found
                </td>
              </tr>
            ) : (
              payments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {payment.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {payment.contestName || 'Unknown Contest'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {formatAmount(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                    {formatDate(payment.paidAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 font-mono">
                    {payment.stripeSessionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => deletePayment(payment.id)}
                      disabled={deletingId === payment.id}
                      className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {deletingId === payment.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

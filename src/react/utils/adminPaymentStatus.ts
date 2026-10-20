import { formatAmount } from './adminFormat';

export type AdminPaymentStatus = 'unpaid' | 'due' | 'paid';

type PaymentTotals = { paidCents: number; balanceCents: number };

// "due" is an entrant who paid but has since added a category: the owner
// decides at the deadline whether to chase them or drop the extra photos
export function adminPaymentStatus({ paidCents, balanceCents }: PaymentTotals) {
  if (paidCents <= 0) return 'unpaid' satisfies AdminPaymentStatus;
  if (balanceCents > 0) return 'due' satisfies AdminPaymentStatus;
  return 'paid' satisfies AdminPaymentStatus;
}

export function adminPaymentLabel(totals: PaymentTotals) {
  const status = adminPaymentStatus(totals);
  if (status === 'unpaid') return 'Non pagato';
  if (status === 'due')
    return `Da saldare ${formatAmount(totals.balanceCents)}`;
  return 'Pagato';
}

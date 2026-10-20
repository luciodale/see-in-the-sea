// The entry fee depends only on how many categories hold at least one photo:
// one category costs 20€, two or more cost 30€. Payments add up and are never
// refunded, so an entrant who paid 20€ and adds a category owes 10€ more.
export const SINGLE_CATEGORY_FEE_CENTS = 2000;
export const MULTI_CATEGORY_FEE_CENTS = 3000;

export function entryFeeCents(categoryCount: number) {
  if (categoryCount <= 0) return 0;
  if (categoryCount === 1) return SINGLE_CATEGORY_FEE_CENTS;
  return MULTI_CATEGORY_FEE_CENTS;
}

// Positive means money is owed; zero or negative means the entry is covered.
export function entryBalanceCents(categoryCount: number, paidCents: number) {
  return entryFeeCents(categoryCount) - paidCents;
}

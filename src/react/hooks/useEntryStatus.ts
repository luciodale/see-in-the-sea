import { useMemo } from 'react';
import { entryBalanceCents } from '../../constants/entryFee';
import type { UICategory } from '../../types/ui';

// pay: first payment. topup: paid, then added a category, so 10€ is owed.
// settled: everything entered is paid for, and photos stay editable.
export type EntryNextAction = 'upload' | 'pay' | 'topup' | 'settled' | 'closed';

type UseEntryStatusParams = {
  categories: UICategory[];
  contestStatus: 'active' | 'inactive' | 'assessment';
  paidCents: number;
};

export function nextActionFor(
  contestStatus: UseEntryStatusParams['contestStatus'],
  uploaded: number,
  paidCents: number,
  balanceCents: number
): EntryNextAction {
  if (uploaded > 0 && paidCents > 0 && balanceCents <= 0) return 'settled';
  if (contestStatus !== 'active') return 'closed';
  if (uploaded === 0) return 'upload';
  return paidCents > 0 ? 'topup' : 'pay';
}

// One source of truth for "where am I" on the upload page: how many photos
// are in, where the next free slot is, whether uploading is still open, and
// what is still owed. Paying never locks the entry; closing the contest does.
export function useEntryStatus({
  categories,
  contestStatus,
  paidCents,
}: UseEntryStatusParams) {
  return useMemo(() => {
    const uploaded = categories.reduce(
      (sum, category) => sum + category.submissions.length,
      0
    );
    const categoriesEntered = categories.filter(
      category => category.submissions.length > 0
    ).length;
    const firstIncomplete = categories.find(
      category => category.submissions.length < category.maxSubmissions
    );
    const canUpload = contestStatus === 'active';
    const balanceCents = entryBalanceCents(categoriesEntered, paidCents);
    const nextAction = nextActionFor(
      contestStatus,
      uploaded,
      paidCents,
      balanceCents
    );

    return {
      uploaded,
      categoriesEntered,
      firstIncompleteId: firstIncomplete?.id ?? null,
      canUpload,
      balanceCents,
      isSettled: nextAction === 'settled',
      nextAction,
    };
  }, [categories, contestStatus, paidCents]);
}

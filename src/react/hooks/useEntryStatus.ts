import { useMemo } from 'react';
import type { UICategory } from '../../types/ui';

export type EntryNextAction = 'upload' | 'pay' | 'locked' | 'closed';

type UseEntryStatusParams = {
  categories: UICategory[];
  contestStatus: 'active' | 'inactive' | 'assessment';
  hasPaid: boolean;
};

function nextActionFor(
  canUpload: boolean,
  hasPaid: boolean,
  uploaded: number,
  contestStatus: UseEntryStatusParams['contestStatus']
): EntryNextAction {
  if (hasPaid) return 'locked';
  if (contestStatus !== 'active') return 'closed';
  if (!canUpload || uploaded === 0) return 'upload';
  return 'pay';
}

// One source of truth for "where am I" on the upload page: how many photos
// are in, where the next free slot is, and whether uploading is still open.
export function useEntryStatus({
  categories,
  contestStatus,
  hasPaid,
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
    const canUpload = contestStatus === 'active' && !hasPaid;

    return {
      uploaded,
      categoriesEntered,
      hasSubmissions: uploaded > 0,
      firstIncompleteId: firstIncomplete?.id ?? null,
      canUpload,
      isLocked: hasPaid,
      nextAction: nextActionFor(canUpload, hasPaid, uploaded, contestStatus),
    };
  }, [categories, contestStatus, hasPaid]);
}

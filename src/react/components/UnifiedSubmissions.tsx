import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_MAX_SUBMISSIONS_PER_CATEGORY,
  MEDITERRANEAN_CATEGORY_ID,
} from '../../constants';
import { CURRENT_CONTEST_CATEGORIES } from '../../constants/categories';
import { useI18n } from '../../i18n/react';
import type { SubmissionsResponse, UploadResponse } from '../../types/api';
import type { UICategory, UISubmission } from '../../types/ui';
import { useEntryStatus } from '../hooks/useEntryStatus';
import { useJustUploaded } from '../hooks/useJustUploaded';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import { CategoryNavigation } from './CategoryNavigation';
import { CategorySummary } from './CategorySummary';
import { ContestCountdown } from './ContestCountdown';
import { ContestStatusBanner } from './ContestStatusBanner';
import { EntryStatus } from './EntryStatus';
import { JudgesBar } from './JudgesBar';
import { MediterraneanPortfolioManager } from './MediterraneanPortfolioManager';
import { PaymentBanner } from './PaymentBanner';
import { PaymentSuccessBanner } from './PaymentSuccessBanner';
import { SubmissionManageModal } from './SubmissionManageModal';
import { SuccessModal } from './SuccessModal';
import { UploadModal } from './UploadModal';
import { Eyebrow } from './ui/Eyebrow';

type CategoryState = UICategory;

export function UnifiedSubmissions() {
  const { t } = useI18n();

  // Core state
  const [contestId, setContestId] = useState<string | null>(null);
  const [contestYear, setContestYear] = useState<number | null>(null);
  const [judges, setJudges] = useState<string[]>([]);
  const [contestStatus, setContestStatus] = useState<
    'active' | 'inactive' | 'assessment'
  >('inactive');
  const [categories, setCategories] = useState<CategoryState[]>(
    CURRENT_CONTEST_CATEGORIES.map(c => ({
      ...c,
      submissions: [],
      maxSubmissions: DEFAULT_MAX_SUBMISSIONS_PER_CATEGORY,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noActiveContest, setNoActiveContest] = useState<boolean>(false);

  // UI state
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadPortfolio, setUploadPortfolio] = useState<string | undefined>(
    undefined
  );
  const [uploadPortfolioPhotoType, setUploadPortfolioPhotoType] = useState<
    string | undefined
  >(undefined);

  // Modal state
  const [selectedSubmission, setSelectedSubmission] =
    useState<UISubmission | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // Payment status
  const { hasPaid, loading: paymentLoading } = usePaymentStatus(contestId);
  const { justUploadedId, markUploaded, clearHighlight } = useJustUploaded();
  const {
    uploaded,
    categoriesEntered,
    hasSubmissions,
    firstIncompleteId,
    canUpload,
    isLocked,
    nextAction,
  } = useEntryStatus({ categories, contestStatus, hasPaid });

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's submissions for active contest
      const submissionsRes = await fetch('/api/submissions');
      const submissionsData =
        (await submissionsRes.json()) as SubmissionsResponse;
      if (
        !submissionsRes.ok ||
        !submissionsData.success ||
        !submissionsData.data?.contest
      ) {
        setNoActiveContest(true);
        return;
      }

      const {
        id: activeContestId,
        status,
        year,
      } = submissionsData.data.contest;
      setContestStatus(status ?? 'inactive');
      setContestId(activeContestId);
      setContestYear(year);

      // Map existing submissions into the current contest categories by matching names or ids
      const existing = submissionsData.data.categories ?? [];
      const nextCategories: CategoryState[] = CURRENT_CONTEST_CATEGORIES.map(
        cat => {
          const found = existing.find(
            c =>
              c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase()
          );
          return {
            id: cat.id,
            name: cat.name,
            maxSubmissions:
              found?.maxSubmissions ?? DEFAULT_MAX_SUBMISSIONS_PER_CATEGORY,
            submissions:
              found?.submissions.map(s => ({
                id: s.id,
                title: s.title,
                description: s.description ?? null,
                r2ImageId: s.r2ImageId,
                portfolio: s.portfolio ?? undefined,
                portfolioPhotoType: s.portfolioPhotoType ?? undefined,
              })) ?? [],
          };
        }
      );
      setCategories(nextCategories);

      // Fetch judges for header
      const judgesRes = await fetch(
        `/api/judges?contestId=${encodeURIComponent(activeContestId)}`
      );
      if (judgesRes.ok) {
        const judgesData = (await judgesRes.json()) as {
          success: boolean;
          data?: Array<{ fullName: string }>;
        };
        if (judgesData.success && judgesData.data) {
          setJudges(judgesData.data.map(j => j.fullName));
        }
      }
    } catch (_e) {
      setNoActiveContest(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set first category as active when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  function handleCategorySelect(categoryId: string) {
    clearHighlight();
    setActiveCategoryId(categoryId);
  }

  function handleUploadClick(portfolio?: string, portfolioPhotoType?: string) {
    if (!canUpload) {
      return; // Uploads are closed or the entry is already paid for
    }
    setUploadPortfolio(portfolio);
    setUploadPortfolioPhotoType(portfolioPhotoType);
    setUploadModalOpen(true);
  }

  // The single next action on the status line: jump to the first category
  // with a free slot and open the upload modal there
  function handleEntryUploadClick() {
    if (firstIncompleteId) setActiveCategoryId(firstIncompleteId);
    handleUploadClick();
  }

  function handleUploadSuccess(data: UploadResponse['data']) {
    if (!activeCategoryId || !data) return;

    // Update local state to reflect new submission
    setCategories(prev =>
      prev.map(cat => {
        if (cat.id !== activeCategoryId) return cat;
        const newSubmission = {
          id: data.submissionId,
          title: data.title,
          description: data.description,
          r2ImageId: data.imageUrl,
          portfolio: data.portfolio,
          portfolioPhotoType: data.portfolioPhotoType,
        };
        return {
          ...cat,
          submissions: [...cat.submissions, newSubmission],
        };
      })
    );

    // Confirmed in place: the photo appears in its slot, briefly highlighted
    markUploaded(data.submissionId);
  }

  function handleUploadError(_error: string) {
    // Error is now handled in the UploadModal component
  }

  function handleManageSubmission(submission: UISubmission) {
    setSelectedSubmission(submission);
    setIsManageModalOpen(true);
  }

  function handleSubmissionUpdated(updated: UISubmission) {
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        submissions: cat.submissions.map(submission =>
          submission.id === updated.id ? updated : submission
        ),
      }))
    );
    setSelectedSubmission(updated);
  }

  async function handleDeleteSubmission(submissionId: string) {
    if (hasPaid) {
      return; // Should not be called when paid, but safety check
    }
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!result.success)
        throw new Error(result.message || 'Failed to delete');

      setCategories(prev =>
        prev.map(cat => ({
          ...cat,
          submissions: cat.submissions.filter(s => s.id !== submissionId),
        }))
      );

      // Deleting is irreversible, so it keeps its confirmation dialog
      setDialogOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  if (loading || paymentLoading) {
    return (
      <div className="flex items-center justify-center gap-3 p-16">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-foreground/70" />
        <span className="text-editorial uppercase tracking-editorial text-muted-foreground">
          {t('submissions.loading')}
        </span>
      </div>
    );
  }

  const activeCategory = categories.find(cat => cat.id === activeCategoryId);

  const activePhotoCount = activeCategory?.submissions.length ?? 0;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-6 sm:gap-10 sm:py-8">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Eyebrow>
          {contestYear} {t('submissions.contest-suffix')}
        </Eyebrow>
        <h1 className="font-serif text-3xl text-foreground leading-display tracking-display sm:text-5xl">
          {t('nav.submissions')}
        </h1>
        <p className="mx-auto max-w-prose-narrow font-light text-sm text-muted-foreground leading-paragraph">
          {t('submissions.hero.subtitle')}
        </p>
        {!noActiveContest && <ContestCountdown year={contestYear} />}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 font-light text-sm text-destructive leading-paragraph">
          {error}
        </div>
      )}

      {/* No active contest message */}
      {noActiveContest && (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-muted-foreground">
          <p className="font-light text-base leading-paragraph">
            {t('submissions.closed')}
          </p>
        </div>
      )}

      {!noActiveContest && (
        <EntryStatus
          uploaded={uploaded}
          hasFreeSlot={firstIncompleteId !== null}
          categoriesEntered={categoriesEntered}
          nextAction={nextAction}
          onUploadClick={handleEntryUploadClick}
        />
      )}

      {!noActiveContest && (
        <ContestStatusBanner contestStatus={contestStatus} hasPaid={hasPaid} />
      )}

      {/* Category Navigation */}
      {!noActiveContest && categories.length > 0 && (
        <CategoryNavigation
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Active category */}
      {!noActiveContest &&
        activeCategory &&
        (activeCategory.id === MEDITERRANEAN_CATEGORY_ID ? (
          <MediterraneanPortfolioManager
            submissions={activeCategory.submissions}
            canUpload={canUpload}
            isLocked={isLocked}
            justUploadedId={justUploadedId}
            onUploadClick={handleUploadClick}
            onManageSubmission={handleManageSubmission}
          />
        ) : (
          <CategorySummary
            categoryId={activeCategory.id}
            submissions={activeCategory.submissions}
            maxSubmissionsPerCategory={activeCategory.maxSubmissions}
            canUpload={canUpload}
            isLocked={isLocked}
            justUploadedId={justUploadedId}
            onUploadClick={() => handleUploadClick()}
            onManageSubmission={handleManageSubmission}
          />
        ))}

      {/* Payment comes after the work, never between the tabs and the grid */}
      {!noActiveContest &&
        contestStatus === 'active' &&
        hasSubmissions &&
        !hasPaid && <PaymentBanner categories={categories} />}

      {hasPaid && <PaymentSuccessBanner />}

      {!noActiveContest && judges.length > 0 && (
        <div className="border-t border-border pt-8">
          <JudgesBar judges={judges} label={t('submissions.jury')} />
        </div>
      )}

      {/* Upload Modal */}
      {activeCategory && contestId && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setUploadPortfolio(undefined);
            setUploadPortfolioPhotoType(undefined);
          }}
          categoryId={activeCategory.id}
          contestId={contestId}
          portfolio={uploadPortfolio}
          portfolioPhotoType={uploadPortfolioPhotoType}
          photoNumber={activePhotoCount + 1}
          maxPhotos={activeCategory.maxSubmissions}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      )}

      {/* Submission Display Modal */}
      <SubmissionManageModal
        submission={selectedSubmission}
        isOpen={isManageModalOpen}
        hasPaid={hasPaid}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedSubmission(null);
        }}
        onDelete={handleDeleteSubmission}
        onUpdated={handleSubmissionUpdated}
      />

      {/* Upload/Delete Success Dialog */}
      <SuccessModal
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t('dialog.delete.title')}
        message={t('toast.delete-success')}
        variant="success"
      />
    </div>
  );
}

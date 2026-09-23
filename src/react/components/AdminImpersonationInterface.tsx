import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MAX_SUBMISSIONS_PER_CATEGORY } from '../../constants';
import { CURRENT_CONTEST_CATEGORIES } from '../../constants/categories';
import { useI18n } from '../../i18n/react';
import type { SubmissionsResponse, UploadResponse } from '../../types/api';
import type { UICategory, UISubmission } from '../../types/ui';
import { useJustUploaded } from '../hooks/useJustUploaded';
import { CategoryNavigation } from './CategoryNavigation';
import { CategorySummary } from './CategorySummary';
import { JudgesBar } from './JudgesBar';
import { MediterraneanPortfolioManager } from './MediterraneanPortfolioManager';
import { SubmissionManageModal } from './SubmissionManageModal';
import { SuccessModal } from './SuccessModal';
import { UploadModal } from './UploadModal';
import { Button } from './ui/Button';
import { cn } from './ui/cn';

type CategoryState = UICategory;

type AdminImpersonationInterfaceProps = {
  userEmail: string;
  onEmailChange: () => void;
};

export function AdminImpersonationInterface({
  userEmail,
  onEmailChange,
}: AdminImpersonationInterfaceProps) {
  const { t } = useI18n();

  // Core state
  const [contestId, setContestId] = useState<string | null>(null);
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
  const { justUploadedId, markUploaded, clearHighlight } = useJustUploaded();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<'upload' | 'delete'>('upload');
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

  const initialize = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's submissions for active contest
      const submissionsRes = await fetch(
        `/api/submissions?userEmail=${encodeURIComponent(userEmail)}`
      );
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

      const { id: activeContestId, status } = submissionsData.data.contest;
      setContestStatus(status ?? 'inactive');
      setContestId(activeContestId);

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
  }, [userEmail]);

  useEffect(() => {
    void initialize();
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
    setUploadPortfolio(portfolio);
    setUploadPortfolioPhotoType(portfolioPhotoType);
    setUploadModalOpen(true);
  }

  function _handleSubmissionClick(submission: CategoryState['submissions'][0]) {
    setSelectedSubmission(submission);
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

    // Show success dialog
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
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, adminDelete: true }),
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

      // Show deletion success dialog
      setDialogKind('delete');
      setDialogOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-12 text-sm text-muted-foreground">
        <div className="size-8 animate-spin rounded-full border-b-2 border-foreground/70" />
        Caricamento...
      </div>
    );
  }

  const activeCategory = categories.find(cat => cat.id === activeCategoryId);
  // Admins upload on behalf of an entrant, so payment never locks them out
  const canUpload = contestStatus === 'active';
  const showJudges = !noActiveContest && judges.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Header with user email and change button */}
      <section className="flex flex-col rounded-xl border border-border bg-background">
        <header
          className={cn(
            'flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
            showJudges && 'border-b border-border'
          )}
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-xs text-subtle-foreground">
              Caricamento per conto di{' '}
              <span className="text-foreground" title={userEmail}>
                {userEmail}
              </span>
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onEmailChange}
            className="shrink-0 self-start sm:self-auto"
          >
            Cambia Email
          </Button>
        </header>

        {showJudges && (
          <div className="px-4 pb-3">
            <JudgesBar
              judges={judges}
              label={t('submissions.jury')}
              className="justify-start mt-0"
            />
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* No active contest message */}
      {noActiveContest && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
          {t('submissions.closed')}
        </div>
      )}

      {/* Category Navigation */}
      {!noActiveContest && categories.length > 0 && (
        <CategoryNavigation
          categories={categories}
          activeCategoryId={activeCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Active Category Summary */}
      {!noActiveContest &&
        activeCategory &&
        (activeCategory.id === 'mediterranean' ? (
          <MediterraneanPortfolioManager
            submissions={activeCategory.submissions}
            canUpload={canUpload}
            isLocked={false}
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
            isLocked={false}
            justUploadedId={justUploadedId}
            onUploadClick={() => handleUploadClick()}
            onManageSubmission={handleManageSubmission}
          />
        ))}

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
          photoNumber={activeCategory.submissions.length + 1}
          maxPhotos={activeCategory.maxSubmissions}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          isAdminUpload={true}
          adminUserEmail={userEmail}
        />
      )}

      {/* Submission Display Modal */}
      <SubmissionManageModal
        submission={selectedSubmission}
        isOpen={isManageModalOpen}
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
        title={
          dialogKind === 'upload'
            ? t('dialog.upload.title')
            : t('dialog.delete.title')
        }
        message={
          dialogKind === 'upload'
            ? t('toast.upload-success')
            : t('toast.delete-success')
        }
        variant="success"
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { DEFAULT_MAX_SUBMISSIONS_PER_CATEGORY } from '../../constants';
import { CURRENT_CONTEST_CATEGORIES } from '../../constants/categories';
import { useI18n } from '../../i18n/react';
import type { SubmissionsResponse, UploadResponse } from '../../types/api';
import type { UICategory, UISubmission } from '../../types/ui';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import { CategoryNavigation } from './CategoryNavigation';
import { CategorySummary } from './CategorySummary';
import JudgesBar from './JudgesBar';
import { MediterraneanPortfolioManager } from './MediterraneanPortfolioManager';
import { PaymentSuccessBanner } from './PaymentSuccessBanner';
import { SubmissionManageModal } from './SubmissionManageModal';
import { SuccessModal } from './SuccessModal';
import { UploadModal } from './UploadModal';

type CategoryState = UICategory;

export function UnifiedSubmissions() {
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

  // Payment status
  const { hasPaid, loading: paymentLoading } = usePaymentStatus(contestId);

  useEffect(() => {
    initialize();
  }, []);

  // Set first category as active when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  async function initialize() {
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
                imageUrl: s.imageUrl,
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
  }

  function handleCategorySelect(categoryId: string) {
    setActiveCategoryId(categoryId);
  }

  function handleUploadClick(portfolio?: string, portfolioPhotoType?: string) {
    if (hasPaid) {
      return; // Button should be disabled, but this is a safety check
    }
    setUploadPortfolio(portfolio);
    setUploadPortfolioPhotoType(portfolioPhotoType);
    setUploadModalOpen(true);
  }

  function handleSubmissionClick(submission: CategoryState['submissions'][0]) {
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
          imageUrl: data.imageUrl,
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
    setDialogKind('upload');
    setDialogOpen(true);
  }

  function handleUploadError(error: string) {
    // Error is now handled in the UploadModal component
  }

  const handleManageSubmission = (submission: UISubmission) => {
    if (hasPaid) {
      return; // Button should be disabled, but this is a safety check
    }
    setSelectedSubmission(submission);
    setIsManageModalOpen(true);
  };

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

      // Show deletion success dialog
      setDialogKind('delete');
      setDialogOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-slate-300">{t('submissions.loading')}</span>
      </div>
    );
  }

  const activeCategory = categories.find(cat => cat.id === activeCategoryId);

  // Calculate payment info
  const categoriesWithSubmissions = categories.filter(
    cat => cat.submissions.length > 0
  );
  const hasSubmissions = categoriesWithSubmissions.length > 0;
  const categoryCount = categoriesWithSubmissions.length;

  return (
    <div className="space-y-6">
      {/* Header with judges */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          UW 2025 Contest{': '}
          {t('nav.submissions')}
        </h1>
        {!noActiveContest && (
          <JudgesBar judges={judges} label={t('submissions.jury')} />
        )}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* No active contest message */}
      {noActiveContest && (
        <div className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-6 text-center">
          {t('submissions.closed')}
        </div>
      )}

      {/* Category Navigation */}
      {!noActiveContest && categories.length > 0 && (
        <div className="space-y-4">
          <CategoryNavigation
            categories={categories}
            activeCategoryId={activeCategoryId}
            onCategorySelect={handleCategorySelect}
            hasSubmissions={hasSubmissions}
            hasPaid={hasPaid}
          />
        </div>
      )}

      {/* Payment Success Banner - show if user has paid */}
      {hasPaid && <PaymentSuccessBanner />}

      {/* Active Category Summary */}
      {!noActiveContest && activeCategory && (
        <>
          {activeCategory.id === 'mediterranean' ? (
            <MediterraneanPortfolioManager
              submissions={activeCategory.submissions}
              hasPaid={hasPaid}
              onUploadClick={handleUploadClick}
              onManageSubmission={handleManageSubmission}
            />
          ) : (
            <CategorySummary
              categoryId={activeCategory.id}
              submissions={activeCategory.submissions}
              maxSubmissionsPerCategory={activeCategory.maxSubmissions}
              contestStatus={contestStatus}
              hasPaid={hasPaid}
              onUploadClick={() => handleUploadClick()}
              onManageSubmission={handleManageSubmission}
            />
          )}
        </>
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

import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { CURRENT_CONTEST_CATEGORIES } from '../../../constants/categories';
import { validateAdminSearch } from '../../adminSearchSchema';
import { AdminTabs } from '../../components/AdminTabs';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import { JudgingCategoryTabs } from '../../components/judging/JudgingCategoryTabs';
import { JudgingContentGrid } from '../../components/judging/JudgingContentGrid';
import { PortfolioInspectModal } from '../../components/judging/PortfolioInspectModal';
import { SubmissionInspectModal } from '../../components/judging/SubmissionInspectModal';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useAdminContestId } from '../../hooks/useAdminContestId';
import { useImageResize } from '../../hooks/useImageResize';
import { useImageZoom } from '../../hooks/useImageZoom';
import { useJudgingFilters } from '../../hooks/useJudgingFilters';
import { useJudgingKeyboard } from '../../hooks/useJudgingKeyboard';
import { useJudgingNavigation } from '../../hooks/useJudgingNavigation';
import { useJudgingSubmissions } from '../../hooks/useJudgingSubmissions';
import { useLocalStorageOrder } from '../../hooks/useLocalStorageOrder';
import { useUserRole } from '../../hooks/useUserRole';
import type { FilterStatus } from '../../types/judging';

export const Route = createFileRoute('/admin/judging')({
  component: JudgingPage,
  validateSearch: validateAdminSearch,
});

function JudgingPage() {
  const { isAdmin, isLoaded } = useUserRole();
  const searchParams = Route.useSearch();
  const routeNavigate = Route.useNavigate();

  const navigateToContest = useCallback(
    (id: string) => {
      routeNavigate({ search: { contestId: id }, replace: true });
    },
    [routeNavigate]
  );

  const {
    contestId,
    contests,
    loading: contestsLoading,
    setContestId: setAdminContestId,
  } = useAdminContestId(searchParams, navigateToContest);

  // Local UI state
  const [activeCategory, setActiveCategory] = useState<string>(
    CURRENT_CONTEST_CATEGORIES[0].id
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const isMediterranean = activeCategory === 'mediterranean';

  const defaultColumns = isMediterranean
    ? filterStatus === 'shortlisted'
      ? 1
      : 3
    : 4;
  const { columns, setColumns } = useImageResize(
    activeCategory,
    filterStatus,
    defaultColumns
  );

  // Data
  const {
    submissions,
    loading,
    error,
    syncStatus,
    setPlacement,
    setFlagStatus,
    setPortfolioFlag,
    setPortfolioPlacement,
    submitResults,
    resetJudging,
  } = useJudgingSubmissions({ contestId, activeCategory });

  const {
    sortedSubmissions,
    portfoliosList,
    groupedByUser,
    counts,
    placementCounts,
    shortlistedSubmissions,
    shortlistedPortfolios,
  } = useJudgingFilters({
    submissions,
    activeCategory,
    filterStatus,
    isMediterranean,
  });

  // Zoom (shared between modals)
  const zoom = useImageZoom();

  // Navigation
  const nav = useJudgingNavigation({
    sortedSubmissions,
    portfoliosList,
    resetZoom: zoom.resetZoom,
  });

  // Keyboard
  useJudgingKeyboard({
    inspectedSubmissionId: nav.inspectedSubmissionId,
    inspectedPortfolioId: nav.inspectedPortfolioId,
    zoomedPortfolioPhotoId: nav.zoomedPortfolioPhotoId,
    inspectedPortfolio: nav.inspectedPortfolio,
    closeSubmission: nav.closeSubmission,
    closePortfolio: nav.closePortfolio,
    closeZoomedPhoto: nav.closeZoomedPhoto,
    goToPrevSubmission: nav.goToPrevSubmission,
    goToNextSubmission: nav.goToNextSubmission,
    goToPrevPortfolio: nav.goToPrevPortfolio,
    goToNextPortfolio: nav.goToNextPortfolio,
    goToPrevPhoto: nav.goToPrevPhoto,
    goToNextPhoto: nav.goToNextPhoto,
  });

  // Drag-and-drop reordering
  const {
    orderedItems: orderedShortlistedSubmissions,
    handleReorder: handleSubmissionReorder,
    resetOrder: resetSubmissionOrder,
  } = useLocalStorageOrder(
    `judging-shortlist-order-${activeCategory}`,
    shortlistedSubmissions
  );

  const {
    orderedItems: orderedShortlistedPortfolios,
    handleReorder: handlePortfolioReorder,
    resetOrder: resetPortfolioOrder,
  } = useLocalStorageOrder(
    `judging-portfolio-order-${activeCategory}`,
    shortlistedPortfolios
  );

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setFilterStatus('all');
  }, []);

  if (!isLoaded || contestsLoading) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-white">
            <AdminTabs
              contests={contests}
              selectedContestId={contestId}
              onContestChange={setAdminContestId}
            />

            <JudgingCategoryTabs
              activeCategory={activeCategory}
              filterStatus={filterStatus}
              submissions={submissions}
              counts={counts}
              placementCounts={placementCounts}
              sortedCount={sortedSubmissions.length}
              columns={columns}
              syncStatus={syncStatus}
              onColumnsChange={setColumns}
              onCategoryChange={handleCategoryChange}
              onFilterChange={setFilterStatus}
              onResetJudging={resetJudging}
              onSubmitResults={submitResults}
            />

            <div className="p-4">
              <div className="max-w-7xl mx-auto">
                <JudgingContentGrid
                  columns={columns}
                  loading={loading}
                  error={error}
                  filterStatus={filterStatus}
                  isMediterranean={isMediterranean}
                  sortedSubmissions={sortedSubmissions}
                  portfoliosList={portfoliosList}
                  groupedByUser={groupedByUser}
                  orderedShortlistedSubmissions={orderedShortlistedSubmissions}
                  handleSubmissionReorder={handleSubmissionReorder}
                  resetSubmissionOrder={resetSubmissionOrder}
                  orderedShortlistedPortfolios={orderedShortlistedPortfolios}
                  handlePortfolioReorder={handlePortfolioReorder}
                  resetPortfolioOrder={resetPortfolioOrder}
                  onInspectSubmission={nav.openSubmission}
                  onInspectPortfolio={nav.openPortfolio}
                  onFlag={setFlagStatus}
                  onPlace={setPlacement}
                  onPortfolioFlag={setPortfolioFlag}
                  onPortfolioPlace={setPortfolioPlacement}
                />
              </div>
            </div>

            {nav.inspectedSubmission && (
              <SubmissionInspectModal
                submission={nav.inspectedSubmission}
                index={nav.inspectedIndex}
                total={sortedSubmissions.length}
                canGoPrev={nav.canGoPrev}
                canGoNext={nav.canGoNext}
                onPrev={nav.goToPrevSubmission}
                onNext={nav.goToNextSubmission}
                onClose={nav.closeSubmission}
                zoomLevel={zoom.zoomLevel}
                zoomOrigin={zoom.zoomOrigin}
                onZoomClick={zoom.handleZoomClick}
                onResetZoom={zoom.resetZoom}
                descriptionExpanded={nav.descriptionExpanded}
                onToggleDescription={nav.toggleDescription}
                onFlag={setFlagStatus}
                onPlace={setPlacement}
              />
            )}

            {nav.inspectedPortfolio && (
              <PortfolioInspectModal
                portfolio={nav.inspectedPortfolio}
                portfolioIndex={nav.inspectedPortfolioIndex}
                portfoliosTotal={portfoliosList.length}
                canGoPrev={nav.canGoToPrevPortfolio}
                canGoNext={nav.canGoToNextPortfolio}
                onPrev={nav.goToPrevPortfolio}
                onNext={nav.goToNextPortfolio}
                onClose={nav.closePortfolio}
                zoomedPhoto={nav.zoomedPhoto}
                zoomedPhotoIndex={nav.zoomedPhotoIndex}
                zoomedImageUrl={nav.zoomedImageUrl}
                canGoPrevPhoto={nav.canGoPrevPhoto}
                canGoNextPhoto={nav.canGoNextPhoto}
                onOpenZoomedPhoto={nav.openZoomedPhoto}
                onCloseZoomedPhoto={nav.closeZoomedPhoto}
                onPrevPhoto={nav.goToPrevPhoto}
                onNextPhoto={nav.goToNextPhoto}
                zoomLevel={zoom.zoomLevel}
                zoomOrigin={zoom.zoomOrigin}
                onZoomClick={zoom.handleZoomClick}
                onResetZoom={zoom.resetZoom}
                descriptionExpanded={nav.descriptionExpanded}
                onToggleDescription={nav.toggleDescription}
                onFlag={setPortfolioFlag}
                onPlace={setPortfolioPlacement}
              />
            )}
          </div>
        ) : (
          <AdminAccessDenied />
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

import { useCallback, useEffect, useState } from 'react';
import type { JudgingSubmission, PortfolioGroup } from '../types/judging';
import { getImageUrl } from '../utils/imageUtils';

type UseJudgingNavigationParams = {
  sortedSubmissions: JudgingSubmission[];
  portfoliosList: PortfolioGroup[];
  resetZoom: () => void;
};

type UseJudgingNavigationResult = {
  // Submission modal
  inspectedSubmissionId: string | null;
  inspectedSubmission: JudgingSubmission | null;
  inspectedIndex: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  goToPrevSubmission: () => void;
  goToNextSubmission: () => void;
  openSubmission: (id: string) => void;
  closeSubmission: () => void;

  // Portfolio modal
  inspectedPortfolioId: string | null;
  inspectedPortfolio: PortfolioGroup | null;
  inspectedPortfolioIndex: number;
  canGoToPrevPortfolio: boolean;
  canGoToNextPortfolio: boolean;
  goToPrevPortfolio: () => void;
  goToNextPortfolio: () => void;
  openPortfolio: (id: string) => void;
  closePortfolio: () => void;

  // Zoomed photo within portfolio
  zoomedPortfolioPhotoId: string | null;
  zoomedPhoto: JudgingSubmission | null;
  zoomedPhotoIndex: number;
  zoomedImageUrl: string | null;
  canGoPrevPhoto: boolean;
  canGoNextPhoto: boolean;
  openZoomedPhoto: (id: string) => void;
  closeZoomedPhoto: () => void;
  goToPrevPhoto: () => void;
  goToNextPhoto: () => void;

  // Description
  descriptionExpanded: boolean;
  toggleDescription: () => void;
};

export function useJudgingNavigation({
  sortedSubmissions,
  portfoliosList,
  resetZoom,
}: UseJudgingNavigationParams): UseJudgingNavigationResult {
  const [inspectedSubmissionId, setInspectedSubmissionId] = useState<
    string | null
  >(null);
  const [inspectedPortfolioId, setInspectedPortfolioId] = useState<
    string | null
  >(null);
  const [zoomedPortfolioPhotoId, setZoomedPortfolioPhotoId] = useState<
    string | null
  >(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Body scroll lock
  useEffect(() => {
    if (inspectedSubmissionId || inspectedPortfolioId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      resetZoom();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [inspectedSubmissionId, inspectedPortfolioId, resetZoom]);

  // Submission modal
  const inspectedSubmission = inspectedSubmissionId
    ? (sortedSubmissions.find(s => s.id === inspectedSubmissionId) ?? null)
    : null;
  const inspectedIndex = inspectedSubmissionId
    ? sortedSubmissions.findIndex(s => s.id === inspectedSubmissionId)
    : -1;
  const canGoPrev = inspectedIndex > 0;
  const canGoNext =
    inspectedIndex >= 0 && inspectedIndex < sortedSubmissions.length - 1;

  const goToPrevSubmission = useCallback(() => {
    if (inspectedIndex > 0) {
      setInspectedSubmissionId(sortedSubmissions[inspectedIndex - 1].id);
      resetZoom();
      setDescriptionExpanded(false);
    }
  }, [inspectedIndex, sortedSubmissions, resetZoom]);

  const goToNextSubmission = useCallback(() => {
    if (inspectedIndex >= 0 && inspectedIndex < sortedSubmissions.length - 1) {
      setInspectedSubmissionId(sortedSubmissions[inspectedIndex + 1].id);
      resetZoom();
      setDescriptionExpanded(false);
    }
  }, [inspectedIndex, sortedSubmissions, resetZoom]);

  const openSubmission = useCallback((id: string) => {
    setInspectedSubmissionId(id);
  }, []);

  const closeSubmission = useCallback(() => {
    setInspectedSubmissionId(null);
  }, []);

  // Portfolio modal
  const inspectedPortfolio = inspectedPortfolioId
    ? (portfoliosList.find(p => p.portfolioId === inspectedPortfolioId) ?? null)
    : null;
  const inspectedPortfolioIndex = inspectedPortfolioId
    ? portfoliosList.findIndex(p => p.portfolioId === inspectedPortfolioId)
    : -1;
  const canGoToPrevPortfolio = inspectedPortfolioIndex > 0;
  const canGoToNextPortfolio =
    inspectedPortfolioIndex >= 0 &&
    inspectedPortfolioIndex < portfoliosList.length - 1;

  const goToPrevPortfolio = useCallback(() => {
    if (inspectedPortfolioIndex > 0) {
      setZoomedPortfolioPhotoId(null);
      resetZoom();
      setInspectedPortfolioId(
        portfoliosList[inspectedPortfolioIndex - 1].portfolioId
      );
    }
  }, [inspectedPortfolioIndex, portfoliosList, resetZoom]);

  const goToNextPortfolio = useCallback(() => {
    if (
      inspectedPortfolioIndex >= 0 &&
      inspectedPortfolioIndex < portfoliosList.length - 1
    ) {
      setZoomedPortfolioPhotoId(null);
      resetZoom();
      setInspectedPortfolioId(
        portfoliosList[inspectedPortfolioIndex + 1].portfolioId
      );
    }
  }, [inspectedPortfolioIndex, portfoliosList, resetZoom]);

  const openPortfolio = useCallback((id: string) => {
    setInspectedPortfolioId(id);
  }, []);

  const closePortfolio = useCallback(() => {
    setInspectedPortfolioId(null);
  }, []);

  // Zoomed photo within portfolio
  const zoomedPhoto =
    zoomedPortfolioPhotoId && inspectedPortfolio
      ? (inspectedPortfolio.submissions.find(
          s => s.id === zoomedPortfolioPhotoId
        ) ?? null)
      : null;
  const zoomedPhotoIndex =
    zoomedPortfolioPhotoId && inspectedPortfolio
      ? inspectedPortfolio.submissions.findIndex(
          s => s.id === zoomedPortfolioPhotoId
        )
      : -1;
  const zoomedImageUrl = zoomedPhoto?.r2ImageId
    ? getImageUrl(zoomedPhoto.r2ImageId)
    : null;
  const canGoPrevPhoto = zoomedPhotoIndex > 0;
  const canGoNextPhoto =
    inspectedPortfolio && zoomedPhotoIndex >= 0
      ? zoomedPhotoIndex < inspectedPortfolio.submissions.length - 1
      : false;

  const openZoomedPhoto = useCallback((id: string) => {
    setZoomedPortfolioPhotoId(id);
  }, []);

  const closeZoomedPhoto = useCallback(() => {
    setZoomedPortfolioPhotoId(null);
    resetZoom();
  }, [resetZoom]);

  const goToPrevPhoto = useCallback(() => {
    if (inspectedPortfolio && zoomedPhotoIndex > 0) {
      setZoomedPortfolioPhotoId(
        inspectedPortfolio.submissions[zoomedPhotoIndex - 1].id
      );
      resetZoom();
    }
  }, [inspectedPortfolio, zoomedPhotoIndex, resetZoom]);

  const goToNextPhoto = useCallback(() => {
    if (
      inspectedPortfolio &&
      zoomedPhotoIndex >= 0 &&
      zoomedPhotoIndex < inspectedPortfolio.submissions.length - 1
    ) {
      setZoomedPortfolioPhotoId(
        inspectedPortfolio.submissions[zoomedPhotoIndex + 1].id
      );
      resetZoom();
    }
  }, [inspectedPortfolio, zoomedPhotoIndex, resetZoom]);

  const toggleDescription = useCallback(() => {
    setDescriptionExpanded(prev => !prev);
  }, []);

  return {
    inspectedSubmissionId,
    inspectedSubmission,
    inspectedIndex,
    canGoPrev,
    canGoNext,
    goToPrevSubmission,
    goToNextSubmission,
    openSubmission,
    closeSubmission,

    inspectedPortfolioId,
    inspectedPortfolio,
    inspectedPortfolioIndex,
    canGoToPrevPortfolio,
    canGoToNextPortfolio,
    goToPrevPortfolio,
    goToNextPortfolio,
    openPortfolio,
    closePortfolio,

    zoomedPortfolioPhotoId,
    zoomedPhoto,
    zoomedPhotoIndex,
    zoomedImageUrl,
    canGoPrevPhoto,
    canGoNextPhoto,
    openZoomedPhoto,
    closeZoomedPhoto,
    goToPrevPhoto,
    goToNextPhoto,

    descriptionExpanded,
    toggleDescription,
  };
}

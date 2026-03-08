import { useEffect } from 'react';
import type { PortfolioGroup } from '../types/judging';

type UseJudgingKeyboardParams = {
  inspectedSubmissionId: string | null;
  inspectedPortfolioId: string | null;
  zoomedPortfolioPhotoId: string | null;
  inspectedPortfolio: PortfolioGroup | null;
  closeSubmission: () => void;
  closePortfolio: () => void;
  closeZoomedPhoto: () => void;
  goToPrevSubmission: () => void;
  goToNextSubmission: () => void;
  goToPrevPortfolio: () => void;
  goToNextPortfolio: () => void;
  goToPrevPhoto: () => void;
  goToNextPhoto: () => void;
};

export function useJudgingKeyboard({
  inspectedSubmissionId,
  inspectedPortfolioId,
  zoomedPortfolioPhotoId,
  inspectedPortfolio,
  closeSubmission,
  closePortfolio,
  closeZoomedPhoto,
  goToPrevSubmission,
  goToNextSubmission,
  goToPrevPortfolio,
  goToNextPortfolio,
  goToPrevPhoto,
  goToNextPhoto,
}: UseJudgingKeyboardParams) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Handle zoomed photo within portfolio modal
      if (zoomedPortfolioPhotoId && inspectedPortfolio) {
        if (e.key === 'Escape') {
          closeZoomedPhoto();
        } else if (e.key === 'ArrowLeft') {
          goToPrevPhoto();
        } else if (e.key === 'ArrowRight') {
          goToNextPhoto();
        }
        return;
      }

      // Handle portfolio modal
      if (inspectedPortfolioId) {
        if (e.key === 'Escape') {
          closePortfolio();
        } else if (e.key === 'ArrowLeft') {
          goToPrevPortfolio();
        } else if (e.key === 'ArrowRight') {
          goToNextPortfolio();
        }
        return;
      }

      // Handle individual submission modal
      if (!inspectedSubmissionId) return;

      if (e.key === 'Escape') {
        closeSubmission();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSubmission();
      } else if (e.key === 'ArrowRight') {
        goToNextSubmission();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    inspectedSubmissionId,
    inspectedPortfolioId,
    zoomedPortfolioPhotoId,
    inspectedPortfolio,
    closeSubmission,
    closePortfolio,
    closeZoomedPhoto,
    goToPrevSubmission,
    goToNextSubmission,
    goToPrevPortfolio,
    goToNextPortfolio,
    goToPrevPhoto,
    goToNextPhoto,
  ]);
}

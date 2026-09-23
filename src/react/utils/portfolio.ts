import { PHOTO_TYPES, PORTFOLIOS_PER_MEDITERRANEAN } from '../../constants';
import type { UISubmission } from '../../types/ui';

export const PORTFOLIO_NUMBERS = Array.from(
  { length: PORTFOLIOS_PER_MEDITERRANEAN },
  (_, index) => index + 1
);

export function getPortfolioSubmissions(
  submissions: UISubmission[],
  portfolioNumber: number
) {
  return submissions.filter(
    submission => submission.portfolio === String(portfolioNumber)
  );
}

// A portfolio counts as complete only with one photo of each required type
export function isPortfolioComplete(
  submissions: UISubmission[],
  portfolioNumber: number
) {
  const photos = getPortfolioSubmissions(submissions, portfolioNumber);
  return PHOTO_TYPES.every(photoType =>
    photos.some(photo => photo.portfolioPhotoType === photoType)
  );
}

export function countCompletePortfolios(submissions: UISubmission[]) {
  return PORTFOLIO_NUMBERS.filter(portfolioNumber =>
    isPortfolioComplete(submissions, portfolioNumber)
  ).length;
}

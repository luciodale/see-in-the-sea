export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const REDIRECT_URL = '/user/submissions';

// Submission limits
export const DEFAULT_MAX_SUBMISSIONS_PER_CATEGORY = 2;
export const MEDITERRANEAN_MAX_SUBMISSIONS = 6; // 2 portfolios × 3 photos each

// Portfolio configuration
export const PORTFOLIOS_PER_MEDITERRANEAN = 2;
export const PHOTOS_PER_PORTFOLIO = 3;
export const PHOTO_TYPES = ['macro', 'wide-angle', 'free'] as const;

// UI constants
export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_BACKOFF_BASE = 1000; // 1 second

// Image base URL - CDN in production, API in development
export const IMAGES_BASE_URL = import.meta.env.PROD
  ? 'https://images.seeintheseauw.com'
  : '/api/images';

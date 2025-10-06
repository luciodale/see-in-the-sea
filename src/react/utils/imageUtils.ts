import { getImageApiUrl } from '../../server/imageService';

/**
 * Constructs the full image URL for display
 * @param r2ImageId - The r2ImageId from the database
 * @returns The full API path for the image
 */
export function getImageUrl(r2ImageId: string | null): string | null {
  return getImageApiUrl(r2ImageId);
}

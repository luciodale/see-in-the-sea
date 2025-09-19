/**
 * Constructs the full image URL for display
 * @param imageUrl - The image URL path from the database (e.g., "contest-id/category-id/user-id/submission-id")
 * @returns The full API path for the image
 */
export function getImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return `/api/images/${imageUrl}`;
}

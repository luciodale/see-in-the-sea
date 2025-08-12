// Helper to get file extension from MIME type
// Only supports JPEG, PNG, and WebP formats
export function getFileExtensionFromMime(mimeType: string): string | null {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return null;
  }
}

// List of supported MIME types for validation
export const SUPPORTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

// List of supported file extensions for validation
export const SUPPORTED_IMAGE_EXTENSIONS = [
  'jpeg',
  'jpg',
  'png',
  'webp',
] as const;

// String for HTML accept attribute (comma-separated MIME types)
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/jpg,image/png,image/webp';

// Help text for supported formats
export const SUPPORTED_FORMATS_HELP_TEXT = 'JPEG, PNG, WebP up to 10MB';

// Type for supported MIME types
export type SupportedImageMimeType =
  (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

// Type for supported file extensions
export type SupportedImageExtension =
  (typeof SUPPORTED_IMAGE_EXTENSIONS)[number];

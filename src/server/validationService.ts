import {
  getFileExtensionFromMime,
  SUPPORTED_IMAGE_MIME_TYPES,
} from './utils.js';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export type ValidationResult<T> = {
  isValid: boolean;
  error?: string;
  data?: T;
};

/**
 * Validates image file from form data
 * Pure function - validates file properties
 * Only supports JPEG, PNG, and WebP formats
 */
export function validateImageFile(imageFile: File): ValidationResult<{
  image: File;
  fileExtension: string;
}> {
  if (!imageFile || !(imageFile instanceof File)) {
    return {
      isValid: false,
      error: 'Invalid image file provided. Must be an image file.',
    };
  }

  if (!imageFile.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Invalid image file provided. Must be an image file.',
    };
  }

  // Check if the MIME type is supported
  if (!SUPPORTED_IMAGE_MIME_TYPES.includes(imageFile.type as any)) {
    return {
      isValid: false,
      error: `Unsupported image format: ${imageFile.type}. Only JPEG, PNG, and WebP formats are supported.`,
    };
  }

  const fileExtension = getFileExtensionFromMime(imageFile.type);
  if (!fileExtension) {
    return {
      isValid: false,
      error: `Unsupported image type: ${imageFile.type}. Only JPEG, PNG, and WebP formats are supported.`,
    };
  }

  if (imageFile.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: 'Image file is too large. Maximum size is 10MB.',
    };
  }

  return {
    isValid: true,
    data: {
      image: imageFile,
      fileExtension,
    },
  };
}

/**
 * Validates required form fields for image upload
 * Pure function - validates form data structure
 */
export function validateUploadFormData(formData: FormData): ValidationResult<{
  imageFile: File;
  contestId: string;
  categoryId: string;
  title: string;
  description: string | null;
}> {
  const imageFile = formData.get('image') as File;
  const contestId = formData.get('contestId') as string;
  const categoryId = formData.get('categoryId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;

  if (!imageFile || !contestId || !categoryId || !title) {
    return {
      isValid: false,
      error: 'Missing required fields: image, contestId, categoryId, or title.',
    };
  }

  return {
    isValid: true,
    data: {
      imageFile,
      contestId,
      categoryId,
      title,
      description: description || null,
    },
  };
}

/**
 * Validates submission limits for new submissions
 * Pure function - determines if new submission is allowed
 */
export function validateSubmissionAction(
  currentCount: number,
  maxAllowed: number
): ValidationResult<{ action: 'create' }> {
  // Check limits for new submission
  if (currentCount >= maxAllowed) {
    return {
      isValid: false,
      error: `You have reached the maximum number of submissions (${maxAllowed}) for this category.`,
    };
  }

  return {
    isValid: true,
    data: { action: 'create' },
  };
}

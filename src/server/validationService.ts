import {
  getFileExtensionFromMime,
  SUPPORTED_IMAGE_MIME_TYPES,
  type SupportedImageMimeType,
} from './utils';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export type ValidationResult<T> =
  | {
      isValid: true;
      data: T;
    }
  | {
      isValid: false;
      error: string;
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
  if (
    !SUPPORTED_IMAGE_MIME_TYPES.includes(
      imageFile.type as SupportedImageMimeType
    )
  ) {
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
  portfolio?: string;
  portfolioPhotoType?: string;
}> {
  const imageFile = formData.get('image') as File;
  const contestId = formData.get('contestId') as string;
  const categoryId = formData.get('categoryId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string | null;
  const portfolio = formData.get('portfolio') as string | null;
  const portfolioPhotoType = formData.get('portfolioPhotoType') as
    | string
    | null;

  if (!imageFile || !contestId || !categoryId || !title) {
    return {
      isValid: false,
      error: 'Missing required fields: image, contestId, categoryId, or title.',
    };
  }

  // Validate portfolio fields for Mediterranean category
  if (categoryId === 'mediterranean') {
    if (!portfolio || !portfolioPhotoType) {
      return {
        isValid: false,
        error:
          'Portfolio and portfolio photo type are required for Mediterranean category.',
      };
    }

    // Validate portfolio
    if (portfolio !== '1' && portfolio !== '2') {
      return {
        isValid: false,
        error: 'Portfolio must be 1 or 2 for Mediterranean category.',
      };
    }

    // Validate photo type
    if (!['macro', 'wide-angle', 'free'].includes(portfolioPhotoType)) {
      return {
        isValid: false,
        error:
          'Portfolio photo type must be macro, wide-angle, or free for Mediterranean category.',
      };
    }
  }

  return {
    isValid: true,
    data: {
      imageFile,
      contestId,
      categoryId,
      title,
      description: description || null,
      portfolio: portfolio || undefined,
      portfolioPhotoType: portfolioPhotoType || undefined,
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

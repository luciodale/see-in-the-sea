import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { getDb } from '../db/index.js';
import { submissions } from '../db/index.js';

// Type definitions for better type safety and reusability
export type ImageUploadMetadata = {
  submissionId: string;
  uploadedBy: string;
  title: string;
  description: string;
  contestId: string;
  categoryId: string;
};

export type SubmissionMetadata = {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  r2Key: string;
  imageUrl: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
};

export type UploadData = {
  submissionId: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  r2Key: string;
  imageUrl: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
};

/**
 * Generates unique R2 key and submission ID for image storage
 * Pure function - no side effects
 */
export function generateR2Key(
  contestId: string,
  categoryId: string,
  userEmail: string,
  fileExtension: string,
  existingSubmissionId?: string
): { submissionId: string; r2Key: string } {
  const submissionId = existingSubmissionId || nanoid();
  // Clean readable structure: contest/category/user-email/submission-id.ext
  const r2Key = `${contestId}/${categoryId}/${userEmail}/${submissionId}.${fileExtension}`;

  return { submissionId, r2Key };
}

/**
 * Generates the served image URL path (R2 key without extension)
 * Pure function - string transformation
 */
export function generateImageUrl(r2Key: string): string {
  return r2Key.replace(/\.[^/.]+$/, '');
}

/**
 * Generates the served image URL path using userId instead of userEmail
 * Pure function - replaces userEmail in path with userId
 */
export function generateImageUrlWithUserId(
  contestId: string,
  categoryId: string,
  userId: string,
  submissionId: string
): string {
  // Clean readable structure: contest/category/user-id/submission-id (no extension)
  return `${contestId}/${categoryId}/${userId}/${submissionId}`;
}

/**
 * Validates if a user owns a specific submission
 * Pure function - returns ownership validation
 */
export async function validateUserOwnsSubmission(
  db: ReturnType<typeof getDb>,
  submissionId: string,
  userEmail: string
): Promise<{ isOwner: boolean; submission?: any }> {
  try {
    const result = await db
      .select()
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (result.length === 0) {
      return { isOwner: false };
    }

    const submission = result[0];
    const isOwner = submission.userEmail === userEmail;

    return { isOwner, submission: isOwner ? submission : undefined };
  } catch (error) {
    console.error('[validateUserOwnsSubmission] Database error:', error);
    return { isOwner: false };
  }
}

/**
 * Stores image file in R2 bucket with metadata
 * Side effect function - uploads to R2
 */
export async function storeImageInR2(
  bucket: R2Bucket,
  r2Key: string,
  imageFile: File,
  metadata: ImageUploadMetadata
): Promise<void> {
  try {
    // Convert File to ArrayBuffer - R2 needs known content length
    const imageBuffer = await imageFile.arrayBuffer();

    await bucket.put(r2Key, imageBuffer, {
      httpMetadata: {
        contentType: imageFile.type,
        contentDisposition: `inline; filename="${metadata.title.replace(/[^a-zA-Z0-9.-]/g, '_')}"`,
      },
      customMetadata: {
        submissionId: metadata.submissionId,
        uploadedBy: metadata.uploadedBy,
        title: metadata.title,
        description: metadata.description,
        contestId: metadata.contestId,
        categoryId: metadata.categoryId,
        originalFilename: imageFile.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log(`[storeImageInR2] Successfully stored image: ${r2Key}`);
  } catch (error) {
    console.error(`[storeImageInR2] Failed to store image ${r2Key}:`, error);
    throw new Error(
      `Failed to store image in R2: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Stores image in R2 with retry logic (up to 3 attempts)
 * Side effect function - uploads to R2 with retries
 */
export async function storeImageInR2WithRetry(
  bucket: R2Bucket,
  r2Key: string,
  imageFile: File,
  metadata: ImageUploadMetadata,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[storeImageInR2WithRetry] Attempt ${attempt}/${maxRetries} for ${r2Key}`
      );

      await storeImageInR2(bucket, r2Key, imageFile, metadata);

      console.log(
        `[storeImageInR2WithRetry] Successfully uploaded on attempt ${attempt}`
      );
      return; // Success - exit the retry loop
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      console.error(
        `[storeImageInR2WithRetry] Attempt ${attempt}/${maxRetries} failed for ${r2Key}:`,
        lastError.message
      );

      // If this is the last attempt, don't wait
      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s)
      const waitTime = Math.pow(2, attempt - 1) * 1000;
      console.log(
        `[storeImageInR2WithRetry] Waiting ${waitTime}ms before retry...`
      );
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // All attempts failed
  throw new Error(
    `Failed to store image in R2 after ${maxRetries} attempts. Last error: ${lastError?.message}`
  );
}

/**
 * Complete upload process: Store image in R2 (with retries) then store metadata
 * Ensures proper sequencing and error handling
 */
export async function uploadImageWithMetadata(
  bucket: R2Bucket,
  db: ReturnType<typeof getDb>,
  imageFile: File,
  uploadData: UploadData
): Promise<void> {
  console.log(
    `[uploadImageWithMetadata] Starting upload process for ${uploadData.submissionId}`
  );

  try {
    // Step 1: Store image in R2 with retry logic
    console.log(`[uploadImageWithMetadata] Step 1: Uploading image to R2...`);

    await storeImageInR2WithRetry(bucket, uploadData.r2Key, imageFile, {
      submissionId: uploadData.submissionId,
      uploadedBy: uploadData.userEmail,
      title: uploadData.title,
      description: uploadData.description,
      contestId: uploadData.contestId,
      categoryId: uploadData.categoryId,
    });

    console.log(
      `[uploadImageWithMetadata] Step 1: ✅ Image successfully uploaded to R2`
    );

    // Step 2: Store metadata in database (only after successful R2 upload)
    console.log(
      `[uploadImageWithMetadata] Step 2: Storing metadata in database...`
    );

    await storeSubmissionMetadata(db, {
      id: uploadData.submissionId,
      contestId: uploadData.contestId,
      categoryId: uploadData.categoryId,
      userEmail: uploadData.userEmail,
      title: uploadData.title,
      description: uploadData.description,
      r2Key: uploadData.r2Key,
      imageUrl: uploadData.imageUrl,
      originalFilename: uploadData.originalFilename,
      fileSize: uploadData.fileSize,
      contentType: uploadData.contentType,
    });

    console.log(
      `[uploadImageWithMetadata] Step 2: ✅ Metadata successfully stored in database`
    );
    console.log(
      `[uploadImageWithMetadata] ✅ Complete upload process successful for ${uploadData.submissionId}`
    );
  } catch (error) {
    console.error(
      `[uploadImageWithMetadata] ❌ Upload process failed for ${uploadData.submissionId}:`,
      error
    );

    // If R2 upload succeeded but database failed, we should clean up the R2 file
    if (
      error instanceof Error &&
      error.message.includes('Failed to store submission metadata')
    ) {
      console.log(
        `[uploadImageWithMetadata] Cleaning up R2 file due to database failure...`
      );
      try {
        await deleteImageFromR2(bucket, uploadData.r2Key);
        console.log(
          `[uploadImageWithMetadata] ✅ Successfully cleaned up R2 file`
        );
      } catch (cleanupError) {
        console.error(
          `[uploadImageWithMetadata] ⚠️ Failed to clean up R2 file:`,
          cleanupError
        );
        // Don't throw here - the main error is more important
      }
    }

    throw error; // Re-throw the original error
  }
}

/**
 * Deletes image file from R2 bucket
 * Side effect function - deletes from R2
 */
export async function deleteImageFromR2(
  bucket: R2Bucket,
  r2Key: string
): Promise<void> {
  try {
    await bucket.delete(r2Key);
    console.log(`[deleteImageFromR2] Successfully deleted image: ${r2Key}`);
  } catch (error) {
    console.error(
      `[deleteImageFromR2] Failed to delete image ${r2Key}:`,
      error
    );
    throw new Error(
      `Failed to delete image from R2: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Stores submission metadata in database
 * Side effect function - writes to database
 */
export async function storeSubmissionMetadata(
  db: ReturnType<typeof getDb>,
  data: SubmissionMetadata
): Promise<void> {
  try {
    await db.insert(submissions).values({
      id: data.id,
      contestId: data.contestId,
      categoryId: data.categoryId,
      userEmail: data.userEmail,
      title: data.title,
      description: data.description,
      r2Key: data.r2Key,
      imageUrl: data.imageUrl,
      originalFilename: data.originalFilename,
      fileSize: data.fileSize,
      contentType: data.contentType,
      uploadedAt: new Date().toISOString(),
    });

    console.log(
      `[storeSubmissionMetadata] Successfully stored metadata for submission: ${data.id}`
    );
  } catch (error) {
    console.error(
      `[storeSubmissionMetadata] Failed to store metadata for ${data.id}:`,
      error
    );
    throw new Error(
      `Failed to store submission metadata: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Hard deletes submission from database
 * Side effect function - deletes from database
 */
export async function deleteSubmission(
  db: ReturnType<typeof getDb>,
  submissionId: string
): Promise<void> {
  try {
    await db.delete(submissions).where(eq(submissions.id, submissionId));
    console.log(
      `[deleteSubmission] Successfully deleted submission: ${submissionId}`
    );
  } catch (error) {
    console.error(
      `[deleteSubmission] Failed to delete submission ${submissionId}:`,
      error
    );
    throw new Error(
      `Failed to delete submission: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

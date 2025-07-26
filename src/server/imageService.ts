import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { getDb } from '../db/index.js';
import { submissions } from '../db/index.js';

/**
 * Generates unique R2 key and submission ID for image storage
 * Pure function - no side effects
 */
export function generateR2Key(
  contestId: string,
  categoryId: string,
  userEmail: string,
  fileExtension: string
): { submissionId: string; r2Key: string } {
  const submissionId = nanoid();
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
  metadata: {
    submissionId: string;
    uploadedBy: string;
    title: string;
    description: string;
    contestId: string;
    categoryId: string;
  }
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
  data: {
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
  }
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

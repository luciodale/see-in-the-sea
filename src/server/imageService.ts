import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDb, submissions } from '../db/index.js';

/**
 * Generates a unique R2 key for an image
 * Pure function - deterministic based on inputs
 */
export function generateR2Key(
  contestId: string,
  categoryId: string,
  userEmail: string,
  fileExtension: string
): { submissionId: string; r2Key: string } {
  const submissionId = nanoid();
  const r2Key = `2025/${contestId}/${categoryId}/${userEmail}/${submissionId}.${fileExtension}`;
  
  return { submissionId, r2Key };
}

/**
 * Generates the served image URL (R2 key without extension)
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
): Promise<{
  isOwner: boolean;
  submission: any | null;
}> {
  const submissionResult = await db
    .select()
    .from(submissions)
    .where(and(
      eq(submissions.id, submissionId),
      eq(submissions.userEmail, userEmail),
      eq(submissions.isActive, true)
    ))
    .limit(1);

  return {
    isOwner: submissionResult.length > 0,
    submission: submissionResult[0] || null
  };
}

/**
 * Stores image in R2 bucket
 * Side effect function - but isolated
 */
export async function storeImageInR2(
  R2Bucket: R2Bucket,
  r2Key: string,
  image: File,
  metadata: {
    submissionId: string;
    uploadedBy: string;
    title: string;
    description: string;
    contestId: string;
    categoryId: string;
  }
): Promise<void> {
  await R2Bucket.put(r2Key, image, {
    httpMetadata: {
      contentType: image.type,
    },
    customMetadata: {
      ...metadata,
      uploadedAt: new Date().toISOString()
    }
  });
}

/**
 * Deletes image from R2 bucket
 * Side effect function - but isolated
 */
export async function deleteImageFromR2(
  R2Bucket: R2Bucket,
  r2Key: string
): Promise<void> {
  await R2Bucket.delete(r2Key);
}

/**
 * Stores submission metadata in database
 * Side effect function - but isolated
 */
export async function storeSubmissionMetadata(
  db: ReturnType<typeof getDb>,
  submissionData: {
    id: string;
    contestId: string;
    categoryId: string;
    userEmail: string;
    title: string;
    description: string | null;
    r2Key: string;
    imageUrl: string;
    originalFilename: string;
    fileSize: number;
    contentType: string;
  }
): Promise<void> {
  await db.insert(submissions).values({
    ...submissionData,
    uploadedAt: new Date().toISOString(),
    isActive: true
  });
}

/**
 * Deletes a submission from the database (hard delete)
 * Side effect function - but isolated
 */
export async function deleteSubmission(
  db: ReturnType<typeof getDb>,
  submissionId: string
): Promise<void> {
  await db
    .delete(submissions)
    .where(eq(submissions.id, submissionId));
} 
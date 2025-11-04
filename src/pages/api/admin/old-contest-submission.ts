import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDb } from '../../../db';
import { contests, results, submissions } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { CreateOldContestSubmissionResponse } from '../../../types/api';

export const prerender = false;

// Helper function to upload image to R2
async function uploadToR2(
  file: File,
  r2Bucket: R2Bucket,
  imageId: string
): Promise<void> {
  const buffer = await file.arrayBuffer();
  await r2Bucket.put(imageId, buffer, {
    httpMetadata: {
      contentType: file.type,
    },
  });
}

// Helper function to delete from R2
async function deleteFromR2(
  r2Bucket: R2Bucket,
  imageId: string
): Promise<void> {
  try {
    await r2Bucket.delete(imageId);
  } catch (error) {
    console.error(`Failed to delete ${imageId} from R2:`, error);
  }
}

// POST: Create or edit old contest submission (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[admin-old-contest-submission] Processing submission request');

  const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
  const D1Database = locals.runtime.env.DB;

  if (!R2Bucket || !D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Configurazione server mancante',
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  let uploadedImageId: string | null = null;
  let createdSubmissionId: string | null = null;
  let createdResultId: string | null = null;
  let isEdit = false;

  try {
    // Admin authentication (returns 404 if not admin)
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    // Parse form data
    const formData = await request.formData();
    isEdit = formData.get('isEdit') === 'true';
    const submissionId = formData.get('submissionId')?.toString();
    const contestId = formData.get('contestId')?.toString();
    const categoryId = formData.get('categoryId')?.toString();
    const firstName = formData.get('firstName')?.toString();
    const lastName = formData.get('lastName')?.toString();
    const title = formData.get('title')?.toString();
    const description = formData.get('description')?.toString() || null;
    const resultPlacement = formData.get('resultPlacement')?.toString();
    const imageFileEntry = formData.get('image');
    const imageFile = imageFileEntry instanceof File ? imageFileEntry : null;

    // Validation
    if (
      !contestId ||
      !categoryId ||
      !firstName ||
      !lastName ||
      !title ||
      !resultPlacement
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Tutti i campi obbligatori devono essere compilati',
        }),
        { status: 400 }
      );
    }

    // For new submissions, image is required
    if (!isEdit && !imageFile) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "L'immagine è obbligatoria per nuove submissions",
        }),
        { status: 400 }
      );
    }

    // Verify contest exists and is not current/future
    const contestResult = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (contestResult.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Concorso non trovato',
        }),
        { status: 404 }
      );
    }

    const currentYear = new Date().getFullYear();
    if (contestResult[0].year >= currentYear) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Non puoi modificare concorsi attuali o futuri',
        }),
        { status: 403 }
      );
    }

    // If editing, verify submission exists
    if (isEdit && submissionId) {
      const existing = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

      if (existing.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Submission non trovata',
          }),
          { status: 404 }
        );
      }
    }

    // Step 1: Upload to R2 if image is provided
    let r2ImageId = null;
    let originalFilename = null;
    let fileSize = null;
    let contentType = null;

    if (imageFile && imageFile.size > 0) {
      uploadedImageId = nanoid();
      r2ImageId = uploadedImageId;
      originalFilename = imageFile.name;
      fileSize = imageFile.size;
      contentType = imageFile.type;

      await uploadToR2(imageFile, R2Bucket, uploadedImageId);
      console.log(
        `[admin-old-contest-submission] Uploaded to R2: ${uploadedImageId}`
      );
    }

    // Step 2: Create or update submission in D1
    if (isEdit && submissionId) {
      // Update existing submission
      const updateData: Record<string, string | number | null> = {
        title,
        description,
      };

      if (r2ImageId) {
        updateData.r2ImageId = r2ImageId;
        updateData.originalFilename = originalFilename;
        updateData.fileSize = fileSize;
        updateData.contentType = contentType;
      }

      await db
        .update(submissions)
        .set(updateData)
        .where(eq(submissions.id, submissionId));

      createdSubmissionId = submissionId;
      console.log(
        `[admin-old-contest-submission] Updated submission: ${submissionId}`
      );
    } else {
      // Create new submission
      createdSubmissionId = nanoid();

      await db.insert(submissions).values({
        id: createdSubmissionId,
        contestId,
        categoryId,
        userEmail: 'old-contest-admin@example.com', // Placeholder for old contests
        title,
        description,
        r2ImageId,
        originalFilename,
        fileSize,
        contentType,
      });

      console.log(
        `[admin-old-contest-submission] Created submission: ${createdSubmissionId}`
      );
    }

    // Step 3: Create or update result in D1
    if (isEdit && submissionId) {
      // Check if result exists
      const existingResult = await db
        .select()
        .from(results)
        .where(eq(results.submissionId, submissionId))
        .limit(1);

      if (existingResult.length > 0) {
        // Update existing result
        createdResultId = existingResult[0].id;

        await db
          .update(results)
          .set({
            result: resultPlacement,
            firstName,
            lastName,
          })
          .where(eq(results.submissionId, submissionId));

        console.log(
          `[admin-old-contest-submission] Updated result for: ${submissionId}`
        );
      } else {
        // Create result if it doesn't exist
        createdResultId = nanoid();
        await db.insert(results).values({
          id: createdResultId,
          submissionId,
          result: resultPlacement,
          firstName,
          lastName,
        });

        console.log(
          `[admin-old-contest-submission] Created result: ${createdResultId}`
        );
      }
    } else {
      // Create new result
      createdResultId = nanoid();
      await db.insert(results).values({
        id: createdResultId,
        submissionId: createdSubmissionId,
        result: resultPlacement,
        firstName,
        lastName,
      });

      console.log(
        `[admin-old-contest-submission] Created result: ${createdResultId}`
      );
    }

    // At this point, both IDs must be set
    if (!createdSubmissionId || !createdResultId) {
      throw new Error('Failed to create submission or result');
    }

    const response = {
      success: true,
      data: {
        submissionId: createdSubmissionId,
        resultId: createdResultId,
      },
      message: isEdit
        ? 'Submission aggiornata con successo'
        : 'Submission creata con successo',
    } satisfies CreateOldContestSubmissionResponse;

    return new Response(JSON.stringify(response), {
      status: isEdit ? 200 : 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-old-contest-submission] Error:', error);

    // Rollback: Only for new creations, not edits
    if (!isEdit) {
      try {
        console.log(
          '[admin-old-contest-submission] Rolling back new creation...'
        );

        // Delete newly created result first (due to foreign key)
        if (createdResultId) {
          console.log(
            `[admin-old-contest-submission] Rolling back result: ${createdResultId}`
          );
          await db.delete(results).where(eq(results.id, createdResultId));
        }

        // Then delete submission
        if (createdSubmissionId) {
          console.log(
            `[admin-old-contest-submission] Rolling back submission: ${createdSubmissionId}`
          );
          await db
            .delete(submissions)
            .where(eq(submissions.id, createdSubmissionId));
        }

        // Finally delete from R2
        if (uploadedImageId) {
          console.log(
            `[admin-old-contest-submission] Rolling back R2: ${uploadedImageId}`
          );
          await deleteFromR2(R2Bucket, uploadedImageId);
        }
      } catch (rollbackError) {
        console.error(
          '[admin-old-contest-submission] Rollback error:',
          rollbackError
        );
      }
    } else {
      // For edits, only clean up newly uploaded image if any
      if (uploadedImageId) {
        try {
          console.log(
            `[admin-old-contest-submission] Cleaning up new image: ${uploadedImageId}`
          );
          await deleteFromR2(R2Bucket, uploadedImageId);
        } catch (cleanupError) {
          console.error(
            '[admin-old-contest-submission] Image cleanup error:',
            cleanupError
          );
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Errore durante la creazione/modifica della submission',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

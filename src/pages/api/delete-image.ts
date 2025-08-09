import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { submissions } from '../../db/schema.js';
import { authenticateRequest } from '../../server/authenticateRequest';
import { deleteImageFromR2, deleteSubmission } from '../../server/imageService';

export const prerender = false;

/**
 * DELETE /api/delete-image
 * Body: { submissionId: string }
 * Deletes a submission (image + metadata) owned by the authenticated user
 */
export const DELETE: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;

  if (!D1Database || !R2Bucket) {
    return new Response(
      JSON.stringify({ success: false, message: 'Server configuration error' }),
      { status: 500 }
    );
  }

  try {
    const { isAuthenticated, user, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const db = getDb(D1Database);
    const { submissionId } = (await request.json()) as {
      submissionId?: string;
    };

    if (!submissionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'submissionId is required' }),
        { status: 400 }
      );
    }

    // Verify ownership of submission
    const rows = await db
      .select({ id: submissions.id, r2Key: submissions.r2Key })
      .from(submissions)
      .where(
        and(
          eq(submissions.id, submissionId),
          eq(submissions.userEmail, user.emailAddress || '')
        )
      )
      .limit(1);

    const submission = rows[0];
    if (!submission) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Submission not found or not owned by user',
        }),
        { status: 404 }
      );
    }

    // Delete from R2 and DB
    await deleteImageFromR2(R2Bucket, submission.r2Key);
    await deleteSubmission(db, submissionId);

    return new Response(
      JSON.stringify({ success: true, message: 'Submission deleted' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[delete-image] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to delete submission',
      }),
      { status: 500 }
    );
  }
};

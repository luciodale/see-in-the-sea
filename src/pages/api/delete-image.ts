import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index';
import { submissions } from '../../db/schema';
import { authenticateRequest } from '../../server/authenticateRequest';
import { deleteImageFromR2, deleteSubmission } from '../../server/imageService';

export const prerender = false;

/**
 * DELETE /api/delete-image
 * Body: { submissionId: string, adminDelete?: boolean }
 * Deletes a submission (image + metadata) owned by the authenticated user
 * If adminDelete is true, admin can delete any submission
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
    const { isAuthenticated, user, isAdminRole, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const db = getDb(D1Database);
    const { submissionId, adminDelete } = (await request.json()) as {
      submissionId?: string;
      adminDelete?: boolean;
    };

    if (!submissionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'submissionId is required' }),
        { status: 400 }
      );
    }

    // Verify ownership of submission (unless admin delete)
    let submission;
    if (adminDelete) {
      // Verify admin role
      if (!isAdminRole()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Access denied. Admin role required for admin delete.',
            error: 'INSUFFICIENT_PERMISSIONS',
          }),
          { status: 403 }
        );
      }

      // Admin can delete any submission
      const rows = await db
        .select({ id: submissions.id, r2Key: submissions.r2Key })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

      submission = rows[0];
      if (!submission) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Submission not found',
          }),
          { status: 404 }
        );
      }

      console.log(
        `[delete-image] Admin ${user.id} deleting submission ${submissionId}`
      );
    } else {
      // Regular user can only delete their own submissions
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

      submission = rows[0];
      if (!submission) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Submission not found or not owned by user',
          }),
          { status: 404 }
        );
      }
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

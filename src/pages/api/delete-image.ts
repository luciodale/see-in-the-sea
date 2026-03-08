import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index';
import { payments, submissions } from '../../db/schema';
import { getBackendTranslation } from '../../i18n/utils';
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
      JSON.stringify({
        success: false,
        message: getBackendTranslation('error.server-configuration', request),
      }),
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
        JSON.stringify({
          success: false,
          message: getBackendTranslation(
            'error.submission-id-required',
            request
          ),
        }),
        { status: 400 }
      );
    }

    // Verify ownership of submission (unless admin delete)
    let submission:
      | { id: string; r2ImageId: string | null; contestId?: string }
      | undefined;
    if (adminDelete) {
      // Verify admin role
      if (!isAdminRole()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: getBackendTranslation(
              'error.access-denied-admin-delete',
              request
            ),
            error: getBackendTranslation(
              'error.insufficient-permissions',
              request
            ),
          }),
          { status: 403 }
        );
      }

      // Admin can delete any submission
      const rows = await db
        .select({ id: submissions.id, r2ImageId: submissions.r2ImageId })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

      submission = rows[0];
      if (!submission) {
        return new Response(
          JSON.stringify({
            success: false,
            message: getBackendTranslation(
              'error.submission-not-found',
              request
            ),
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
        .select({
          id: submissions.id,
          r2ImageId: submissions.r2ImageId,
          contestId: submissions.contestId,
        })
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
            message: getBackendTranslation(
              'error.submission-not-owned',
              request
            ),
          }),
          { status: 404 }
        );
      }

      // Check if user has paid for this contest
      // contestId is always present in this branch (regular user query includes it)
      const contestIdValue = submission.contestId ?? '';
      const payment = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.contestId, contestIdValue),
            eq(payments.userEmail, user.emailAddress || '')
          )
        )
        .limit(1);

      if (payment.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: getBackendTranslation('error.submissions-locked', request),
          }),
          { status: 403 }
        );
      }
    }

    // Delete from R2 and DB
    if (!submission.r2ImageId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.image-not-found', request),
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await deleteImageFromR2(R2Bucket, submission.r2ImageId);
    await deleteSubmission(db, submissionId);

    return new Response(
      JSON.stringify({
        success: true,
        message: getBackendTranslation('success.submission-deleted', request),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[delete-image] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: getBackendTranslation(
          'error.failed-to-delete-submission',
          request
        ),
      }),
      { status: 500 }
    );
  }
};

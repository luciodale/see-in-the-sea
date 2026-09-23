import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index';
import { payments, submissions } from '../../db/schema';
import { getBackendTranslation } from '../../i18n/utils';
import { authenticateRequest } from '../../server/authenticateRequest';

export const prerender = false;

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

type UpdateSubmissionBody = {
  submissionId?: string;
  title?: string;
  description?: string;
};

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * PATCH /api/update-submission
 * Body: { submissionId: string, title: string, description?: string }
 * Edits the title and description of a submission owned by the authenticated
 * user. Locked once the user has paid for that contest, exactly like delete.
 */
export const PATCH: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;

  if (!D1Database) {
    return errorResponse(
      getBackendTranslation('error.server-configuration', request),
      500
    );
  }

  try {
    const { isAuthenticated, user, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const db = getDb(D1Database);
    const body = (await request.json()) as UpdateSubmissionBody;
    const submissionId = body.submissionId;
    const title = body.title?.trim() ?? '';
    const description = body.description?.trim() ?? '';

    if (!submissionId) {
      return errorResponse(
        getBackendTranslation('error.submission-id-required', request),
        400
      );
    }

    // A submission always needs a title: the jury sees it next to the photo
    if (!title) {
      return errorResponse(
        getBackendTranslation('error.title-required', request),
        400
      );
    }

    if (
      title.length > TITLE_MAX_LENGTH ||
      description.length > DESCRIPTION_MAX_LENGTH
    ) {
      return errorResponse(
        getBackendTranslation('error.field-too-long', request),
        400
      );
    }

    const rows = await db
      .select({
        id: submissions.id,
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

    const submission = rows[0];
    if (!submission) {
      return errorResponse(
        getBackendTranslation('error.submission-not-owned', request),
        404
      );
    }

    const payment = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.contestId, submission.contestId),
          eq(payments.userEmail, user.emailAddress || '')
        )
      )
      .limit(1);

    if (payment.length > 0) {
      return errorResponse(
        getBackendTranslation('error.submissions-locked', request),
        403
      );
    }

    await db
      .update(submissions)
      .set({ title, description: description || null })
      .where(eq(submissions.id, submissionId));

    return new Response(
      JSON.stringify({
        success: true,
        data: { submissionId, title, description: description || null },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[update-submission] Error updating submission:', error);
    return errorResponse(
      getBackendTranslation('error.server-configuration', request),
      500
    );
  }
};

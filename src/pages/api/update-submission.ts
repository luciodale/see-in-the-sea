import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index';
import { submissions } from '../../db/schema';
import { getBackendTranslation } from '../../i18n/utils';
import { authenticateRequest } from '../../server/authenticateRequest';

export const prerender = false;

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

// The only keys this endpoint accepts. Anything else (image, category,
// contest, portfolio...) is refused so the photo itself can never change here.
const ALLOWED_KEYS = new Set([
  'submissionId',
  'title',
  'description',
  'adminUserEmail',
]);

type UpdateSubmissionBody = {
  submissionId: string;
  title: string;
  description: string;
  adminUserEmail?: string;
};

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(raw: unknown): UpdateSubmissionBody | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null;
  }
  const entries = Object.entries(raw);
  if (entries.some(([key]) => !ALLOWED_KEYS.has(key))) return null;

  const body = Object.fromEntries(entries);
  const { submissionId, title, description, adminUserEmail } = body;
  if (typeof submissionId !== 'string' || submissionId.length === 0) {
    return null;
  }
  if (typeof title !== 'string') return null;
  if (description !== undefined && typeof description !== 'string') {
    return null;
  }
  if (adminUserEmail !== undefined && typeof adminUserEmail !== 'string') {
    return null;
  }

  return {
    submissionId,
    title: title.trim(),
    description: (description ?? '').trim(),
    adminUserEmail: adminUserEmail?.trim() || undefined,
  };
}

/**
 * PATCH /api/update-submission
 * Body: { submissionId, title, description?, adminUserEmail? }
 * Edits only the title and description of a submission. The image and every
 * other field stay untouched. Allowed after payment, since the photo is fixed.
 * With adminUserEmail, an admin edits on behalf of that user (impersonation).
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
    const { isAuthenticated, user, isAdminRole, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const db = getDb(D1Database);
    const body = parseBody(await request.json());

    if (!body) {
      return errorResponse(
        getBackendTranslation('error.metadata-only', request),
        400
      );
    }

    const { submissionId, title, description, adminUserEmail } = body;

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

    if (adminUserEmail && !isAdminRole()) {
      return errorResponse(
        getBackendTranslation('error.access-denied-admin-edit', request),
        403
      );
    }

    // Owner is the impersonated user for admins, otherwise the caller
    const ownerEmail = adminUserEmail ?? user.emailAddress ?? '';
    if (adminUserEmail) {
      console.log(
        `[update-submission] Admin ${user.id} editing ${submissionId} on behalf of ${ownerEmail}`
      );
    }

    const rows = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(
        and(
          eq(submissions.id, submissionId),
          eq(submissions.userEmail, ownerEmail)
        )
      )
      .limit(1);

    if (!rows[0]) {
      return errorResponse(
        getBackendTranslation('error.submission-not-owned', request),
        404
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

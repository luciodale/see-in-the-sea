import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { contests, results, submissions } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { DeleteSubmissionResponse } from '../../../types/api';

export const prerender = false;

// DELETE: Delete old contest submission and its result (admin only)
export const DELETE: APIRoute = async ({ request, locals }) => {
  console.log(
    '[admin-delete-old-contest-submission] Processing delete request'
  );

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

  try {
    // Admin authentication (returns 404 if not admin)
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    // Get submission ID from query params
    const url = new URL(request.url);
    const submissionId = url.searchParams.get('submissionId');

    if (!submissionId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ID submission è obbligatorio',
        }),
        { status: 400 }
      );
    }

    // Fetch submission with contest info
    const submissionWithContest = await db
      .select({
        submission: submissions,
        contest: contests,
      })
      .from(submissions)
      .leftJoin(contests, eq(contests.id, submissions.contestId))
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (submissionWithContest.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Submission non trovata',
        }),
        { status: 404 }
      );
    }

    const submission = submissionWithContest[0].submission;
    const contest = submissionWithContest[0].contest;

    // Prevent deletion of current/future contest submissions
    if (contest) {
      const currentYear = new Date().getFullYear();
      if (contest.year >= currentYear) {
        return new Response(
          JSON.stringify({
            success: false,
            message:
              'Non puoi eliminare submission da concorsi attuali o futuri',
          }),
          { status: 403 }
        );
      }
    }

    // Delete from results table first (foreign key constraint)
    await db.delete(results).where(eq(results.submissionId, submissionId));
    console.log(
      `[admin-delete-old-contest-submission] Deleted result for: ${submissionId}`
    );

    // Delete from submissions table
    await db.delete(submissions).where(eq(submissions.id, submissionId));
    console.log(
      `[admin-delete-old-contest-submission] Deleted submission: ${submissionId}`
    );

    // Delete from R2 if image exists
    if (submission.r2ImageId) {
      try {
        await R2Bucket.delete(submission.r2ImageId);
        console.log(
          `[admin-delete-old-contest-submission] Deleted from R2: ${submission.r2ImageId}`
        );
      } catch (error) {
        console.error(
          `[admin-delete-old-contest-submission] Failed to delete from R2: ${submission.r2ImageId}`,
          error
        );
        // Don't fail the request if R2 deletion fails
      }
    }

    const response = {
      success: true,
      message: 'Submission eliminata con successo',
    } satisfies DeleteSubmissionResponse;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-delete-old-contest-submission] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Errore durante l'eliminazione della submission",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import {
  categories,
  contests,
  judges,
  results,
  submissions,
} from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { ContestDetailsResponse } from '../../../types/api';

export const prerender = false;

// GET: Fetch contest with submissions, results, and judges (admin only)
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[admin-contest-details] Processing contest details request');

  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database non disponibile',
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

    // Get contest ID from query params
    const url = new URL(request.url);
    const contestId = url.searchParams.get('contestId');

    if (!contestId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ID concorso è obbligatorio',
        }),
        { status: 400 }
      );
    }

    // Fetch contest
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

    const contest = contestResult[0];

    // Fetch judges
    const judgesResult = await db
      .select()
      .from(judges)
      .where(eq(judges.contestId, contestId));

    // Fetch submissions with results and categories
    const submissionsWithResults = await db
      .select({
        submission: submissions,
        result: results,
        category: categories,
      })
      .from(submissions)
      .leftJoin(results, eq(results.submissionId, submissions.id))
      .leftJoin(categories, eq(categories.id, submissions.categoryId))
      .where(eq(submissions.contestId, contestId));

    const response = {
      success: true,
      data: {
        contest,
        judges: judgesResult,
        submissions: submissionsWithResults.map(row => ({
          ...row.submission,
          result: row.result,
          category: row.category,
        })),
      },
    } satisfies ContestDetailsResponse;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-contest-details] Error fetching contest:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Impossibile recuperare i dettagli del concorso',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

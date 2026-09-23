import type { APIRoute } from 'astro';
import { getDb } from '../../../db';
import { contests } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { ContestYearsResponse } from '../../../types/api';

export const prerender = false;

// GET: List all contest years (admin only)
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[admin-old-contests] Processing list contests request');

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

    // Fetch all contest years
    const allContests = await db
      .select({ year: contests.year })
      .from(contests)
      .orderBy(contests.year);

    const years = allContests.map(c => c.year);

    const response = {
      success: true,
      data: { years },
    } satisfies ContestYearsResponse;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-old-contests] Error fetching contests:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Impossibile recuperare i concorsi',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

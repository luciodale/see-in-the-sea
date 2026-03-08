import type { APIRoute } from 'astro';
import { desc } from 'drizzle-orm';
import { getDb } from '../../../db';
import { contests } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { AllContestsResponse } from '../../../types/api';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database non disponibile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const db = getDb(D1Database);

  try {
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    const allContests = await db
      .select({
        id: contests.id,
        name: contests.name,
        year: contests.year,
        status: contests.status,
      })
      .from(contests)
      .orderBy(desc(contests.year));

    const response: AllContestsResponse = {
      success: true,
      data: allContests,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-all-contests] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Impossibile recuperare i concorsi',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

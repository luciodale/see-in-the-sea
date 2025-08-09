import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import { judges } from '../../db/schema.js';
import { authenticateRequest } from '../../server/authenticateRequest';

export const prerender = false;

/**
 * GET /api/judges?contestId=:contestId
 * Returns the list of judge names for a given contest
 */
export const GET: APIRoute = async ({ request, locals, url }) => {
  const D1Database = locals.runtime.env.DB;

  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database not available' }),
      { status: 500 }
    );
  }

  try {
    // Require auth to keep API consistent with other user routes
    const { isAuthenticated, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const contestId = url.searchParams.get('contestId');
    if (!contestId) {
      return new Response(
        JSON.stringify({ success: false, message: 'contestId is required' }),
        { status: 400 }
      );
    }

    const db = getDb(D1Database);
    const rows = await db
      .select({ fullName: judges.fullName })
      .from(judges)
      .where(eq(judges.contestId, contestId));

    return new Response(JSON.stringify({ success: true, data: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[judges] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch judges',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

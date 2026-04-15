import type { APIRoute } from 'astro';
import { isNotNull } from 'drizzle-orm';
import { getDb } from '../../../db';
import { judges } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { JudgesLibraryResponse } from '../../../types/api';

export const prerender = false;

// GET: distinct (r2ImageId, fullName) tuples across all judges with a photo.
// Used by the admin panel to let you pick an existing judge photo when adding
// a new judge for another contest (same person, reused photo).
export const GET: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database non disponibile' }),
      { status: 500 }
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

    const rows = await db
      .select({
        fullName: judges.fullName,
        r2ImageId: judges.r2ImageId,
      })
      .from(judges)
      .where(isNotNull(judges.r2ImageId));

    const seen = new Set<string>();
    const library: Array<{ fullName: string; r2ImageId: string }> = [];
    for (const row of rows) {
      if (!row.r2ImageId || seen.has(row.r2ImageId)) continue;
      seen.add(row.r2ImageId);
      library.push({ fullName: row.fullName, r2ImageId: row.r2ImageId });
    }

    const response: JudgesLibraryResponse = {
      success: true,
      data: library,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-judges-library] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Errore durante il recupero della libreria giudici',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

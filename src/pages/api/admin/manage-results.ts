import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb, results } from '../../../db/index.js';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type {
  UpdateResultRequest,
  UpdateResultResponse,
} from '../../../types/api.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database not available' }),
      { status: 500 }
    );
  }

  const authRequestClone = request.clone() as typeof request;
  const { isAuthenticated, isAdmin, unauthenticatedResponse } =
    await authenticateAdmin(authRequestClone, locals);
  if (!isAuthenticated || !isAdmin) return unauthenticatedResponse();

  const body: UpdateResultRequest = await request.json();
  const { resultId, result: placement, firstName, lastName } = body;
  if (!resultId || !placement) {
    return new Response(
      JSON.stringify({ success: false, message: 'Missing resultId or result' }),
      { status: 400 }
    );
  }

  const db = getDb(D1Database);
  try {
    await db
      .update(results)
      .set({ result: placement, firstName, lastName })
      .where(eq(results.id, resultId));
    const response: UpdateResultResponse = { success: true };
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to update result',
      }),
      { status: 500 }
    );
  }
};

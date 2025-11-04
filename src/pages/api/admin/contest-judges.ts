import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDb } from '../../../db';
import { judges } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type {
  CreateJudgeResponse,
  DeleteJudgeResponse,
  UpdateJudgeResponse,
} from '../../../types/api';

export const prerender = false;

// POST: Add judge to contest (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[admin-contest-judges] Processing add judge request');

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

    // Parse request body with type annotation
    const body: {
      contestId: string;
      fullName: string;
    } = await request.json();
    const { contestId, fullName } = body;

    // Validation
    if (!contestId || !fullName || fullName.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ID concorso e nome giudice sono obbligatori',
        }),
        { status: 400 }
      );
    }

    // Verify contest exists and is not current/future
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

    const currentYear = new Date().getFullYear();
    if (contestResult[0].year >= currentYear) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Non puoi modificare giudici di concorsi attuali o futuri',
        }),
        { status: 403 }
      );
    }

    // Create judge
    const judgeId = nanoid();
    await db.insert(judges).values({
      id: judgeId,
      contestId,
      fullName: fullName.trim(),
    });

    console.log(`[admin-contest-judges] Created judge: ${judgeId}`);

    const response = {
      success: true,
      data: {
        id: judgeId,
        contestId,
        fullName: fullName.trim(),
      },
      message: 'Giudice aggiunto con successo',
    } satisfies CreateJudgeResponse;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-contest-judges] Error adding judge:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Errore durante l'aggiunta del giudice",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// PUT: Update judge (admin only)
export const PUT: APIRoute = async ({ request, locals }) => {
  console.log('[admin-contest-judges] Processing update judge request');

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

    // Parse request body with type annotation
    const body: {
      judgeId: string;
      fullName: string;
    } = await request.json();
    const { judgeId, fullName } = body;

    // Validation
    if (!judgeId || !fullName || fullName.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ID giudice e nome sono obbligatori',
        }),
        { status: 400 }
      );
    }

    // Verify judge exists and get contest info
    const judgeWithContest = await db
      .select({
        judge: judges,
        contest: contests,
      })
      .from(judges)
      .leftJoin(contests, eq(contests.id, judges.contestId))
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (judgeWithContest.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Giudice non trovato',
        }),
        { status: 404 }
      );
    }

    const contest = judgeWithContest[0].contest;
    if (contest) {
      const currentYear = new Date().getFullYear();
      if (contest.year >= currentYear) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Non puoi modificare giudici di concorsi attuali o futuri',
          }),
          { status: 403 }
        );
      }
    }

    // Update judge
    await db
      .update(judges)
      .set({ fullName: fullName.trim() })
      .where(eq(judges.id, judgeId));

    console.log(`[admin-contest-judges] Updated judge: ${judgeId}`);

    const response = {
      success: true,
      message: 'Giudice aggiornato con successo',
    } satisfies UpdateJudgeResponse;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-contest-judges] Error updating judge:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Errore durante l'aggiornamento del giudice",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// DELETE: Delete judge (admin only)
export const DELETE: APIRoute = async ({ request, locals }) => {
  console.log('[admin-contest-judges] Processing delete judge request');

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

    // Get judge ID from query params
    const url = new URL(request.url);
    const judgeId = url.searchParams.get('judgeId');

    if (!judgeId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ID giudice è obbligatorio',
        }),
        { status: 400 }
      );
    }

    // Verify judge exists and get contest info
    const judgeWithContest = await db
      .select({
        judge: judges,
        contest: contests,
      })
      .from(judges)
      .leftJoin(contests, eq(contests.id, judges.contestId))
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (judgeWithContest.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Giudice non trovato',
        }),
        { status: 404 }
      );
    }

    const contest = judgeWithContest[0].contest;
    if (contest) {
      const currentYear = new Date().getFullYear();
      if (contest.year >= currentYear) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Non puoi eliminare giudici di concorsi attuali o futuri',
          }),
          { status: 403 }
        );
      }
    }

    // Delete judge
    await db.delete(judges).where(eq(judges.id, judgeId));

    console.log(`[admin-contest-judges] Deleted judge: ${judgeId}`);

    const response = {
      success: true,
      message: 'Giudice eliminato con successo',
    } satisfies DeleteJudgeResponse;

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-contest-judges] Error deleting judge:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Errore durante l'eliminazione del giudice",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

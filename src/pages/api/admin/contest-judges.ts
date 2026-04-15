import type { APIRoute } from 'astro';
import { and, eq, ne } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDb } from '../../../db';
import { contests, judges } from '../../../db/schema';
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

    // Parse request body with type annotation. `r2ImageId` is optional and
    // used when reusing an existing judge photo via the library picker.
    const body: {
      contestId: string;
      fullName: string;
      r2ImageId?: string | null;
    } = await request.json();
    const { contestId, fullName } = body;
    const reusedR2ImageId = body.r2ImageId?.trim() || null;

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

    // Verify contest exists
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

    // If reusing a photo, validate the r2ImageId actually exists on some
    // other judge (prevents arbitrary keys being injected from the client).
    if (reusedR2ImageId) {
      const exists = await db
        .select({ id: judges.id })
        .from(judges)
        .where(eq(judges.r2ImageId, reusedR2ImageId))
        .limit(1);
      if (exists.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Immagine giudice non trovata nella libreria',
          }),
          { status: 400 }
        );
      }
    }

    // Create judge
    const judgeId = nanoid();
    await db.insert(judges).values({
      id: judgeId,
      contestId,
      fullName: fullName.trim(),
      r2ImageId: reusedR2ImageId,
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

    // Parse request body. `r2ImageId` is optional and used by the admin
    // library picker to reassign this judge's photo to an existing library
    // item. Reassignment is single-row (does NOT cascade) because we are
    // re-pointing one judge to a different existing image, not replacing the
    // image content itself.
    const body: {
      judgeId: string;
      fullName: string;
      r2ImageId?: string | null;
    } = await request.json();
    const { judgeId, fullName } = body;
    const reassignR2ImageId =
      typeof body.r2ImageId === 'string' ? body.r2ImageId.trim() || null : null;

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

    // Verify judge exists
    const existing = await db
      .select({ id: judges.id })
      .from(judges)
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (existing.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Giudice non trovato',
        }),
        { status: 404 }
      );
    }

    // If reassigning a photo, validate the library item exists.
    if (reassignR2ImageId) {
      const libraryHit = await db
        .select({ id: judges.id })
        .from(judges)
        .where(eq(judges.r2ImageId, reassignR2ImageId))
        .limit(1);
      if (libraryHit.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Immagine giudice non trovata nella libreria',
          }),
          { status: 400 }
        );
      }
    }

    // Update judge (name, and optionally photo reassignment)
    const updates: { fullName: string; r2ImageId?: string } = {
      fullName: fullName.trim(),
    };
    if (reassignR2ImageId) updates.r2ImageId = reassignR2ImageId;
    await db.update(judges).set(updates).where(eq(judges.id, judgeId));

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

    // Verify judge exists
    const existing = await db
      .select({ r2ImageId: judges.r2ImageId })
      .from(judges)
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (existing.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Giudice non trovato',
        }),
        { status: 404 }
      );
    }

    // If this judge has a photo, only delete the R2 object when no other
    // judge row references it. Photos are shared across contests for the
    // same person, so we must not delete a photo still in use.
    const r2ImageId = existing[0].r2ImageId;
    if (r2ImageId) {
      const otherUsers = await db
        .select({ id: judges.id })
        .from(judges)
        .where(and(eq(judges.r2ImageId, r2ImageId), ne(judges.id, judgeId)))
        .limit(1);

      if (otherUsers.length === 0) {
        const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
        if (R2Bucket) {
          try {
            await R2Bucket.delete(r2ImageId);
          } catch (err) {
            console.error(`Failed to delete judge image ${r2ImageId}:`, err);
          }
        }
      }
    }

    // Delete judge row
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

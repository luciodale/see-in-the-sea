import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { contests, judges } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { ApiResponse } from '../../../types/api';

export const prerender = false;

// POST: Upload judge image to R2
export const POST: APIRoute = async ({ request, locals }) => {
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
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    const formData = await request.formData();
    const judgeId = formData.get('judgeId')?.toString();
    const imageFileEntry = formData.get('image');
    const imageFile = imageFileEntry instanceof File ? imageFileEntry : null;

    if (!judgeId || !imageFile || imageFile.size === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ID giudice e immagine sono obbligatori',
        }),
        { status: 400 }
      );
    }

    // Verify judge exists and belongs to a past contest
    const judgeWithContest = await db
      .select({ judge: judges, contest: contests })
      .from(judges)
      .leftJoin(contests, eq(contests.id, judges.contestId))
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (judgeWithContest.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Giudice non trovato' }),
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
            message:
              'Non puoi modificare giudici di concorsi attuali o futuri',
          }),
          { status: 403 }
        );
      }
    }

    // Delete old image if exists
    const existingR2Id = judgeWithContest[0].judge.r2ImageId;
    if (existingR2Id) {
      try {
        await R2Bucket.delete(existingR2Id);
      } catch (err) {
        console.error(`Failed to delete old judge image ${existingR2Id}:`, err);
      }
    }

    // Upload new image: judges/{judgeId}
    const r2ImageId = `judges/${judgeId}`;
    const buffer = await imageFile.arrayBuffer();
    await R2Bucket.put(r2ImageId, buffer, {
      httpMetadata: { contentType: imageFile.type },
    });

    // Update DB
    await db
      .update(judges)
      .set({ r2ImageId })
      .where(eq(judges.id, judgeId));

    const response: ApiResponse<{ r2ImageId: string }> = {
      success: true,
      data: { r2ImageId },
      message: 'Immagine giudice caricata con successo',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-judge-image] Error uploading:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Errore durante il caricamento dell'immagine",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Remove judge image from R2
export const DELETE: APIRoute = async ({ request, locals }) => {
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
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

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

    const judgeResult = await db
      .select()
      .from(judges)
      .where(eq(judges.id, judgeId))
      .limit(1);

    if (judgeResult.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Giudice non trovato' }),
        { status: 404 }
      );
    }

    const r2ImageId = judgeResult[0].r2ImageId;
    if (r2ImageId) {
      try {
        await R2Bucket.delete(r2ImageId);
      } catch (err) {
        console.error(`Failed to delete judge image ${r2ImageId}:`, err);
      }
    }

    await db
      .update(judges)
      .set({ r2ImageId: null })
      .where(eq(judges.id, judgeId));

    const response: ApiResponse<object> = {
      success: true,
      message: 'Immagine giudice eliminata con successo',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-judge-image] Error deleting:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Errore durante l'eliminazione dell'immagine",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

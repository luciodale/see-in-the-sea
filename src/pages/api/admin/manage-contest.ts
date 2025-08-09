import type { APIRoute } from 'astro';
import { desc, eq } from 'drizzle-orm';
import { contests, getDb } from '../../../db/index.js';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type {
  CreateContestFormData,
  CreateContestResponse,
  UpdateContestRequest,
  UpdateContestResponse,
} from '../../../types/api.js';

export const prerender = false;

// GET: List all contests
export const GET: APIRoute = async ({ locals, request }) => {
  console.log('[manage-contest] Processing contest list request');

  const authRequestClone = request.clone() as typeof request;
  const { isAuthenticated, isAdmin, unauthenticatedResponse } =
    await authenticateAdmin(authRequestClone, locals);

  if (!isAuthenticated || !isAdmin) {
    return unauthenticatedResponse();
  }

  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database not available',
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Fetch all contests ordered by most recent first
    const allContests = await db
      .select()
      .from(contests)
      .orderBy(desc(contests.year));

    console.log(`[manage-contest] Found ${allContests.length} contests`);

    return new Response(
      JSON.stringify({
        success: true,
        data: allContests,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[manage-contest] Error fetching contests:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch contests',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST: Create new contest
export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[manage-contest] Processing contest creation request');

  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database not available',
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Step 1: Authentication & Admin Role Check
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, user, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    console.log(`[manage-contest] Admin access granted for user: ${user.id}`);

    // Step 2: Parse and validate request body
    const body: CreateContestFormData & {
      status?: 'active' | 'inactive' | 'assessment';
    } = await request.json();

    if (!body.id || !body.name || !body.year) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields: id, name, year',
        }),
        { status: 400 }
      );
    }

    // Step 3: Check if contest ID already exists
    const existingContest = await db
      .select()
      .from(contests)
      .where(eq(contests.id, body.id.trim()))
      .limit(1);

    if (existingContest.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Contest with ID "${body.id}" already exists. Please choose a different ID.`,
        }),
        { status: 409 }
      );
    }

    // Step 4: Create the contest
    const contestId = body.id.trim();
    const now = new Date().toISOString();

    await db.insert(contests).values({
      id: contestId,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      year: body.year,
      maxSubmissionsPerCategory: body.maxSubmissionsPerCategory || 2,
      status: body.status || 'inactive',
      createdAt: now,
      updatedAt: now,
    });

    console.log(`[manage-contest] Contest created successfully: ${contestId}`);

    // Step 5: Return success response
    const response: CreateContestResponse = {
      success: true,
      message: 'Contest created successfully!',
      data: {
        contestId,
        name: body.name,
        year: body.year,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[manage-contest] Error creating contest:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to create contest',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// PATCH: Update existing contest
export const PATCH: APIRoute = async ({ request, locals }) => {
  console.log('[manage-contest] Processing contest update request');

  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database not available' }),
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

    const body: UpdateContestRequest = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing contest id' }),
        { status: 400 }
      );
    }

    // Build update payload only with provided fields
    const payload: Record<string, unknown> = {};
    if (updates.name !== undefined) payload.name = updates.name?.trim();
    if (updates.description !== undefined)
      payload.description = updates.description?.trim() || null;
    if (updates.year !== undefined) payload.year = updates.year;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.maxSubmissionsPerCategory !== undefined)
      payload.maxSubmissionsPerCategory = updates.maxSubmissionsPerCategory;
    payload.updatedAt = new Date().toISOString();

    if (Object.keys(payload).length === 1) {
      // only updatedAt present
      return new Response(
        JSON.stringify({ success: false, message: 'No fields to update' }),
        { status: 400 }
      );
    }

    await db.update(contests).set(payload).where(eq(contests.id, id));

    const response: UpdateContestResponse = {
      success: true,
      message: 'Contest updated successfully',
      data: { id },
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[manage-contest] Error updating contest:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to update contest',
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

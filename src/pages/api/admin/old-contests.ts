import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDb } from '../../../db';
import { contests, judges } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type {
  ContestYearsResponse,
  CreateOldContestResponse,
} from '../../../types/api';

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

// POST: Create a new old contest (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[admin-old-contests] Processing create old contest request');

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
      year: number;
      judgeNames?: string[];
    } = await request.json();
    const { year, judgeNames = [] } = body;

    // Validation: year is required
    if (!year || typeof year !== 'number') {
      return new Response(
        JSON.stringify({
          success: false,
          message: "L'anno è obbligatorio e deve essere un numero",
        }),
        { status: 400 }
      );
    }

    // Validation: cannot be current year or future year
    const currentYear = new Date().getFullYear();
    if (year >= currentYear) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Non puoi creare un concorso per l'anno corrente (${currentYear}) o anni futuri`,
        }),
        { status: 400 }
      );
    }

    // Validation: check if contest for this year already exists
    const contestId = `uw-${year}`;
    const existingContest = await db
      .select()
      .from(contests)
      .where(eq(contests.id, contestId))
      .limit(1);

    if (existingContest.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Il concorso per l'anno ${year} esiste già`,
        }),
        { status: 409 }
      );
    }

    // Create the contest with predefined values
    const newContest = {
      id: contestId,
      name: `UW Contest ${year}`,
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      year: year,
      status: 'inactive' as const,
      maxSubmissionsPerCategory: 2,
    };

    await db.insert(contests).values(newContest);

    // Create judges if provided
    const createdJudges = [];
    if (judgeNames.length > 0) {
      const judgeRecords = judgeNames
        .filter(name => name.trim().length > 0)
        .map(name => ({
          id: nanoid(),
          contestId: contestId,
          fullName: name.trim(),
        }));

      if (judgeRecords.length > 0) {
        await db.insert(judges).values(judgeRecords);
        createdJudges.push(...judgeRecords);
      }
    }

    console.log(
      `[admin-old-contests] Successfully created contest: ${contestId} with ${createdJudges.length} judges`
    );

    const response = {
      success: true,
      data: {
        contest: {
          id: newContest.id,
          name: newContest.name,
          description: newContest.description,
          year: newContest.year,
          status: newContest.status,
          maxSubmissionsPerCategory: newContest.maxSubmissionsPerCategory,
        },
        judges: createdJudges.map(j => ({
          id: j.id,
          contestId: j.contestId,
          fullName: j.fullName,
        })),
      },
      message: `Concorso ${contestId} creato con successo`,
    } satisfies CreateOldContestResponse;

    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin-old-contests] Error creating contest:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Impossibile creare il concorso',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

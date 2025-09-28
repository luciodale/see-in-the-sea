import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { categories, contests, getDb } from '../../db/index';
import { getBackendTranslation } from '../../i18n/utils';
import type { ContestsResponse } from '../../types/api';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;

  if (!D1Database) {
    return new Response(
      JSON.stringify({
        message: getBackendTranslation('error.database-unavailable', request),
      }),
      {
        status: 500,
      }
    );
  }

  const db = getDb(D1Database);

  try {
    // Get the active contest (only one at a time) - Type-safe Drizzle query!
    const contestResult = await db
      .select()
      .from(contests)
      .where(eq(contests.status, 'active'))
      .orderBy(contests.createdAt)
      .limit(1);

    if (contestResult.length === 0) {
      const response: ContestsResponse = {
        success: false,
        message: getBackendTranslation('error.no-active-contest', request),
      };

      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get all active categories - Type-safe Drizzle query!
    const categoriesResult = await db.select().from(categories);

    const response: ContestsResponse = {
      success: true,
      data: {
        contest: contestResult[0],
        categories: categoriesResult,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[contests] Query error:', error);
    return new Response(
      JSON.stringify({
        message: getBackendTranslation(
          'error.failed-to-fetch-contest-categories',
          request
        ),
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

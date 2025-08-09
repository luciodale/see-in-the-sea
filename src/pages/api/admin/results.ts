import type { APIRoute } from 'astro';
import { and, asc, eq } from 'drizzle-orm';
import { categories, getDb, results, submissions } from '../../../db/index.js';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { AdminResultsResponse } from '../../../types/api.js';

// Using shared AdminResultsResponse type from types

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const contestId = url.searchParams.get('contestId') || '';
  const categoryId = url.searchParams.get('categoryId') || '';
  const userEmail = url.searchParams.get('userEmail') || '';
  const search = url.searchParams.get('search') || '';
  const limit = Number(url.searchParams.get('limit') || '20');
  const offset = Number(url.searchParams.get('offset') || '0');

  const authRequestClone = request.clone() as typeof request;
  const { isAuthenticated, isAdmin, unauthenticatedResponse } =
    await authenticateAdmin(authRequestClone, locals);

  if (!isAuthenticated || !isAdmin) {
    return unauthenticatedResponse();
  }

  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database not available' }),
      { status: 500 }
    );
  }

  if (!contestId) {
    return new Response(
      JSON.stringify({ success: false, message: 'contestId is required' }),
      { status: 400 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Fetch all results for contest, join submissions and categories
    const base = db
      .select({
        resultId: results.id,
        categoryId: submissions.categoryId,
        title: submissions.title,
        userEmail: submissions.userEmail,
        imageUrl: submissions.imageUrl,
        submissionId: submissions.id,
        result: results.result,
        categoryName: categories.name,
        r2Key: submissions.r2Key,
        contestId: submissions.contestId,
        uploadedAt: submissions.uploadedAt,
        firstName: results.firstName,
        lastName: results.lastName,
      })
      .from(results)
      .innerJoin(submissions, eq(results.submissionId, submissions.id))
      .leftJoin(categories, eq(submissions.categoryId, categories.id))
      .where(and(eq(submissions.contestId, contestId)))
      .orderBy(asc(submissions.userEmail), asc(submissions.id));

    const allRows = await base;
    const filtered = allRows.filter(
      r =>
        (!categoryId || r.categoryId === categoryId) &&
        (!userEmail || r.userEmail.includes(userEmail)) &&
        (!search || r.title.toLowerCase().includes(search.toLowerCase()))
    );
    const paged = filtered.slice(offset, offset + limit);

    const response: AdminResultsResponse = {
      success: true,
      data: paged as AdminResultsResponse['data'],
      totalCount: filtered.length,
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch results',
      }),
      { status: 500 }
    );
  }
};

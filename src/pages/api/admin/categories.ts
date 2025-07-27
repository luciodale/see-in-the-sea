import type { APIRoute } from 'astro';
import { categories, getDb } from '../../../db/index.js';
import { authenticateAdmin } from '../../../server/authenticateRequest';

export const prerender = false;

// GET: List all categories (admin only)
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[admin-categories] Processing categories list request');

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
    // Admin authentication (returns 404 if not admin)
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    console.log('isAuthenticated', isAuthenticated, 'isAdmin', isAdmin);
    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    // Fetch all categories (admin can see inactive ones too)
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.displayOrder, categories.name);

    console.log(`[admin-categories] Found ${allCategories.length} categories`);

    return new Response(
      JSON.stringify({
        success: true,
        data: allCategories,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-categories] Error fetching categories:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

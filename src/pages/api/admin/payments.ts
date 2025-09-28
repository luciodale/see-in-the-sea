import type { APIRoute } from 'astro';
import { getDb } from '../../../db/index';
import { payments, contests } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateAdmin } from '../../../server/authenticateRequest';

export const prerender = false;

// GET: List all payments (admin only)
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[admin-payments] Processing payments list request');

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

    // Fetch all payments with contest names
    const allPayments = await db
      .select({
        id: payments.id,
        contestId: payments.contestId,
        userEmail: payments.userEmail,
        amount: payments.amount,
        currency: payments.currency,
        stripeSessionId: payments.stripeSessionId,
        paidAt: payments.paidAt,
        contestName: contests.name,
      })
      .from(payments)
      .leftJoin(contests, eq(payments.contestId, contests.id))
      .orderBy(payments.paidAt);

    console.log(`[admin-payments] Found ${allPayments.length} payments`);

    return new Response(
      JSON.stringify({
        success: true,
        data: allPayments,
        totalCount: allPayments.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-payments] Error fetching payments:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch payments',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

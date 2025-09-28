import type { APIRoute } from 'astro';
import { getDb } from '../../../../db/index';
import { payments } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateAdmin } from '../../../../server/authenticateRequest';

export const prerender = false;

// DELETE: Delete payment by ID (admin only)
export const DELETE: APIRoute = async ({ request, locals, params }) => {
  console.log('[admin-payments-delete] Processing payment deletion request');

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

    // Get payment ID from URL params
    const paymentId = params?.id;
    if (!paymentId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment ID is required',
        }),
        { status: 400 }
      );
    }

    // Check if payment exists
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (existingPayment.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment not found',
        }),
        { status: 404 }
      );
    }

    // Delete the payment
    await db.delete(payments).where(eq(payments.id, paymentId));

    console.log(`[admin-payments-delete] Deleted payment ${paymentId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment deleted successfully',
        data: { id: paymentId },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[admin-payments-delete] Error deleting payment:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to delete payment',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

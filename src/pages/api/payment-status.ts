import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db';
import { payments } from '../../db/schema';
import { authenticateRequest } from '../../server/authenticateRequest';
import type { PaymentStatusResponse } from '../../types/api';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, url }) => {
  const D1Database = locals.runtime.env.DB;

  if (!D1Database) {
    return new Response('Server configuration error', { status: 500 });
  }

  try {
    const { isAuthenticated, user, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const contestId = url.searchParams.get('contestId');

    if (!contestId) {
      const response: PaymentStatusResponse = {
        success: false,
        message: 'Contest ID is required',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(D1Database);

    // Check if user has paid for this contest
    const payment = await db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.contestId, contestId),
          eq(payments.userEmail, user.emailAddress || '')
        )
      )
      .limit(1);

    const hasPaid = payment.length > 0;

    const response: PaymentStatusResponse = {
      success: true,
      data: { hasPaid },
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[payment-status] Error checking payment status:', error);
    const response: PaymentStatusResponse = {
      success: false,
      message: 'Failed to check payment status',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

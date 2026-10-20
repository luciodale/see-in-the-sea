import type { APIRoute } from 'astro';
import { getDb } from '../../db';
import { getBackendTranslation } from '../../i18n/utils';
import { authenticateRequest } from '../../server/authenticateRequest';
import { getPaidCents } from '../../server/paymentService';
import type { PaymentStatusResponse } from '../../types/api';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, url }) => {
  const D1Database = locals.runtime.env.DB;

  if (!D1Database) {
    return new Response(
      getBackendTranslation('error.server-configuration', request),
      { status: 500 }
    );
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
        message: getBackendTranslation('error.contest-id-required', request),
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(D1Database);

    // The client compares this with the categories entered to know what is
    // still owed, so the balance follows uploads and deletes without a refetch
    const paidCents = await getPaidCents(
      db,
      contestId,
      user.emailAddress || ''
    );

    const response: PaymentStatusResponse = {
      success: true,
      data: { paidCents },
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[payment-status] Error checking payment status:', error);
    const response: PaymentStatusResponse = {
      success: false,
      message: getBackendTranslation(
        'error.failed-to-check-payment-status',
        request
      ),
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

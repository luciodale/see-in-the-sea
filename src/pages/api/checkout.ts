import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import Stripe from 'stripe';
import { entryBalanceCents } from '../../constants/entryFee';
import { getDb } from '../../db';
import { contests, submissions } from '../../db/schema';
import {
  getBackendTranslation,
  getLangFromUrl,
  getLocalizedPath,
} from '../../i18n/utils';
import { authenticateRequest } from '../../server/authenticateRequest';
import { getPaidCents } from '../../server/paymentService';
import type { CheckoutResponse } from '../../types/api';
// Stripe test key should be stored in environment variables

export const prerender = false;

// Live prices. Set STRIPE_PRICE_ID_10 / _20 / _30 in .dev.vars to point
// local runs at Stripe test-mode prices instead.
const PRICE_ID_PROD_10 = 'price_1UNZb90GkfoIDCTPIlCCKe7d';
const PRICE_ID_PROD_20 = 'price_1SA7Q80GkfoIDCTPaiqKExvB';
const PRICE_ID_PROD_30 = 'price_1SA7QP0GkfoIDCTPQgyBnXsS';

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  const STRIPE_SECRET_KEY = locals.runtime.env.STRIPE_SECRET_KEY;
  const STRIPE_PRICE_ID_10 =
    locals.runtime.env.STRIPE_PRICE_ID_10 || PRICE_ID_PROD_10;
  const STRIPE_PRICE_ID_20 =
    locals.runtime.env.STRIPE_PRICE_ID_20 || PRICE_ID_PROD_20;
  const STRIPE_PRICE_ID_30 =
    locals.runtime.env.STRIPE_PRICE_ID_30 || PRICE_ID_PROD_30;

  const url = new URL(request.url);
  const DOMAIN = url.origin;

  // Get language from the referer header (the page that made the request)
  const referer = request.headers.get('referer');
  const lang = referer ? getLangFromUrl(new URL(referer)) : 'en';

  if (
    !D1Database ||
    !STRIPE_SECRET_KEY ||
    !STRIPE_PRICE_ID_10 ||
    !STRIPE_PRICE_ID_20 ||
    !STRIPE_PRICE_ID_30
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        message: getBackendTranslation('error.server-configuration', request),
      } as CheckoutResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });

  try {
    const { isAuthenticated, user, unauthenticatedResponse } =
      await authenticateRequest(request, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    const db = getDb(D1Database);

    // Get the active contest
    const activeContest = await db
      .select()
      .from(contests)
      .where(eq(contests.status, 'active'))
      .limit(1);

    if (activeContest.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.no-active-contest', request),
        } as CheckoutResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const userEmail = user.emailAddress ?? '';
    if (!userEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.internal-server', request),
        } as CheckoutResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Query user submissions to determine pricing
    const userSubmissions = await db
      .select({ categoryId: submissions.categoryId })
      .from(submissions)
      .where(
        and(
          eq(submissions.userEmail, userEmail),
          eq(submissions.contestId, activeContest[0].id)
        )
      );

    if (userSubmissions.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation(
            'error.need-submission-to-pay',
            request
          ),
        } as CheckoutResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine unique categories submitted to
    const uniqueCategories = new Set(userSubmissions.map(s => s.categoryId));
    const categoryCount = uniqueCategories.size;

    // Charge what is still owed: 20€ or 30€ for a first payment, 10€ when a
    // 20€ entrant has since added a category
    const paidCents = await getPaidCents(db, activeContest[0].id, userEmail);
    const balanceCents = entryBalanceCents(categoryCount, paidCents);

    if (balanceCents <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.nothing-to-pay', request),
        } as CheckoutResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const priceIdByBalance: Record<number, string> = {
      1000: STRIPE_PRICE_ID_10,
      2000: STRIPE_PRICE_ID_20,
      3000: STRIPE_PRICE_ID_30,
    };
    const priceId = priceIdByBalance[balanceCents];

    if (!priceId) {
      console.error(
        `[checkout] No price for balance ${balanceCents} (${userEmail}, ${categoryCount} categories, ${paidCents} paid)`
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.internal-server', request),
        } as CheckoutResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${DOMAIN}${getLocalizedPath('user/payment/success', lang)}`,
      cancel_url: `${DOMAIN}${getLocalizedPath('user/payment/cancel', lang)}`,
      customer_email: userEmail,
      metadata: {
        contestId: activeContest[0].id,
        userEmail: userEmail,
        categoryCount: categoryCount.toString(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, url: session.url } as CheckoutResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[checkout] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: getBackendTranslation('error.internal-server', request),
      } as CheckoutResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { getDb } from '../../../db';
import { payments } from '../../../db/schema';
import { getBackendTranslation } from '../../../i18n/utils';

export const prerender = false;

// ✅ STEP 1: Create the idempotent fulfillment function
async function fulfillOrder(
  sessionId: string,
  stripe: Stripe,
  db: ReturnType<typeof getDb>
) {
  // Check if we have already processed this payment
  const existingPayment = await db
    .select()
    .from(payments)
    .where(eq(payments.stripeSessionId, sessionId))
    .limit(1);

  if (existingPayment.length > 0) {
    console.log(`[webhook] Order for session ${sessionId} already fulfilled.`);
    return; // Stop execution to prevent duplicates
  }

  // If not processed, retrieve the session from Stripe to get all details
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  // Redundant check for safety: ensure payment was actually successful
  if (session.payment_status !== 'paid') {
    console.warn(
      `[webhook] Fulfill called for session ${sessionId} but payment status is ${session.payment_status}.`
    );
    return;
  }

  const contestId = session.metadata?.contestId;
  const userEmail =
    session.metadata?.userEmail ?? session.customer_details?.email;

  if (!contestId || !userEmail) {
    console.error(
      `[webhook] Critical: Missing contestId or userEmail in metadata for session ${sessionId}`
    );
    return;
  }

  // Insert the new payment record
  await db.insert(payments).values({
    id: nanoid(),
    contestId,
    userEmail,
    amount: session.amount_total ?? 0,
    currency: session.currency ?? 'eur',
    stripeSessionId: session.id,
    paidAt: new Date().toISOString(),
  });

  console.log(
    `[webhook] ✅ Payment fulfilled for ${userEmail}, contest ${contestId}, session ${sessionId}`
  );
}

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  const STRIPE_SECRET_KEY = locals.runtime.env.STRIPE_SECRET_KEY as string;
  const STRIPE_WEBHOOK_SECRET = locals.runtime.env
    .STRIPE_WEBHOOK_SECRET as string;

  if (!D1Database || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response(
      getBackendTranslation('error.server-configuration', request),
      { status: 500 }
    );
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return new Response(
      getBackendTranslation('error.missing-stripe-signature', request),
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return new Response(
      getBackendTranslation('error.invalid-signature', request),
      { status: 400 }
    );
  }

  const db = getDb(D1Database);

  try {
    console.log(`[webhook] Processing event: ${event.type}`);

    // ✅ STEP 2: Update the switch statement
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // For immediate payment methods, payment_status will be 'paid'
        if (session.payment_status === 'paid') {
          console.log(
            '[webhook] Immediate payment succeeded. Fulfilling order...'
          );
          fulfillOrder(session.id, stripe, db);
        } else {
          console.log(
            '[webhook] Delayed payment initiated. Awaiting confirmation.'
          );
        }
        break;
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object;
        console.log('[webhook] Delayed payment succeeded. Fulfilling order...');
        fulfillOrder(session.id, stripe, db);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[webhook] Error processing webhook:', error);
    return new Response(
      getBackendTranslation('error.webhook-processing-failed', request),
      { status: 500 }
    );
  }
};

import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import Stripe from 'stripe';
import { getDb } from '../../../db';
import { payments } from '../../../db/schema';
import { getBackendTranslation } from '../../../i18n/utils';

export const prerender = false;

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
    switch (event.type) {
      case 'checkout.session.completed': {
        // ✅ Correct event
        const session = event.data.object; // Now 'session' is the Checkout Session object

        // Your existing logic will now work perfectly
        const contestId = session.metadata?.contestId;
        const userEmail =
          session.metadata?.userEmail ?? session.customer_details?.email; // A good fallback

        if (!contestId || !userEmail) {
          console.error(
            '[webhook] Missing contestId or userEmail from metadata'
          );
          return new Response(
            getBackendTranslation('error.missing-required-data', request),
            { status: 400 }
          );
        }

        try {
          await db.insert(payments).values({
            id: nanoid(),
            contestId,
            userEmail,
            amount: session.amount_total ?? 0, // This property exists on the Session
            currency: session.currency ?? 'eur', // This property exists on the Session
            stripeSessionId: session.id, // This is the ID of the Checkout Session
            paidAt: new Date().toISOString(),
          });
          console.log(
            `[webhook] Payment recorded for ${userEmail}, contest ${contestId}`
          );
        } catch (dbErr: any) {
          if (isUniqueViolation(dbErr)) {
            console.log(`[webhook] Duplicate session ${session.id}, ignoring`);
          } else {
            throw dbErr;
          }
        }
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

// helper: detect unique violation (adjust to your D1 client)
function isUniqueViolation(err: any): boolean {
  return typeof err?.message === 'string' && err.message.includes('UNIQUE');
}

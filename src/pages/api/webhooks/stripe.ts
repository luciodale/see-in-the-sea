import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDb } from '../../../db';
import { payments } from '../../../db/schema';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
  const STRIPE_SECRET_KEY = locals.runtime.env.STRIPE_SECRET_KEY as string;
  const STRIPE_WEBHOOK_SECRET = locals.runtime.env.STRIPE_WEBHOOK_SECRET as string;

  if (!D1Database || !STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response('Server configuration error', { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  });

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const db = getDb(D1Database);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.metadata || !session.customer_email) {
          console.error('[webhook] Missing required metadata or customer email');
          return new Response('Missing required data', { status: 400 });
        }

        const { contestId, userEmail, categoryCount } = session.metadata;
        
        // Create payment record
        await db.insert(payments).values({
          id: nanoid(),
          contestId,
          userEmail,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string,
          amount: session.amount_total || 0,
          currency: session.currency || 'eur',
          status: 'completed',
          categoryCount: parseInt(categoryCount),
          metadata: JSON.stringify({
            sessionMode: session.mode,
            customerEmail: session.customer_email,
            paymentStatus: session.payment_status,
          }),
          paidAt: new Date().toISOString(),
        });

        console.log(`[webhook] Payment recorded for user ${userEmail}, contest ${contestId}`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // You might want to handle expired sessions here
        console.log(`[webhook] Session expired: ${session.id}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment status to failed if it exists
        if (paymentIntent.id) {
          await db
            .update(payments)
            .set({
              status: 'failed',
              updatedAt: new Date().toISOString(),
            })
            .where(eq(payments.stripePaymentIntentId, paymentIntent.id));
        }

        console.log(`[webhook] Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[webhook] Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
};

/// <reference types="bun" />
// End to end payment flow against the real route handlers and real SQL.
// D1 and R2 are Miniflare in-memory instances built from the Drizzle
// migrations. Only the two network edges are faked: Clerk (who is signed in)
// and Stripe (sessions, signature check). The fake Stripe derives
// amount_total from the price the checkout picked, exactly as Stripe does.
import { afterAll, beforeAll, describe, expect, mock, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIContext, APIRoute } from 'astro';
import { Miniflare } from 'miniflare';
import type { TUser } from '../src/server/authenticateRequest';
import type {
  AdminSubmissionsResponse,
  CheckoutResponse,
  PaymentStatusResponse,
} from '../src/types/api';

const CONTEST_ID = 'uw-test';
const PRICE_10 = 'price_1UNZb90GkfoIDCTPIlCCKe7d';
const PRICE_20 = 'price_1SA7Q80GkfoIDCTPaiqKExvB';
const PRICE_30 = 'price_1SA7QP0GkfoIDCTPQgyBnXsS';
const PRICE_AMOUNTS: Record<string, number> = {
  [PRICE_10]: 1000,
  [PRICE_20]: 2000,
  [PRICE_30]: 3000,
};

// --- Fake Stripe -----------------------------------------------------------

type FakeSession = {
  id: string;
  url: string;
  payment_status: 'paid' | 'unpaid';
  amount_total: number;
  currency: string;
  customer_email: string | null;
  customer_details: { email: string | null } | null;
  metadata: Record<string, string>;
  price: string;
};

type CreateParams = {
  line_items: { price: string; quantity: number }[];
  mode: string;
  success_url: string;
  cancel_url: string;
  customer_email: string;
  metadata: Record<string, string>;
};

const stripeSessions = new Map<string, FakeSession>();
const createdParams: CreateParams[] = [];
let sessionCounter = 0;

class FakeStripe {
  checkout = {
    sessions: {
      create: async (params: CreateParams) => {
        createdParams.push(params);
        sessionCounter += 1;
        const price = params.line_items[0].price;
        const session: FakeSession = {
          id: `cs_test_${sessionCounter}`,
          url: `https://checkout.stripe.test/${sessionCounter}`,
          payment_status: 'unpaid',
          amount_total: PRICE_AMOUNTS[price] ?? -1,
          currency: 'eur',
          customer_email: params.customer_email,
          customer_details: { email: params.customer_email },
          metadata: params.metadata,
          price,
        };
        stripeSessions.set(session.id, session);
        return session;
      },
      retrieve: async (id: string) => {
        const session = stripeSessions.get(id);
        if (!session) throw new Error(`No such session ${id}`);
        return session;
      },
    },
  };
  webhooks = {
    constructEventAsync: async (body: string, signature: string) => {
      if (signature !== 'valid') throw new Error('bad signature');
      return JSON.parse(body);
    },
  };
}

mock.module('stripe', () => ({ default: FakeStripe }));

// --- Fake Clerk ------------------------------------------------------------

let currentEmail = '';

function signedInUser(): TUser {
  return {
    firstName: null,
    lastName: null,
    emailAddress: currentEmail,
    id: currentEmail,
  };
}

mock.module('../src/server/authenticateRequest', () => ({
  authenticateRequest: async () => ({
    isAuthenticated: true,
    user: signedInUser(),
    isAdminRole: () => false,
  }),
  authenticateAdmin: async () => ({
    isAuthenticated: true,
    isAdmin: true,
    user: signedInUser(),
  }),
}));

// --- Harness ---------------------------------------------------------------

const routes = {
  checkout: (await import('../src/pages/api/checkout')).POST,
  webhook: (await import('../src/pages/api/webhooks/stripe')).POST,
  paymentStatus: (await import('../src/pages/api/payment-status')).GET,
  deleteImage: (await import('../src/pages/api/delete-image')).DELETE,
  judging: (await import('../src/pages/api/admin/judging')).GET,
  adminSubmissions: (await import('../src/pages/api/admin/manage-submissions'))
    .GET,
};

const mf = new Miniflare({
  modules: true,
  script: 'export default { fetch() { return new Response("ok") } }',
  d1Databases: ['DB'],
  r2Buckets: ['R2_IMAGES_BUCKET'],
});
const DB = await mf.getD1Database('DB');
const R2 = await mf.getR2Bucket('R2_IMAGES_BUCKET');

const env = {
  DB,
  R2_IMAGES_BUCKET: R2,
  STRIPE_SECRET_KEY: 'sk_test_fake',
  STRIPE_WEBHOOK_SECRET: 'whsec_fake',
};

async function call(route: APIRoute, url: string, init?: RequestInit) {
  const request = new Request(`http://localhost:4321${url}`, init);
  const context = {
    request,
    url: new URL(request.url),
    params: {},
    locals: { runtime: { env } },
  } as unknown as APIContext;
  return route(context);
}

async function sql(query: string, ...bindings: (string | number)[]) {
  return DB.prepare(query)
    .bind(...bindings)
    .run();
}

async function addSubmission(email: string, categoryId: string) {
  const id = `${email}-${categoryId}-${crypto.randomUUID()}`;
  await sql(
    'INSERT INTO submissions (id, contest_id, category_id, user_email, title, r2_image_id) VALUES (?, ?, ?, ?, ?, ?)',
    id,
    CONTEST_ID,
    categoryId,
    email,
    'photo',
    `r2/${id}`
  );
  await R2.put(`r2/${id}`, 'jpeg bytes');
  return id;
}

async function setContestStatus(status: 'active' | 'assessment') {
  await sql('UPDATE contests SET status = ? WHERE id = ?', status, CONTEST_ID);
}

async function startCheckout(email: string) {
  currentEmail = email;
  const response = await call(routes.checkout, '/api/checkout', {
    method: 'POST',
  });
  const body = (await response.json()) as CheckoutResponse;
  return { status: response.status, body, params: createdParams.at(-1) };
}

async function sendWebhook(session: FakeSession) {
  return call(routes.webhook, '/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'valid' },
    body: JSON.stringify({
      type: 'checkout.session.completed',
      data: { object: session },
    }),
  });
}

async function completeLatestCheckout() {
  const session = Array.from(stripeSessions.values()).at(-1);
  if (!session) throw new Error('no session to complete');
  session.payment_status = 'paid';
  const response = await sendWebhook(session);
  expect(response.status).toBe(200);
  return session;
}

async function paidCents(email: string) {
  currentEmail = email;
  const response = await call(
    routes.paymentStatus,
    `/api/payment-status?contestId=${CONTEST_ID}`
  );
  const body = (await response.json()) as PaymentStatusResponse;
  return body.data?.paidCents;
}

async function deleteAs(email: string, submissionId: string) {
  currentEmail = email;
  return call(routes.deleteImage, '/api/delete-image', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submissionId }),
  });
}

beforeAll(async () => {
  const dir = join(import.meta.dir, '../drizzle/migrations');
  const files = readdirSync(dir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const statements = readFileSync(join(dir, file), 'utf8')
      .split('--> statement-breakpoint')
      .map(statement => statement.trim())
      .filter(Boolean);
    for (const statement of statements) await DB.prepare(statement).run();
  }
  await sql(
    "INSERT INTO contests (id, name, year, status) VALUES (?, 'Test', 2026, 'active')",
    CONTEST_ID
  );
  for (const id of ['macro', 'wide-angle', 'mediterranean']) {
    await sql(
      'INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)',
      id,
      id
    );
  }
});

afterAll(async () => {
  await mf.dispose();
});

// --- Scenarios -------------------------------------------------------------

describe('one category, then a second one (the top up)', () => {
  const email = 'single-then-multi@test.dev';

  test('first checkout charges the 20 price with unchanged metadata', async () => {
    await addSubmission(email, 'macro');
    const { status, body, params } = await startCheckout(email);
    expect(status).toBe(200);
    expect(body.url).toStartWith('https://checkout.stripe.test/');
    expect(params?.line_items).toEqual([{ price: PRICE_20, quantity: 1 }]);
    expect(params?.mode).toBe('payment');
    expect(params?.customer_email).toBe(email);
    expect(params?.metadata).toEqual({
      contestId: CONTEST_ID,
      userEmail: email,
      categoryCount: '1',
    });
  });

  test('webhook records 20 and payment status reports it', async () => {
    await completeLatestCheckout();
    expect(await paidCents(email)).toBe(2000);
  });

  test('settled entry cannot open another checkout', async () => {
    const { status, body } = await startCheckout(email);
    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  test('paying does not lock deletes', async () => {
    const extra = await addSubmission(email, 'macro');
    const response = await deleteAs(email, extra);
    expect(response.status).toBe(200);
    expect(await R2.get(`r2/${extra}`)).toBeNull();
  });

  test('adding a category makes the next checkout charge the 10 price', async () => {
    await addSubmission(email, 'wide-angle');
    const { status, params } = await startCheckout(email);
    expect(status).toBe(200);
    expect(params?.line_items).toEqual([{ price: PRICE_10, quantity: 1 }]);
    expect(params?.metadata.categoryCount).toBe('2');
  });

  test('webhook records the 10 as a second row and the total reaches 30', async () => {
    await completeLatestCheckout();
    expect(await paidCents(email)).toBe(3000);
    const rows = await DB.prepare(
      'SELECT amount FROM payments WHERE user_email = ? ORDER BY amount'
    )
      .bind(email)
      .all<{ amount: number }>();
    expect(rows.results.map(row => row.amount)).toEqual([1000, 2000]);
  });

  test('a third category costs nothing more', async () => {
    await addSubmission(email, 'mediterranean');
    const { status } = await startCheckout(email);
    expect(status).toBe(400);
  });

  test('a replayed webhook does not record the payment twice', async () => {
    const session = Array.from(stripeSessions.values()).at(-1);
    if (!session) throw new Error('no session');
    await sendWebhook(session);
    await sendWebhook(session);
    expect(await paidCents(email)).toBe(3000);
  });
});

describe('two categories from the start', () => {
  const email = 'multi@test.dev';

  test('first checkout charges the 30 price', async () => {
    await addSubmission(email, 'macro');
    await addSubmission(email, 'wide-angle');
    const { params } = await startCheckout(email);
    expect(params?.line_items).toEqual([{ price: PRICE_30, quantity: 1 }]);
    await completeLatestCheckout();
    expect(await paidCents(email)).toBe(3000);
  });
});

describe('paid 30, then dropped to one category', () => {
  const email = 'shrinker@test.dev';

  test('delete is allowed and nothing is owed or refunded', async () => {
    await addSubmission(email, 'macro');
    const wide = await addSubmission(email, 'wide-angle');
    await startCheckout(email);
    await completeLatestCheckout();
    expect((await deleteAs(email, wide)).status).toBe(200);
    const { status } = await startCheckout(email);
    expect(status).toBe(400);
    expect(await paidCents(email)).toBe(3000);
  });
});

describe('unpaid and abandoned checkouts', () => {
  const email = 'unpaid@test.dev';

  test('an unpaid session records nothing', async () => {
    await addSubmission(email, 'macro');
    await startCheckout(email);
    const session = Array.from(stripeSessions.values()).at(-1);
    if (!session) throw new Error('no session');
    await sendWebhook(session);
    expect(await paidCents(email)).toBe(0);
  });

  test('a Payment Link session without metadata is ignored', async () => {
    const session: FakeSession = {
      id: 'cs_test_payment_link',
      url: '',
      payment_status: 'paid',
      amount_total: 1000,
      currency: 'eur',
      customer_email: null,
      customer_details: { email },
      metadata: {},
      price: PRICE_10,
    };
    stripeSessions.set(session.id, session);
    const response = await sendWebhook(session);
    expect(response.status).toBe(200);
    expect(await paidCents(email)).toBe(0);
  });

  test('a bad signature is rejected', async () => {
    const response = await call(routes.webhook, '/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'forged' },
      body: '{}',
    });
    expect(response.status).toBe(400);
  });
});

describe('admin views', () => {
  test('judging lists each paid photo once, even with two payment rows', async () => {
    currentEmail = 'admin@test.dev';
    const response = await call(
      routes.judging,
      `/api/admin/judging?contestId=${CONTEST_ID}`
    );
    const body = (await response.json()) as {
      data: { id: string }[];
    };
    const ids = body.data.map(row => row.id);
    expect(new Set(ids).size).toBe(ids.length);

    const expected = await DB.prepare(
      `SELECT count(*) AS n FROM submissions
       WHERE contest_id = ? AND user_email IN (SELECT user_email FROM payments)`
    )
      .bind(CONTEST_ID)
      .first<{ n: number }>();
    expect(ids.length).toBe(expected?.n ?? -1);
    expect(ids.some(id => id.startsWith('unpaid@'))).toBe(false);
  });

  test('admin list reports paid totals and balance due', async () => {
    const due = 'due@test.dev';
    await addSubmission(due, 'macro');
    await startCheckout(due);
    await completeLatestCheckout();
    await addSubmission(due, 'wide-angle');

    currentEmail = 'admin@test.dev';
    const response = await call(
      routes.adminSubmissions,
      `/api/admin/manage-submissions?contestId=${CONTEST_ID}&limit=500`
    );
    const body = (await response.json()) as AdminSubmissionsResponse;
    function totalsFor(email: string) {
      const row = body.data.find(submission => submission.userEmail === email);
      return { paid: row?.paidCents, balance: row?.balanceCents };
    }
    expect(totalsFor(due)).toEqual({ paid: 2000, balance: 1000 });
    expect(totalsFor('single-then-multi@test.dev')).toEqual({
      paid: 3000,
      balance: 0,
    });
    expect(totalsFor('unpaid@test.dev')).toEqual({ paid: 0, balance: 2000 });
  });
});

describe('closed contest', () => {
  test('entrants cannot delete once the contest is in assessment', async () => {
    const email = 'late@test.dev';
    const id = await addSubmission(email, 'macro');
    await setContestStatus('assessment');
    const response = await deleteAs(email, id);
    expect(response.status).toBe(403);
    expect(await R2.get(`r2/${id}`)).not.toBeNull();
    await setContestStatus('active');
  });
});

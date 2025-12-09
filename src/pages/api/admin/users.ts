import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../db/index';
import { payments, submissions } from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';

export const prerender = false;

// Clerk API types
type ClerkUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  created_at?: number;
  last_active_at?: number;
  email_addresses?: Array<{ email_address: string }>;
};

type UserWithPayment = {
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  lastActiveAt?: string;
  hasUploaded: boolean;
  paymentAmount: number;
};

export type AdminUsersData = {
  totalUsers: number;
  usersWithUploads: number;
  usersWithoutUploads: UserWithPayment[];
  userPayments: Record<string, number>;
};

export type AdminUsersResponse = {
  success: boolean;
  data?: AdminUsersData;
  message?: string;
  error?: string;
};

// Fetch all users from Clerk
async function fetchAllClerkUsers(
  bearerToken: string
): Promise<Map<string, ClerkUser>> {
  const usersMap = new Map<string, ClerkUser>();

  try {
    // Fetch with a high limit to get all users in one request
    const response = await fetch('https://api.clerk.com/v1/users?limit=500', {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(
        `[admin/users] Failed to fetch Clerk users: ${response.status}`
      );
      return usersMap;
    }

    const users: ClerkUser[] = await response.json();

    for (const user of users) {
      if (user.email_addresses) {
        for (const emailObj of user.email_addresses) {
          usersMap.set(emailObj.email_address, user);
        }
      }
    }

    console.log(
      `[admin/users] Fetched ${users.length} users from Clerk (${usersMap.size} unique emails)`
    );
  } catch (error) {
    console.error('[admin/users] Error fetching Clerk users:', error);
  }

  return usersMap;
}

// GET: Fetch all users with their upload and payment status
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[admin/users] Processing users list request');

  const D1Database = locals.runtime.env.DB;
  const clerkSecretKey = locals.runtime.env.CLERK_SECRET_KEY;

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
    // Step 1: Admin Authentication Check
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    // Step 2: Parse query parameters
    const url = new URL(request.url);
    const contestId = url.searchParams.get('contestId');

    if (!contestId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Contest ID is required',
        }),
        { status: 400 }
      );
    }

    // Step 3: Fetch all users from Clerk
    let clerkUsersMap = new Map<string, ClerkUser>();
    if (clerkSecretKey) {
      clerkUsersMap = await fetchAllClerkUsers(clerkSecretKey);
    } else {
      console.warn('[admin/users] Clerk secret key not available');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Clerk configuration not available',
        }),
        { status: 500 }
      );
    }

    // Step 4: Fetch submissions for this contest
    const contestSubmissions = await db
      .select({
        userEmail: submissions.userEmail,
      })
      .from(submissions)
      .where(eq(submissions.contestId, contestId));

    const usersWithUploads = new Set(contestSubmissions.map(s => s.userEmail));

    // Step 5: Fetch payment data for this contest
    const paymentRecords = await db
      .select({
        userEmail: payments.userEmail,
        amount: payments.amount,
      })
      .from(payments)
      .where(eq(payments.contestId, contestId));

    // Build payment amounts map
    const userPayments: Record<string, number> = {};
    for (const payment of paymentRecords) {
      userPayments[payment.userEmail] = payment.amount;
    }

    // Step 6: Build list of users without uploads
    const usersWithoutUploads: UserWithPayment[] = [];

    for (const [email, user] of clerkUsersMap.entries()) {
      if (!usersWithUploads.has(email)) {
        usersWithoutUploads.push({
          email,
          firstName: user.first_name,
          lastName: user.last_name,
          createdAt: user.created_at
            ? new Date(user.created_at).toISOString()
            : undefined,
          lastActiveAt: user.last_active_at
            ? new Date(user.last_active_at).toISOString()
            : undefined,
          hasUploaded: false,
          paymentAmount: userPayments[email] || 0,
        });
      }
    }

    const responseData: AdminUsersData = {
      totalUsers: clerkUsersMap.size,
      usersWithUploads: usersWithUploads.size,
      usersWithoutUploads,
      userPayments,
    };

    const response: AdminUsersResponse = {
      success: true,
      data: responseData,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[admin/users] Error fetching users:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

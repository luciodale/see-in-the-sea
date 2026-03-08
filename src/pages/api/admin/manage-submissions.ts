import type { APIRoute } from 'astro';
import { and, desc, eq, like } from 'drizzle-orm';
import { getDb } from '../../../db/index';
import {
  categories,
  contests,
  payments,
  submissions,
} from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type {
  AdminSubmission,
  SubmissionListResponse,
} from '../../../types/api';

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

// Fetch all users from Clerk and map by email
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
        `[manage-submissions] Failed to fetch Clerk users: ${response.status}`
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
      `[manage-submissions] Fetched ${users.length} users from Clerk (${usersMap.size} unique emails)`
    );
  } catch (error) {
    console.error('[manage-submissions] Error fetching Clerk users:', error);
  }

  return usersMap;
}

// GET: List all submissions with filtering and pagination
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[manage-submissions] Processing submission list request');

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
    // Step 1: Admin Authentication Check (returns 404 if not admin)
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    // Step 2: Parse query parameters for filtering
    const url = new URL(request.url);
    const contestId = url.searchParams.get('contestId');
    const categoryId = url.searchParams.get('categoryId');
    const userEmail = url.searchParams.get('userEmail');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    // Require contestId
    if (!contestId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Contest ID is required',
        }),
        { status: 400 }
      );
    }

    // Step 3: Build query with filters - contestId is always included
    const whereConditions = [eq(submissions.contestId, contestId)];

    if (categoryId) {
      whereConditions.push(eq(submissions.categoryId, categoryId));
    }

    if (userEmail) {
      whereConditions.push(eq(submissions.userEmail, userEmail));
    }

    if (search) {
      whereConditions.push(like(submissions.title, `%${search}%`));
    }

    const whereClause = and(...whereConditions);

    // Step 4: Fetch submissions with joins
    const allSubmissions = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        description: submissions.description,
        r2ImageId: submissions.r2ImageId,
        userEmail: submissions.userEmail,
        uploadedAt: submissions.uploadedAt,
        contestId: submissions.contestId,
        contestName: contests.name,
        categoryId: submissions.categoryId,
        categoryName: categories.name,
        portfolio: submissions.portfolio,
        portfolioPhotoType: submissions.portfolioPhotoType,
      })
      .from(submissions)
      .innerJoin(contests, eq(submissions.contestId, contests.id))
      .innerJoin(categories, eq(submissions.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(submissions.uploadedAt))
      .limit(limit)
      .offset(offset);

    // Step 5: Get total count for pagination
    const totalCountResult = await db
      .select({ count: submissions.id })
      .from(submissions)
      .innerJoin(contests, eq(submissions.contestId, contests.id))
      .innerJoin(categories, eq(submissions.categoryId, categories.id))
      .where(whereClause);

    const totalCount = totalCountResult.length;

    console.log(
      `[manage-submissions] Found ${allSubmissions.length} submissions (${totalCount} total)`
    );

    // Step 6: Fetch payment status for all users in this contest
    const paymentRecords = await db
      .select({
        userEmail: payments.userEmail,
      })
      .from(payments)
      .where(eq(payments.contestId, contestId));

    const paidUsersSet = new Set(
      paymentRecords.map(record => record.userEmail)
    );

    // Step 7: Fetch user data from Clerk
    let clerkUsersMap = new Map<string, ClerkUser>();
    if (clerkSecretKey) {
      clerkUsersMap = await fetchAllClerkUsers(clerkSecretKey);
    } else {
      console.warn('[manage-submissions] Clerk secret key not available');
    }

    // Step 8: Enrich submissions with Clerk user data and payment status
    const enrichedSubmissions: AdminSubmission[] = allSubmissions.map(
      submission => {
        const clerkUser = clerkUsersMap.get(submission.userEmail);
        const hasPaid = paidUsersSet.has(submission.userEmail);

        return {
          ...submission,
          firstName: clerkUser?.first_name,
          lastName: clerkUser?.last_name,
          userCreatedAt: clerkUser?.created_at
            ? new Date(clerkUser.created_at).toISOString()
            : undefined,
          userLastActiveAt: clerkUser?.last_active_at
            ? new Date(clerkUser.last_active_at).toISOString()
            : undefined,
          hasPaid,
        };
      }
    );

    const response: SubmissionListResponse = {
      success: true,
      data: enrichedSubmissions,
      totalCount: totalCount,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[manage-submissions] Error fetching submissions:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch submissions',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

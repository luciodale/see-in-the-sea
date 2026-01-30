import type { APIRoute } from 'astro';
import { and, eq, isNotNull } from 'drizzle-orm';
import { getDb } from '../../../db/index';
import {
  categories,
  judgingFlags,
  submissions,
} from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type { WinnersPreviewRow } from '../../../types/api';

export const prerender = false;

type PlacementType = WinnersPreviewRow['placement'];

type ClerkUser = {
  id: string;
  first_name?: string;
  last_name?: string;
  email_addresses?: Array<{ email_address: string }>;
};

async function fetchAllClerkUsers(
  bearerToken: string
): Promise<Map<string, ClerkUser>> {
  const usersMap = new Map<string, ClerkUser>();
  try {
    const response = await fetch('https://api.clerk.com/v1/users?limit=500', {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return usersMap;
    const users: ClerkUser[] = await response.json();
    for (const user of users) {
      if (user.email_addresses) {
        for (const emailObj of user.email_addresses) {
          usersMap.set(emailObj.email_address, user);
        }
      }
    }
  } catch (error) {
    console.error('[winners-preview] Error fetching Clerk users:', error);
  }
  return usersMap;
}

export const GET: APIRoute = async ({ request, locals, url }) => {
  const D1Database = locals.runtime.env.DB;
  const clerkSecretKey = locals.runtime.env.CLERK_SECRET_KEY;

  if (!D1Database) {
    return new Response(
      JSON.stringify({ success: false, message: 'Database not available' }),
      { status: 500 }
    );
  }

  const authRequestClone = request.clone() as typeof request;
  const { isAuthenticated, isAdmin, unauthenticatedResponse } =
    await authenticateAdmin(authRequestClone, locals);
  if (!isAuthenticated || !isAdmin) return unauthenticatedResponse();

  const contestId = url.searchParams.get('contestId');
  if (!contestId) {
    return new Response(
      JSON.stringify({ success: false, message: 'contestId is required' }),
      { status: 400 }
    );
  }

  const db = getDb(D1Database);

  try {
    const rows = await db
      .select({
        submissionId: submissions.id,
        title: submissions.title,
        r2ImageId: submissions.r2ImageId,
        userEmail: submissions.userEmail,
        categoryId: submissions.categoryId,
        categoryName: categories.name,
        placement: judgingFlags.placement,
      })
      .from(submissions)
      .innerJoin(judgingFlags, eq(submissions.id, judgingFlags.submissionId))
      .innerJoin(categories, eq(submissions.categoryId, categories.id))
      .where(
        and(
          eq(submissions.contestId, contestId),
          isNotNull(judgingFlags.placement)
        )
      )
      .orderBy(submissions.categoryId, judgingFlags.placement);

    const placementValues = ['first', 'second', 'third', 'runner-up'] as const;
    const typedRows = rows.filter(
      (r): r is typeof r & { placement: PlacementType } =>
        r.placement !== null && placementValues.includes(r.placement as PlacementType)
    );

    let clerkUsersMap = new Map<string, ClerkUser>();
    if (clerkSecretKey) {
      clerkUsersMap = await fetchAllClerkUsers(clerkSecretKey);
    }

    const enriched: WinnersPreviewRow[] = typedRows.map(r => {
      const clerkUser = clerkUsersMap.get(r.userEmail);
      return {
        categoryId: r.categoryId,
        categoryName: r.categoryName,
        placement: r.placement as PlacementType,
        userEmail: r.userEmail,
        firstName: clerkUser?.first_name,
        lastName: clerkUser?.last_name,
        submissionId: r.submissionId,
        title: r.title,
        r2ImageId: r.r2ImageId,
      };
    });

    return new Response(
      JSON.stringify({ success: true, data: enriched }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[winners-preview] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

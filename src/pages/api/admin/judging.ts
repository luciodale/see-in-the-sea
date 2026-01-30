import type { APIRoute } from 'astro';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import {
  contests,
  getDb,
  judgingFlags,
  results,
  submissions,
} from '../../../db/index';
import { authenticateAdmin } from '../../../server/authenticateRequest';

export const prerender = false;

type PlacementType = 'first' | 'second' | 'third' | 'runner-up' | null;
type FlagStatusType = 'pending' | 'shortlisted' | 'rejected';

type SetPlacementRequest = {
  action: 'set-placement';
  submissionId: string;
  placement: PlacementType;
};

type SetFlagRequest = {
  action: 'set-flag';
  submissionId: string;
  status: FlagStatusType;
};

type SetRatingRequest = {
  action: 'set-rating';
  submissionId: string;
  rating: number | null;
};

type SubmitResultsRequest = {
  action: 'submit-results';
  contestId: string;
};

type ResetJudgingRequest = {
  action: 'reset-judging';
  contestId: string;
};

type JudgingRequest =
  | SetPlacementRequest
  | SetFlagRequest
  | SetRatingRequest
  | SubmitResultsRequest
  | ResetJudgingRequest;

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
    console.error('[judging] Error fetching Clerk users:', error);
  }
  return usersMap;
}

type JudgingSubmission = {
  id: string;
  title: string;
  description: string | null;
  r2ImageId: string | null;
  categoryId: string;
  placement: PlacementType;
  flagStatus: FlagStatusType;
  rating: number | null;
  portfolio: string | null;
  portfolioPhotoType: string | null;
  anonymousUserId: string; // Anonymized user identifier for grouping
  isSubmitted: boolean; // Whether this placement is in final results
};

// Simple hash function to anonymize emails
function hashEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).slice(0, 6).toUpperCase();
}

/**
 * Judging API endpoint
 * Placements are stored in judging_flags until "Submit Results" is clicked.
 * Only then are they copied to the results table.
 */
export const GET: APIRoute = async ({ request, locals, url }) => {
  const D1Database = locals.runtime.env.DB;
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
    // Get all submissions with judging flags and final results
    const submissionsData = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        description: submissions.description,
        r2ImageId: submissions.r2ImageId,
        categoryId: submissions.categoryId,
        portfolio: submissions.portfolio,
        portfolioPhotoType: submissions.portfolioPhotoType,
        userEmail: submissions.userEmail,
        flagStatus: judgingFlags.status,
        rating: judgingFlags.rating,
        pendingPlacement: judgingFlags.placement,
        finalPlacement: results.result,
        resultId: results.id,
      })
      .from(submissions)
      .leftJoin(judgingFlags, eq(submissions.id, judgingFlags.submissionId))
      .leftJoin(results, eq(submissions.id, results.submissionId))
      .where(eq(submissions.contestId, contestId))
      .orderBy(submissions.categoryId, submissions.uploadedAt);

    // Map to response format with anonymized user IDs
    const judgingSubmissions: JudgingSubmission[] = submissionsData.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      r2ImageId: s.r2ImageId,
      categoryId: s.categoryId,
      // Use pending placement from judging_flags, fallback to final result
      placement: (s.pendingPlacement as PlacementType) || null,
      flagStatus: (s.flagStatus as FlagStatusType) || 'pending',
      rating: s.rating || null,
      portfolio: s.portfolio || null,
      portfolioPhotoType: s.portfolioPhotoType || null,
      anonymousUserId: hashEmail(s.userEmail),
      isSubmitted: !!s.resultId, // True if placement is in final results
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: judgingSubmissions,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[judging] Error fetching submissions:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch',
      }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;
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

  const body = (await request.json()) as JudgingRequest;
  const db = getDb(D1Database);

  // Handle set-placement action (stores in judging_flags, not results)
  if (body.action === 'set-placement') {
    const { submissionId, placement } = body;

    if (!submissionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'submissionId is required' }),
        { status: 400 }
      );
    }

    try {
      // For 1st/2nd/3rd, clear any existing same placement in same category
      const isUniquePlacement =
        placement === 'first' ||
        placement === 'second' ||
        placement === 'third';

      if (isUniquePlacement && placement) {
        const targetSubmission = await db
          .select({ categoryId: submissions.categoryId })
          .from(submissions)
          .where(eq(submissions.id, submissionId))
          .limit(1);

        if (targetSubmission.length > 0) {
          const categoryId = targetSubmission[0].categoryId;

          // Find other submissions in same category with same placement
          const existingWithSamePlacement = await db
            .select({
              flagId: judgingFlags.id,
              flagSubmissionId: judgingFlags.submissionId,
            })
            .from(judgingFlags)
            .innerJoin(
              submissions,
              eq(judgingFlags.submissionId, submissions.id)
            )
            .where(
              and(
                eq(submissions.categoryId, categoryId),
                eq(judgingFlags.placement, placement)
              )
            );

          // Clear conflicting placements
          for (const existing of existingWithSamePlacement) {
            if (existing.flagSubmissionId !== submissionId) {
              await db
                .update(judgingFlags)
                .set({ placement: null, updatedAt: new Date().toISOString() })
                .where(eq(judgingFlags.id, existing.flagId));
            }
          }
        }
      }

      // Update or insert the flag
      const existingFlag = await db
        .select({ id: judgingFlags.id })
        .from(judgingFlags)
        .where(eq(judgingFlags.submissionId, submissionId))
        .limit(1);

      if (existingFlag.length > 0) {
        await db
          .update(judgingFlags)
          .set({ placement, updatedAt: new Date().toISOString() })
          .where(eq(judgingFlags.submissionId, submissionId));
      } else {
        await db.insert(judgingFlags).values({
          id: nanoid(),
          submissionId,
          status: 'pending',
          placement,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[judging] Error setting placement:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update',
        }),
        { status: 500 }
      );
    }
  }

  // Handle set-flag action
  if (body.action === 'set-flag') {
    const { submissionId, status } = body;

    if (!submissionId || !status) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'submissionId and status required',
        }),
        { status: 400 }
      );
    }

    try {
      const existingFlag = await db
        .select({ id: judgingFlags.id })
        .from(judgingFlags)
        .where(eq(judgingFlags.submissionId, submissionId))
        .limit(1);

      if (existingFlag.length > 0) {
        await db
          .update(judgingFlags)
          .set({ status, updatedAt: new Date().toISOString() })
          .where(eq(judgingFlags.submissionId, submissionId));
      } else {
        await db.insert(judgingFlags).values({
          id: nanoid(),
          submissionId,
          status,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[judging] Error setting flag:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update',
        }),
        { status: 500 }
      );
    }
  }

  // Handle set-rating action
  if (body.action === 'set-rating') {
    const { submissionId, rating } = body;

    if (!submissionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'submissionId is required' }),
        { status: 400 }
      );
    }

    try {
      const existingFlag = await db
        .select({ id: judgingFlags.id })
        .from(judgingFlags)
        .where(eq(judgingFlags.submissionId, submissionId))
        .limit(1);

      if (existingFlag.length > 0) {
        await db
          .update(judgingFlags)
          .set({ rating, updatedAt: new Date().toISOString() })
          .where(eq(judgingFlags.submissionId, submissionId));
      } else {
        await db.insert(judgingFlags).values({
          id: nanoid(),
          submissionId,
          status: 'shortlisted',
          rating,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('[judging] Error setting rating:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to update',
        }),
        { status: 500 }
      );
    }
  }

  // Handle submit-results action (copy placements to results table).
  // Does NOT clear judging_flags; only Azzera (reset-judging) does that.
  // Deletes all results for the contest's year, then inserts from judging_flags for this contest.
  if (body.action === 'submit-results') {
    const { contestId } = body;
    const clerkSecretKey = locals.runtime.env.CLERK_SECRET_KEY;

    if (!contestId) {
      return new Response(
        JSON.stringify({ success: false, message: 'contestId is required' }),
        { status: 400 }
      );
    }

    try {
      // Get submission IDs for this contest only
      const contestSubmissions = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(eq(submissions.contestId, contestId));

      const submissionIds = contestSubmissions.map(s => s.id);

      // Remove results for this contest's submissions (batch delete due to D1 param limits)
      const BATCH_SIZE = 50;
      for (let i = 0; i < submissionIds.length; i += BATCH_SIZE) {
        const chunk = submissionIds.slice(i, i + BATCH_SIZE);
        await db.delete(results).where(inArray(results.submissionId, chunk));
      }

      // Get judging flags with placements for this contest only (include userEmail for Clerk lookup)
      const flagsWithPlacements = await db
        .select({
          submissionId: judgingFlags.submissionId,
          placement: judgingFlags.placement,
          userEmail: submissions.userEmail,
        })
        .from(judgingFlags)
        .innerJoin(submissions, eq(judgingFlags.submissionId, submissions.id))
        .where(
          and(
            eq(submissions.contestId, contestId),
            isNotNull(judgingFlags.placement)
          )
        );

      // Fetch Clerk users to get first/last names
      let clerkUsersMap = new Map<string, ClerkUser>();
      if (clerkSecretKey) {
        clerkUsersMap = await fetchAllClerkUsers(clerkSecretKey);
      }

      // Insert new results from judging_flags (judging_flags are left unchanged)
      for (const flag of flagsWithPlacements) {
        if (flag.placement) {
          const clerkUser = clerkUsersMap.get(flag.userEmail);
          await db.insert(results).values({
            id: nanoid(),
            submissionId: flag.submissionId,
            result: flag.placement,
            firstName: clerkUser?.first_name || null,
            lastName: clerkUser?.last_name || null,
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Submitted ${flagsWithPlacements.length} results`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('[judging] Error submitting results:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to submit',
        }),
        { status: 500 }
      );
    }
  }

  // Handle reset-judging action (clear all judging flags for contest)
  if (body.action === 'reset-judging') {
    const { contestId } = body;

    if (!contestId) {
      return new Response(
        JSON.stringify({ success: false, message: 'contestId is required' }),
        { status: 400 }
      );
    }

    try {
      // Get all submissions for this contest
      const contestSubmissions = await db
        .select({ id: submissions.id })
        .from(submissions)
        .where(eq(submissions.contestId, contestId));

      // Delete judging flags for all submissions
      for (const sub of contestSubmissions) {
        await db
          .delete(judgingFlags)
          .where(eq(judgingFlags.submissionId, sub.id));
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Judging reset successfully',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('[judging] Error resetting judging:', error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to reset',
        }),
        { status: 500 }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, message: 'Invalid action' }),
    { status: 400 }
  );
};

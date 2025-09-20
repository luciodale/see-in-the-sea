import type { APIRoute } from 'astro';
import { getDb } from '../../db/index';
import { authenticateRequest } from '../../server/authenticateRequest';
import { getUserContestSubmissions } from '../../server/contestService';
import type { SubmissionsResponse } from '../../types/api';

export const prerender = false;

/**
 * GET /api/submissions
 * Returns the active contest with categories and user's submissions nested
 * Query params:
 * - userEmail: (admin only) Email of user to fetch submissions for
 */
export const GET: APIRoute = async ({ request, locals }) => {
  const D1Database = locals.runtime.env.DB;

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
    // Authentication required - we need to know which user's submissions to return
    const { isAuthenticated, user, isAdminRole, unauthenticatedResponse } =
      await authenticateRequest(
        request, // Use the actual request with auth headers/cookies
        locals
      );

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    let userEmail = user.emailAddress || 'unknown';

    // Check if this is an admin request for another user's submissions
    const url = new URL(request.url);
    const adminUserEmail = url.searchParams.get('userEmail');

    if (adminUserEmail) {
      // Verify admin role
      if (!isAdminRole()) {
        return new Response(
          JSON.stringify({
            success: false,
            message:
              "Access denied. Admin role required to view other users' submissions.",
            error: 'INSUFFICIENT_PERMISSIONS',
          }),
          { status: 403 }
        );
      }

      // Use the specified user email for the submissions
      userEmail = adminUserEmail;
      console.log(
        `[submissions] Admin ${user.id} fetching submissions for ${userEmail}`
      );
    }

    // Get contest with user's submissions organized by category
    const contestData = await getUserContestSubmissions(db, userEmail);

    if (!contestData.contest) {
      const response: SubmissionsResponse = {
        success: false,
        message: 'No active contest found',
      };

      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response: SubmissionsResponse = {
      success: true,
      data: contestData,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[submissions] Query error:', error);
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

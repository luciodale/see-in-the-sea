import type { APIRoute } from 'astro';
import { getDb } from '../../db/index.js';
import { authenticateRequest } from '../../server/authenticateRequest';
import { getUserContestSubmissions } from '../../server/contestService';
import type { SubmissionsResponse } from '../../types/api.js';

export const prerender = false;

/**
 * GET /api/submissions
 * Returns the active contest with categories and user's submissions nested
 * No query params needed - automatically gets active contest for authenticated user
 */
export const GET: APIRoute = async ({ request, locals }) => {
    const D1Database = locals.runtime.env.DB;
    
    if (!D1Database) {
        return new Response(JSON.stringify({ 
            success: false,
            message: 'Database not available' 
        }), { status: 500 });
    }

    const db = getDb(D1Database);

    try {
        // Authentication required - we need to know which user's submissions to return
        const { isAuthenticated, user, unauthenticatedResponse } = await authenticateRequest(
            request, // Use the actual request with auth headers/cookies
            locals
        );

        if (!isAuthenticated) {
            return unauthenticatedResponse();
        }

        const userEmail = user.emailAddress || 'unknown';

        // Get contest with user's submissions organized by category
        const contestData = await getUserContestSubmissions(db, userEmail);

        if (!contestData.contest) {
            const response: SubmissionsResponse = {
                success: false,
                message: 'No active contest found'
            };

            return new Response(JSON.stringify(response), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const response: SubmissionsResponse = {
            success: true,
            data: contestData
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[submissions] Query error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to fetch submissions',
            error: (error instanceof Error) ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 
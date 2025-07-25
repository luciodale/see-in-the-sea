import type { APIRoute } from 'astro';
import { getDb } from '../../db/index.js';
import { authenticateRequest } from '../../server/authenticateRequest';
import { getUserContestSubmissions } from '../../server/contestService';

export const prerender = false;

/**
 * GET /api/submissions
 * Returns the active contest with categories and user's submissions nested
 * No query params needed - automatically gets active contest for authenticated user
 */
export const GET: APIRoute = async ({ locals, request }) => {
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
            request,
            locals
        );

        if (!isAuthenticated) {
            return unauthenticatedResponse();
        }

        const userEmail = user.emailAddress || 'unknown';

        // Get contest with user's submissions organized by category
        const contestData = await getUserContestSubmissions(db, userEmail);

        if (!contestData.contest) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No active contest found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            data: contestData
        }), {
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
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { categories, contests, getDb } from '../../db/index.js';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    const D1Database = locals.runtime.env.DB;
    
    if (!D1Database) {
        return new Response(JSON.stringify({ message: 'Database not available' }), { status: 500 });
    }

    const db = getDb(D1Database);

    try {
        // Get the active contest (only one at a time) - Type-safe Drizzle query!
        const contestResult = await db
            .select({
                id: contests.id,
                name: contests.name,
                description: contests.description,
                startDate: contests.startDate,
                endDate: contests.endDate,
                isActive: contests.isActive,
                maxSubmissionsPerCategory: contests.maxSubmissionsPerCategory,
                createdAt: contests.createdAt
            })
            .from(contests)
            .where(eq(contests.isActive, true))
            .orderBy(contests.createdAt)
            .limit(1);

        if (contestResult.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No active contest found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get all active categories - Type-safe Drizzle query!
        const categoriesResult = await db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                displayOrder: categories.displayOrder,
                isActive: categories.isActive
            })
            .from(categories)
            .where(eq(categories.isActive, true))
            .orderBy(categories.displayOrder, categories.name);

        return new Response(JSON.stringify({
            success: true,
            data: {
                contest: contestResult[0],
                categories: categoriesResult
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[contests] Query error:', error);
        return new Response(JSON.stringify({
            message: 'Failed to fetch contest and categories',
            error: (error instanceof Error) ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}; 
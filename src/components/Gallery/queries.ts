import type { D1Database } from '@cloudflare/workers-types';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index.js';
import {
  categories,
  contests,
  judges,
  results,
  submissions,
} from '../../db/schema.js';

/**
 * Fetches contest details by contest ID
 * @param d1Database - D1Database instance
 * @param contestId - The contest identifier
 * @returns Contest name or null if not found
 */
export async function getContestTitleByContestId(
  d1Database: D1Database,
  contestId: string
): Promise<string> {
  const db = getDb(d1Database);

  const contestDetails = await db
    .select({ name: contests.name })
    .from(contests)
    .where(eq(contests.id, contestId))
    .limit(1);

  return contestDetails[0]?.name ?? contestId;
}

/**
 * Fetches category name by category ID
 * @param d1Database - D1Database instance
 * @param categoryId - The category identifier
 * @returns Category name or null if not found
 */
export async function getCategoryNameByCategoryId(
  d1Database: D1Database,
  categoryId: string
): Promise<string> {
  const db = getDb(d1Database);

  const categoryDetails = await db
    .select({ name: categories.name })
    .from(categories)
    .where(eq(categories.id, categoryId))
    .limit(1);

  return categoryDetails[0]?.name ?? categoryId;
}

/**
 * Fetches contest and category names by their IDs
 * @param d1Database - D1Database instance
 * @param contestId - The contest identifier
 * @param categoryId - The category identifier
 * @returns Object with contestTitle and categoryName
 */
export async function getContestAndCategoryNames(
  d1Database: D1Database,
  contestId: string,
  categoryId: string
): Promise<{ contestTitle: string; categoryName: string }> {
  const [contestTitle, categoryName] = await Promise.all([
    getContestTitleByContestId(d1Database, contestId),
    getCategoryNameByCategoryId(d1Database, categoryId),
  ]);

  return { contestTitle, categoryName };
}

/**
 * Fetches all judges for a specific contest
 * @param d1Database - D1Database instance
 * @param contestId - The contest identifier
 * @returns Array of judge names
 */
export async function getJudgesByContestId(
  d1Database: D1Database,
  contestId: string
): Promise<Array<{ fullName: string }>> {
  const db = getDb(d1Database);

  return await db
    .select({ fullName: judges.fullName })
    .from(judges)
    .where(eq(judges.contestId, contestId))
    .orderBy(judges.fullName);
}

/**
 * Fetches all first place winners for a specific contest across all categories
 * @param d1Database - D1Database instance
 * @param contestId - The contest identifier
 * @returns Array of first place winners with their details
 */
export async function getFirstPlaceWinnersByContestId(
  d1Database: D1Database,
  contestId: string
) {
  const db = getDb(d1Database);

  return await db
    .select({
      result: results.result,
      firstName: results.firstName,
      lastName: results.lastName,
      submissionId: results.submissionId,
      title: submissions.title,
      categoryId: submissions.categoryId,
      r2Key: submissions.r2Key,
      originalFilename: submissions.originalFilename,
    })
    .from(results)
    .innerJoin(submissions, eq(results.submissionId, submissions.id))
    .where(
      and(eq(submissions.contestId, contestId), eq(results.result, 'first'))
    );
}

/**
 * Fetches all winners for a specific contest and category
 * @param d1Database - D1Database instance
 * @param contestId - The contest identifier
 * @param categoryId - The category identifier
 * @returns Array of all winners (first, second, third, runner-ups) for the category
 */
export async function getAllWinnersByContestAndCategory(
  d1Database: D1Database,
  contestId: string,
  categoryId: string
) {
  const db = getDb(d1Database);

  return await db
    .select({
      result: results.result,
      firstName: results.firstName,
      lastName: results.lastName,
      submissionId: results.submissionId,
      title: submissions.title,
      categoryId: submissions.categoryId,
      r2Key: submissions.r2Key,
      originalFilename: submissions.originalFilename,
    })
    .from(results)
    .innerJoin(submissions, eq(results.submissionId, submissions.id))
    .where(
      and(
        eq(submissions.contestId, contestId),
        eq(submissions.categoryId, categoryId)
      )
    );
}

/**
 * Fetches all categories used in a specific contest
 * @param d1Database - D1Database instance
 * @param contestId - The contest identifier
 * @returns Array of categories with id and name
 */
export async function getCategoriesByContestId(
  d1Database: D1Database,
  contestId: string
): Promise<Array<{ id: string; name: string }>> {
  const db = getDb(d1Database);

  return await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .innerJoin(submissions, eq(categories.id, submissions.categoryId))
    .where(eq(submissions.contestId, contestId))
    .groupBy(categories.id)
    .orderBy(categories.name);
}

/**
 * Fetches category names for multiple category IDs
 * @param d1Database - D1Database instance
 * @param categoryIds - Array of category identifiers
 * @returns Map of category ID to category name
 */
export async function getCategoryNamesByIds(
  d1Database: D1Database,
  categoryIds: string[]
): Promise<Map<string, string>> {
  const db = getDb(d1Database);

  if (categoryIds.length === 0) {
    return new Map();
  }

  const categoryData = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(
      categoryIds
        .map(id => eq(categories.id, id))
        .reduce((acc, condition) => acc || condition)
    );

  const categoryMap = new Map<string, string>();
  categoryData.forEach(cat => categoryMap.set(cat.id, cat.name));

  return categoryMap;
}

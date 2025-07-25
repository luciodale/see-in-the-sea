import { and, count, eq } from 'drizzle-orm';
import type { Category, Contest, Submission } from '../db/index.js';
import { categories, contests, getDb, submissions } from '../db/index.js';

/**
 * Gets the single active contest with categories
 * Pure function - no side effects, deterministic output
 */
export async function getActiveContest(db: ReturnType<typeof getDb>): Promise<{
  contest: Contest | null;
  categories: Category[];
}> {
  // Get the single active contest
  const contestResult = await db
    .select()
    .from(contests)
    .where(eq(contests.isActive, true))
    .orderBy(contests.createdAt)
    .limit(1);

  const contest = contestResult[0] || null;

  // Get all active categories
  const categoriesResult = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.displayOrder, categories.name);

  return {
    contest,
    categories: categoriesResult
  };
}

/**
 * Validates if a contest exists and is active
 * Pure function - returns validation result
 */
export async function validateActiveContest(
  db: ReturnType<typeof getDb>, 
  contestId: string
): Promise<{ isValid: boolean; contest: Contest | null }> {
  const contestResult = await db
    .select()
    .from(contests)
    .where(and(
      eq(contests.id, contestId),
      eq(contests.isActive, true)
    ))
    .limit(1);

  return {
    isValid: contestResult.length > 0,
    contest: contestResult[0] || null
  };
}

/**
 * Validates if a category exists and is active
 * Pure function - returns validation result
 */
export async function validateActiveCategory(
  db: ReturnType<typeof getDb>,
  categoryId: string
): Promise<{ isValid: boolean }> {
  const categoryResult = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(
      eq(categories.id, categoryId),
      eq(categories.isActive, true)
    ))
    .limit(1);

  return {
    isValid: categoryResult.length > 0
  };
}

/**
 * Checks submission limits for a user in a specific contest/category
 * Pure function - returns current count and limit info
 */
export async function checkSubmissionLimits(
  db: ReturnType<typeof getDb>,
  contestId: string,
  categoryId: string,
  userEmail: string
): Promise<{
  currentCount: number;
  maxAllowed: number;
  canSubmit: boolean;
}> {
  // Count existing submissions
  const countResult = await db
    .select({ count: count() })
    .from(submissions)
    .where(and(
      eq(submissions.contestId, contestId),
      eq(submissions.categoryId, categoryId),
      eq(submissions.userEmail, userEmail),
      eq(submissions.isActive, true)
    ));

  const currentCount = countResult[0]?.count || 0;

  // Get contest submission limit
  const contestResult = await db
    .select({ maxSubmissionsPerCategory: contests.maxSubmissionsPerCategory })
    .from(contests)
    .where(eq(contests.id, contestId))
    .limit(1);

  const maxAllowed = contestResult[0]?.maxSubmissionsPerCategory || 2;

  return {
    currentCount,
    maxAllowed,
    canSubmit: currentCount < maxAllowed
  };
}

/**
 * Gets user's submissions for the active contest, organized by category
 * Pure function - returns structured contest data with user submissions
 */
export async function getUserContestSubmissions(
  db: ReturnType<typeof getDb>,
  userEmail: string
): Promise<{
  contest: Contest | null;
  categories: Array<Category & { 
    submissions: Submission[];
    submissionCount: number;
    maxSubmissions: number;
  }>;
}> {
  const { contest, categories: activeCategories } = await getActiveContest(db);

  if (!contest) {
    return { contest: null, categories: [] };
  }

  // Get user's submissions for this contest
  const userSubmissions = await db
    .select()
    .from(submissions)
    .where(and(
      eq(submissions.contestId, contest.id),
      eq(submissions.userEmail, userEmail),
      eq(submissions.isActive, true)
    ))
    .orderBy(submissions.uploadedAt);

  // Organize submissions by category
  const categoriesWithSubmissions = activeCategories.map(category => {
    const categorySubmissions = userSubmissions.filter(
      sub => sub.categoryId === category.id
    );

    return {
      ...category,
      submissions: categorySubmissions,
      submissionCount: categorySubmissions.length,
      maxSubmissions: contest.maxSubmissionsPerCategory || 2
    };
  });

  return {
    contest,
    categories: categoriesWithSubmissions
  };
} 
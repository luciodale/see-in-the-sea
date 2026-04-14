import { and, asc, count, eq, gte } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { type getDb, uploadAttempts } from '../db/index';

const UPLOAD_LIMIT_PER_HOUR = 30;
const WINDOW_MS = 60 * 60 * 1000;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * Checks whether the user is under the upload rate limit and records a new
 * attempt if so. Returns retry-after seconds when the limit is exceeded.
 *
 * Not called for admin users: rate limiting is skipped entirely at the caller.
 */
export async function checkAndRecordUploadAttempt(
  db: ReturnType<typeof getDb>,
  userEmail: string
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = new Date(now - WINDOW_MS).toISOString();

  const [{ value: recentCount } = { value: 0 }] = await db
    .select({ value: count() })
    .from(uploadAttempts)
    .where(
      and(
        eq(uploadAttempts.userEmail, userEmail),
        gte(uploadAttempts.attemptedAt, windowStart)
      )
    );

  if (recentCount >= UPLOAD_LIMIT_PER_HOUR) {
    const [oldest] = await db
      .select({ attemptedAt: uploadAttempts.attemptedAt })
      .from(uploadAttempts)
      .where(
        and(
          eq(uploadAttempts.userEmail, userEmail),
          gte(uploadAttempts.attemptedAt, windowStart)
        )
      )
      .orderBy(asc(uploadAttempts.attemptedAt))
      .limit(1);

    const oldestMs = oldest ? Date.parse(oldest.attemptedAt) : now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldestMs + WINDOW_MS - now) / 1000)
    );

    return { allowed: false, retryAfterSeconds };
  }

  await db.insert(uploadAttempts).values({
    id: nanoid(),
    userEmail,
    attemptedAt: new Date(now).toISOString(),
  });

  return { allowed: true };
}

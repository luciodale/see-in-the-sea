import { and, eq, sql } from 'drizzle-orm';
import type { getDb } from '../db';
import { payments, submissions } from '../db/schema';

type Db = ReturnType<typeof getDb>;

/** Total paid by one entrant for a contest, summed over every payment row. */
export async function getPaidCents(
  db: Db,
  contestId: string,
  userEmail: string
) {
  const rows = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(
      and(eq(payments.contestId, contestId), eq(payments.userEmail, userEmail))
    );
  return Number(rows[0]?.total ?? 0);
}

/** Total paid per entrant for a contest. */
export async function getPaidCentsByUser(db: Db, contestId: string) {
  const rows = await db
    .select({
      userEmail: payments.userEmail,
      total: sql<number>`sum(${payments.amount})`,
    })
    .from(payments)
    .where(eq(payments.contestId, contestId))
    .groupBy(payments.userEmail);
  return new Map(rows.map(row => [row.userEmail, Number(row.total)]));
}

/** Distinct categories entered per entrant for a contest. */
export async function getCategoryCountByUser(db: Db, contestId: string) {
  const rows = await db
    .select({
      userEmail: submissions.userEmail,
      count: sql<number>`count(distinct ${submissions.categoryId})`,
    })
    .from(submissions)
    .where(eq(submissions.contestId, contestId))
    .groupBy(submissions.userEmail);
  return new Map(rows.map(row => [row.userEmail, Number(row.count)]));
}

import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Contests table
export const contests = sqliteTable('contests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  maxSubmissionsPerCategory: integer('max_submissions_per_category').default(2),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Categories table
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Submissions table
export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  contestId: text('contest_id').notNull(),
  categoryId: text('category_id').notNull(),
  userEmail: text('user_email').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  r2Key: text('r2_key').notNull().unique(),
  imageUrl: text('image_url').unique(),
  originalFilename: text('original_filename'),
  fileSize: integer('file_size'),
  contentType: text('content_type'),
  uploadedAt: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
});

// Results table for contest winners
export const results = sqliteTable('results', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull(),
  result: text('result').notNull(), // 'first', 'second', 'third', 'runner-up'
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Judges table
export const judges = sqliteTable('judges', {
  id: text('id').primaryKey(),
  contestId: text('contest_id').notNull(),
  fullName: text('full_name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Indexes - defined separately to avoid deprecation warning
export const submissionsContestUserIdx = index(
  'idx_submissions_contest_user'
).on(submissions.contestId, submissions.userEmail);
export const submissionsCategoryIdx = index('idx_submissions_category').on(
  submissions.categoryId
);
export const submissionsUserIdx = index('idx_submissions_user').on(
  submissions.userEmail
);
export const submissionsUploadedAtIdx = index('idx_submissions_uploaded_at').on(
  submissions.uploadedAt
);

// Results indexes
export const resultsSubmissionIdx = index('idx_results_submission').on(
  results.submissionId
);

// Judges indexes
export const judgesContestIdx = index('idx_judges_contest').on(
  judges.contestId
);

// Type exports for TypeScript usage
export type Contest = typeof contests.$inferSelect;
export type NewContest = typeof contests.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type Result = typeof results.$inferSelect;
export type NewResult = typeof results.$inferInsert;
export type Judge = typeof judges.$inferSelect;
export type NewJudge = typeof judges.$inferInsert;

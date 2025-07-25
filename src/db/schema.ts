import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Contests table - matches schema.sql exactly
export const contests = sqliteTable('contests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  maxSubmissionsPerCategory: integer('max_submissions_per_category').default(2),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Categories table - matches schema.sql exactly
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Submissions table - matches schema.sql exactly (including served_image_url)
export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  contestId: text('contest_id').notNull(),
  categoryId: text('category_id').notNull(),
  userEmail: text('user_email').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  r2Key: text('r2_key').notNull().unique(),
  imageUrl: text('image_url').notNull().unique(),
  originalFilename: text('original_filename'),
  fileSize: integer('file_size'),
  contentType: text('content_type'),
  uploadedAt: text('uploaded_at').default('CURRENT_TIMESTAMP'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

// Indexes - defined separately to avoid deprecation warning
export const submissionsContestUserIdx = index('idx_submissions_contest_user').on(submissions.contestId, submissions.userEmail);
export const submissionsCategoryIdx = index('idx_submissions_category').on(submissions.categoryId);
export const submissionsUserIdx = index('idx_submissions_user').on(submissions.userEmail);
export const submissionsUploadedAtIdx = index('idx_submissions_uploaded_at').on(submissions.uploadedAt);

// Type exports for TypeScript usage
export type Contest = typeof contests.$inferSelect;
export type NewContest = typeof contests.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert; 
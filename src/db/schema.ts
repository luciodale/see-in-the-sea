import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Contests table
export const contests = sqliteTable('contests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  year: integer('year').notNull(),
  status: text('status')
    .$type<'active' | 'inactive' | 'assessment'>()
    .notNull()
    .default('inactive'),
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
  contestId: text('contest_id')
    .notNull()
    .references(() => contests.id),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  userEmail: text('user_email').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  r2Key: text('r2_key').notNull().unique(),
  imageUrl: text('image_url').unique(),
  originalFilename: text('original_filename'),
  fileSize: integer('file_size'),
  contentType: text('content_type'),
  portfolio: text('portfolio'),
  portfolioPhotoType: text('portfolio_photo_type'),
  uploadedAt: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`),
});

// Results table for contest winners
export const results = sqliteTable('results', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id')
    .notNull()
    .references(() => submissions.id),
  result: text('result').notNull(), // 'first', 'second', 'third', 'runner-up'
  firstName: text('first_name'),
  lastName: text('last_name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Judges table
export const judges = sqliteTable('judges', {
  id: text('id').primaryKey(),
  contestId: text('contest_id')
    .notNull()
    .references(() => contests.id),
  fullName: text('full_name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Payments table for tracking successful payments
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  contestId: text('contest_id')
    .notNull()
    .references(() => contests.id),
  userEmail: text('user_email').notNull(),
  stripeSessionId: text('stripe_session_id').notNull().unique(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  amount: integer('amount').notNull(), // Amount in cents
  currency: text('currency').notNull().default('eur'),
  status: text('status')
    .$type<'pending' | 'completed' | 'failed' | 'refunded'>()
    .notNull()
    .default('pending'),
  categoryCount: integer('category_count').notNull(), // Number of categories user submitted to
  metadata: text('metadata'), // JSON string for additional data
  paidAt: text('paid_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
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

// Payments indexes
export const paymentsContestUserIdx = index('idx_payments_contest_user').on(
  payments.contestId,
  payments.userEmail
);
export const paymentsStripeSessionIdx = index('idx_payments_stripe_session').on(
  payments.stripeSessionId
);
export const paymentsStatusIdx = index('idx_payments_status').on(
  payments.status
);
export const paymentsPaidAtIdx = index('idx_payments_paid_at').on(
  payments.paidAt
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
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

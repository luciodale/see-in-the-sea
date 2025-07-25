CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`display_order` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `contests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`is_active` integer DEFAULT true,
	`max_submissions_per_category` integer DEFAULT 2,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`contest_id` text NOT NULL,
	`category_id` text NOT NULL,
	`user_email` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`r2_key` text NOT NULL,
	`image_url` text NOT NULL,
	`served_image_url` text NOT NULL,
	`original_filename` text,
	`file_size` integer,
	`content_type` text,
	`uploaded_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_r2_key_unique` ON `submissions` (`r2_key`);--> statement-breakpoint
CREATE INDEX `idx_submissions_contest_user` ON `submissions` (`contest_id`,`user_email`);--> statement-breakpoint
CREATE INDEX `idx_submissions_category` ON `submissions` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_submissions_user` ON `submissions` (`user_email`);--> statement-breakpoint
CREATE INDEX `idx_submissions_uploaded_at` ON `submissions` (`uploaded_at`);
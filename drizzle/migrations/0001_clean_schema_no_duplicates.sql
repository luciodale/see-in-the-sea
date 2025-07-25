DROP INDEX `idx_submissions_contest_user`;--> statement-breakpoint
DROP INDEX `idx_submissions_category`;--> statement-breakpoint
DROP INDEX `idx_submissions_user`;--> statement-breakpoint
DROP INDEX `idx_submissions_uploaded_at`;--> statement-breakpoint
CREATE UNIQUE INDEX `submissions_image_url_unique` ON `submissions` (`image_url`);--> statement-breakpoint
ALTER TABLE `submissions` DROP COLUMN `served_image_url`;
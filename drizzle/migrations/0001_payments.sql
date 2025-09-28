PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`contest_id` text NOT NULL,
	`user_email` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text DEFAULT 'eur' NOT NULL,
	`stripe_session_id` text NOT NULL,
	`paid_at` text NOT NULL,
	FOREIGN KEY (`contest_id`) REFERENCES `contests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_payments`("id", "contest_id", "user_email", "amount", "currency", "stripe_session_id", "paid_at") SELECT "id", "contest_id", "user_email", "amount", "currency", "stripe_session_id", "paid_at" FROM `payments`;--> statement-breakpoint
DROP TABLE `payments`;--> statement-breakpoint
ALTER TABLE `__new_payments` RENAME TO `payments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `payments_stripe_session_id_unique` ON `payments` (`stripe_session_id`);
CREATE TABLE `upload_attempts` (
  `id` text PRIMARY KEY NOT NULL,
  `user_email` text NOT NULL,
  `attempted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX `idx_upload_attempts_user_time` ON `upload_attempts` (`user_email`, `attempted_at`);

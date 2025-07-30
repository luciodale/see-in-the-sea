-- Migration: Add results table for contest winners
-- Created: 2025-07-30

CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_results_submission ON results(submission_id); 
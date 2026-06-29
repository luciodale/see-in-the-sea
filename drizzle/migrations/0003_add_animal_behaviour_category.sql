-- 2026 / 17th edition: add the new "Animal Behaviour" competition category and
-- raise the 2026 contest's per-category submission limit to 3 (was 2) to match
-- the new regulations. Idempotent: INSERT OR IGNORE + a scoped UPDATE.

INSERT OR IGNORE INTO categories (id, name, description) VALUES ('animal-behaviour', 'Animal Behaviour', 'Wide-angle, close-focus and macro images capturing a particular situation of underwater life');

UPDATE contests SET max_submissions_per_category = 3 WHERE id = 'uw-2026';

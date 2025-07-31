-- Clear database tables in the correct order (respecting foreign key constraints)
DELETE FROM results;
DELETE FROM submissions;
DELETE FROM judges;
DELETE FROM contests;
DELETE FROM categories; 
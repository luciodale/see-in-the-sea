-- Contest management database schema

-- Contests table
CREATE TABLE contests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_submissions_per_category INTEGER DEFAULT 2,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories for underwater photography contest
INSERT INTO categories (id, name, description, display_order) VALUES 
    ('category-1', 'Wide Angle', 'Expansive underwater scenes, coral reefs, and seascapes', 1),
    ('category-2', 'Macro', 'Close-up photography of small marine life and details', 2),
    ('category-3', 'Black and White', 'Monochrome underwater photography showcasing contrast and composition', 3);

-- Submissions table
CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    contest_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    user_email TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    r2_key TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    served_image_url TEXT NOT NULL,
    original_filename TEXT,
    file_size INTEGER,
    content_type TEXT,
    uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes for performance
CREATE INDEX idx_submissions_contest_user ON submissions(contest_id, user_email);
CREATE INDEX idx_submissions_category ON submissions(category_id);
CREATE INDEX idx_submissions_user ON submissions(user_email);
CREATE INDEX idx_submissions_uploaded_at ON submissions(uploaded_at);

-- Insert a default contest
INSERT INTO contests (id, name, description, start_date, end_date) VALUES 
    ('2025 contest', 'Underwater Photography Contest 2025', 'Annual underwater photography competition', '2025-01-01', '2025-12-31'); 
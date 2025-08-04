-- Seed data for underwater photography contest

INSERT OR IGNORE INTO categories (id, name, description) VALUES ('wide-angle', 'Wide Angle', 'Expansive underwater scenes, coral reefs, and seascapes that showcase the vastness of the underwater world');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('macro', 'Macro', 'Close-up photography of small marine life, textures, and intricate underwater details');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('black-and-white', 'Black & White', 'Monochrome underwater photography emphasizing contrast, composition, and artistic expression');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('mediterranean', 'Mediterranean Portfolio', 'Portfolio of underwater photography from the Mediterranean Sea');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('storyboard', 'Storyboard', 'Storyboard');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('compact', 'Compact', 'Compact');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('molluscs', 'Molluscs', 'Molluscs');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('the-sea', 'The Sea', 'The Sea');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('dan-europe-photography-security', 'Dan Europe Photography Security', 'Dan Europe Photography Security');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('giovanni-smorti-award', 'Giovanni Smorti Award', 'Giovanni Smorti Award');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('seahorse', 'Seahorse', 'Seahorse');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('waves', 'Waves', 'Waves');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('newcomers', 'Newcomers', 'Newcomers');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('the-professions-of-the-sea', 'The Professions of the Sea', 'The Professions of the Sea');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('art-in-the-water', 'Art in the Water', 'Art in the Water');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('trabocchi-coast', 'Trabocchi Coast', 'Trabocchi Coast');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('environment', 'Environment', 'Environment');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('open', 'Open', 'Open');
INSERT OR IGNORE INTO categories (id, name, description) VALUES ('the-sea-in-motion', 'The Sea in Motion', 'The Sea in Motion');

INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2025', 'UW Contest 2025', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2025-01-01', '2025-12-31', true);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2024', 'UW Contest 2024', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2024-01-01', '2024-12-31', false);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2019', 'UW Contest 2019', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2019-01-01', '2019-12-31', false);

INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('S0wuCz7c8SwJbCpluksQn', 'uw-2024', 'Pietro Formis');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('vjuJgxm48uip_lUkPFKYW', 'uw-2024', 'Domenico Roscigno');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('6svDfWvWCgjw1F1XPKBIL', 'uw-2024', 'Pasquale Vassallo');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('DLd7qHkfM2E0OgLY71Ptd', 'uw-2019', 'Isabella Maffei');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('txfZvG9mER5UAazOp9jzK', 'uw-2019', 'David Salvatori');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('mOYhgEHDrP5ie-lNCzV0K', 'uw-2019', 'Massimo Zannini');
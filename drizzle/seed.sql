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
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2017', 'UW Contest 2017', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2017-01-01', '2017-12-31', false);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2018', 'UW Contest 2018', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2018-01-01', '2018-12-31', false);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2019', 'UW Contest 2019', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2019-01-01', '2019-12-31', false);

INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('ESKdcLho3UQoGP0G_yoS4', 'uw-2024', 'Pietro Formis');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('1hIy823Sc6xxu7uDpnbwi', 'uw-2024', 'Domenico Roscigno');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('aTX8I13gvBgUP0_VLywsO', 'uw-2024', 'Pasquale Vassallo');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('jAKA8PW_HrKEfmRZCNpqq', 'uw-2017', 'Marco Colombo');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('EWZq8c0zMfWPuAhRHbZOp', 'uw-2017', 'Marcello Di Francesco');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('DlflpEAsqUNDTVfpCL7IP', 'uw-2017', 'Davide Vezzaro');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('a7em8YQ932CnbsU6ts44Q', 'uw-2018', 'Domenico Roscigno');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('R9r8ItH7Z-9LWUD5XTPhc', 'uw-2018', 'Davide Vezzaro');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('IRnluo697DvqRGq9CVzpP', 'uw-2018', 'Massimo Zannini');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('mXCllkLQtjPS_kjQVprcp', 'uw-2019', 'Isabella Maffei');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('yqiw0H1Jl9Rg5Yhks2Xni', 'uw-2019', 'David Salvatori');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('ppdhZ7lDYFAlYZqhg_4UM', 'uw-2019', 'Massimo Zannini');
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
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2016', 'UW Contest 2016', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2016-01-01', '2016-12-31', false);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2017', 'UW Contest 2017', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2017-01-01', '2017-12-31', false);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2018', 'UW Contest 2018', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2018-01-01', '2018-12-31', false);
INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('uw-2019', 'UW Contest 2019', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2019-01-01', '2019-12-31', false);

INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('PGExmk0pSL4SZxVgK_r9U', 'uw-2024', 'Pietro Formis');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('52pzZPdiZznQDCtgUs8Hn', 'uw-2024', 'Domenico Roscigno');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('DDz5HFl707__pkOQN8kAQ', 'uw-2024', 'Pasquale Vassallo');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('oTK2Snw_vclKlmCkErTRk', 'uw-2016', 'Marco Colombo');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('Nq3uxT43f2kP2bjq0iSiv', 'uw-2016', 'Paolo Fossati');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('bu_xvg3GxnCijGCbJL0tk', 'uw-2016', 'Davide Vezzaro');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('tYROH66uJ4Pr4H-AkDvPJ', 'uw-2017', 'Marco Colombo');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('ONIb5gEwNhmWZJ379gwjU', 'uw-2017', 'Marcello Di Francesco');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('G4T2SFlGGSykst-Xv3p0x', 'uw-2017', 'Davide Vezzaro');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('ZuaVi8G5aNBjHAPtBdI0U', 'uw-2018', 'Domenico Roscigno');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('NYpaH05XKRZ-HkhEfcRNA', 'uw-2018', 'Davide Vezzaro');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('8l6HiKiCK7SMDfOLpThZj', 'uw-2018', 'Massimo Zannini');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('IiaUul_K6MTNXkjWIXCME', 'uw-2019', 'Isabella Maffei');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('5F5h3iG-wp8AF98x3duyR', 'uw-2019', 'David Salvatori');
INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('1JHBz_EgK2GgaCv4l-gmN', 'uw-2019', 'Massimo Zannini');
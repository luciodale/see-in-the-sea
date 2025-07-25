-- Seed data for underwater photography contest

INSERT INTO categories (id, name, description, display_order) VALUES ('wide-angle', 'Wide Angle', 'Expansive underwater scenes, coral reefs, and seascapes that showcase the vastness of the underwater world', 1);
INSERT INTO categories (id, name, description, display_order) VALUES ('macro', 'Macro', 'Close-up photography of small marine life, textures, and intricate underwater details', 2);
INSERT INTO categories (id, name, description, display_order) VALUES ('bw', 'Black & White', 'Monochrome underwater photography emphasizing contrast, composition, and artistic expression', 3);

INSERT INTO contests (id, name, description, start_date, end_date) VALUES ('uw-2025', 'Underwater Photography Contest 2025', 'Annual underwater photography competition celebrating the beauty and diversity of marine life', '2025-01-01', '2025-12-31');
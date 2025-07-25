-- Seed data for underwater photography contest

INSERT INTO categories (id, name, description, display_order) VALUES ('wide-angle', 'Wide Angle', 'Expansive underwater scenes, coral reefs, and seascapes', 1);
INSERT INTO categories (id, name, description, display_order) VALUES ('macro', 'Macro', 'Close-up photography of small marine life and details', 2);
INSERT INTO categories (id, name, description, display_order) VALUES ('black-and-white', 'Black and White', 'Monochrome underwater photography showcasing contrast and composition', 3);

INSERT INTO contests (id, name, description, start_date, end_date) VALUES ('2025-uw-contest', 'Underwater Photography Contest 2025', 'Annual underwater photography competition', '2025-01-01', '2025-12-31');
// Script to seed the database with default data
// This replaces the INSERT statements from schema.sql

export const seedData = {
  categories: [
    {
      id: 'wide-angle',
      name: 'Wide Angle',
      description: 'Expansive underwater scenes, coral reefs, and seascapes',
      displayOrder: 1
    },
    {
      id: 'macro', 
      name: 'Macro',
      description: 'Close-up photography of small marine life and details',
      displayOrder: 2
    },
    {
      id: 'black-and-white',
      name: 'Black and White', 
      description: 'Monochrome underwater photography showcasing contrast and composition',
      displayOrder: 3
    }
  ],
  
  contests: [
    {
      id: '2025-uw-contest',
      name: 'Underwater Photography Contest 2025',
      description: 'Annual underwater photography competition',
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    }
  ]
};

// Generate SQL for seeding
export const generateSeedSQL = () => {
  const categoryInserts = seedData.categories.map(cat => 
    `INSERT INTO categories (id, name, description, display_order) VALUES ('${cat.id}', '${cat.name}', '${cat.description}', ${cat.displayOrder});`
  ).join('\n');

  const contestInserts = seedData.contests.map(contest =>
    `INSERT INTO contests (id, name, description, start_date, end_date) VALUES ('${contest.id}', '${contest.name}', '${contest.description}', '${contest.startDate}', '${contest.endDate}');`
  ).join('\n');

  return `-- Seed data for underwater photography contest\n\n${categoryInserts}\n\n${contestInserts}`;
}; 
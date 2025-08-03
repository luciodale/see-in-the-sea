// Script to seed the database with default data

import { nanoid } from 'nanoid';

export const seeds = {
  categories: [
    {
      id: 'wide-angle',
      name: 'Wide Angle',
      description:
        'Expansive underwater scenes, coral reefs, and seascapes that showcase the vastness of the underwater world',
    },
    {
      id: 'macro',
      name: 'Macro',
      description:
        'Close-up photography of small marine life, textures, and intricate underwater details',
    },
    {
      id: 'bw',
      name: 'Black & White',
      description:
        'Monochrome underwater photography emphasizing contrast, composition, and artistic expression',
    },
    {
      id: 'mediterranean',
      name: 'Mediterranean Portfolio',
      description:
        'Portfolio of underwater photography from the Mediterranean Sea',
    },

    {
      id: 'storyboard',
      name: 'Storyboard',
      description: 'Storyboard',
    },
    {
      id: 'compact',
      name: 'Compact',
      description: 'Compact',
    },
    {
      id: 'molluscs',
      name: 'Molluscs',
      description: 'Molluscs',
    },
    {
      id: 'the-sea',
      name: 'The Sea',
      description: 'The Sea',
    },
    {
      id: 'dan-europe-photography-security',
      name: 'Dan Europe Photography Security',
      description: 'Dan Europe Photography Security',
    },
    {
      id: 'giovanni-smorti-award',
      name: 'Giovanni Smorti Award',
      description: 'Giovanni Smorti Award',
    },
    {
      id: 'seahorse',
      name: 'Seahorse',
      description: 'Seahorse',
    },
    {
      id: 'waves',
      name: 'Waves',
      description: 'Waves',
    },
    {
      id: 'newcomers',
      name: 'Newcomers',
      description: 'Newcomers',
    },
    {
      id: 'the-professions-of-the-sea',
      name: 'The Professions of the Sea',
      description: 'The Professions of the Sea',
    },
    {
      id: 'art-in-the-water',
      name: 'Art in the Water',
      description: 'Art in the Water',
    },
    {
      id: 'trabocchi-coast',
      name: 'Trabocchi Coast',
      description: 'Trabocchi Coast',
    },
    {
      id: 'environment',
      name: 'Environment',
      description: 'Environment',
    },
    {
      id: 'open',
      name: 'Open',
      description: 'Open',
    },
    {
      id: 'the-sea-in-motion',
      name: 'The Sea in Motion',
      description: 'The Sea in Motion',
    },
  ],
  contests: [
    {
      id: 'uw-2025',
      name: 'UW Contest 2025',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: true,
      judges: [],
    },
    {
      id: 'uw-2024',
      name: 'UW Contest 2024',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Pietro Formis',
        },
        {
          fullName: 'Domenico Roscigno',
        },
        {
          fullName: 'Pasquale Vassallo',
        },
      ],
    },
  ],
};

// Helper function to escape single quotes in SQL strings
function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

// Generate SQL for seeding
export function generateSeedSQL(): string {
  const categoryInserts = seeds.categories
    .map(
      cat =>
        `INSERT OR IGNORE INTO categories (id, name, description) VALUES ('${escapeSqlString(cat.id)}', '${escapeSqlString(cat.name)}', '${escapeSqlString(cat.description)}');`
    )
    .join('\n');

  const contestInserts = seeds.contests
    .map(
      contest =>
        `INSERT OR IGNORE INTO contests (id, name, description, start_date, end_date, is_active) VALUES ('${escapeSqlString(contest.id)}', '${escapeSqlString(contest.name)}', '${escapeSqlString(contest.description)}', '${contest.startDate}', '${contest.endDate}', ${contest.isActive});`
    )
    .join('\n');

  const judgeInserts = seeds.contests
    .flatMap(contest =>
      contest.judges.map(
        judge =>
          `INSERT OR IGNORE INTO judges (id, contest_id, full_name) VALUES ('${nanoid()}', '${escapeSqlString(contest.id)}', '${escapeSqlString(judge.fullName)}');`
      )
    )
    .join('\n');

  const result = `-- Seed data for underwater photography contest\n\n${categoryInserts}\n\n${contestInserts}\n\n${judgeInserts}`;
  console.log(result);
  return result;
}

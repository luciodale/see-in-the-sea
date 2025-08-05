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
      id: 'black-and-white',
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
    {
      id: 'fresh-waters',
      name: 'Fresh Waters',
      description:
        'Fresh water underwater photography featuring lakes, rivers, and freshwater life',
    },
    {
      id: 'dan-europe',
      name: 'Dan Europe',
      description:
        'DAN Europe photography security and safety underwater photography',
    },
    {
      id: 'photo-journalism',
      name: 'Photo Journalism',
      description:
        'Documentary underwater photography telling stories about marine conservation, human impact, and underwater events',
    },
    {
      id: 'pool',
      name: 'Pool',
      description:
        'Underwater photography taken in swimming pools, featuring artistic underwater portraits and creative compositions',
    },
    {
      id: 'special-mention',
      name: 'Special Mention',
      description: 'Special mentions and honorable recognitions in the contest',
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
    {
      id: 'uw-2014',
      name: 'UW Contest 2014',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2014-01-01',
      endDate: '2014-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Alberto Balbi',
        },
        {
          fullName: 'Franco Banfi',
        },
        {
          fullName: 'Paolo Fossati',
        },
      ],
    },
    {
      id: 'uw-2015',
      name: 'UW Contest 2015',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2015-01-01',
      endDate: '2015-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Alberto Balbi',
        },
        {
          fullName: 'Franco Banfi',
        },
        {
          fullName: 'Paolo Fossati',
        },
      ],
    },
    {
      id: 'uw-2016',
      name: 'UW Contest 2016',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2016-01-01',
      endDate: '2016-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Marco Colombo',
        },
        {
          fullName: 'Paolo Fossati',
        },
        {
          fullName: 'Davide Vezzaro',
        },
      ],
    },
    {
      id: 'uw-2017',
      name: 'UW Contest 2017',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2017-01-01',
      endDate: '2017-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Marco Colombo',
        },
        {
          fullName: 'Marcello Di Francesco',
        },
        {
          fullName: 'Davide Vezzaro',
        },
      ],
    },
    {
      id: 'uw-2018',
      name: 'UW Contest 2018',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2018-01-01',
      endDate: '2018-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Domenico Roscigno',
        },
        {
          fullName: 'Davide Vezzaro',
        },
        {
          fullName: 'Massimo Zannini',
        },
      ],
    },
    {
      id: 'uw-2019',
      name: 'UW Contest 2019',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2019-01-01',
      endDate: '2019-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Isabella Maffei',
        },
        {
          fullName: 'David Salvatori',
        },
        {
          fullName: 'Massimo Zannini',
        },
      ],
    },
    {
      id: 'uw-2013',
      name: 'UW Contest 2013',
      description:
        'Annual underwater photography competition celebrating the beauty and diversity of marine life',
      startDate: '2013-01-01',
      endDate: '2013-12-31',
      isActive: false,
      judges: [
        {
          fullName: 'Silvia Boccato',
        },
        {
          fullName: 'Paolo Fossati',
        },
        {
          fullName: 'Claudio Giulianini',
        },
        {
          fullName: 'Giuseppe Pignataro',
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

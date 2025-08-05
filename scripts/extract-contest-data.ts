#!/usr/bin/env bun

import { writeFileSync } from 'fs';
import { nanoid } from 'nanoid';

interface ContestEntry {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  result: string;
  firstName: string;
  lastName: string;
  fileName: string;
  imageUrl: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseResult(resultText: string): string {
  if (resultText.includes('1°')) return 'first';
  if (resultText.includes('2°')) return 'second';
  if (resultText.includes('3°')) return 'third';
  if (resultText.includes('Runner')) return 'runner-up';
  return 'runner-up';
}

function parseName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return { firstName, lastName };
}

async function downloadImage(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    writeFileSync(`migration/pictures/${fileName}`, new Uint8Array(buffer));
    console.log(`✅ Downloaded: ${fileName}`);
  } catch (error) {
    console.error(`❌ Failed to download ${fileName}:`, error);
  }
}

function createContestEntries(
  contestYear: string,
  entriesData: any[]
): ContestEntry[] {
  const entries: ContestEntry[] = [];

  // Process all categories
  entriesData.forEach(({ entries: categoryEntries, categoryId }) => {
    categoryEntries.forEach((entry: any) => {
      const { firstName, lastName } = parseName(entry.name);
      const resultType = parseResult(entry.result);

      const submission: ContestEntry = {
        id: nanoid(),
        contestId: `uw-${contestYear}`,
        categoryId,
        userEmail: '', // Will be filled later
        title: entry.title,
        description: '',
        result: resultType,
        firstName,
        lastName,
        fileName: `${slugify(entry.title)}.jpg`,
        imageUrl: entry.imageUrl,
      };

      entries.push(submission);
    });
  });

  return entries;
}

async function main() {
  const contestYear = process.argv[2];

  if (!contestYear) {
    console.error(
      '❌ Please provide contest year: bun scripts/extract-contest-data.ts 2018'
    );
    process.exit(1);
  }

  console.log(`🚀 Starting uw-${contestYear} data extraction...\n`);

  // TODO: Replace this with actual contest data
  // This is a template - you'll need to update the entriesData for each year
  const entriesData = [
    // Example structure:
    // {
    //   entries: [
    //     { name: 'PARTICIPANT NAME', title: 'Photo Title', result: '1° Classified', imageUrl: 'https://...' }
    //   ],
    //   categoryId: 'wide-angle'
    // }
  ];

  if (entriesData.length === 0) {
    console.error(
      '❌ No contest data defined. Please update the entriesData array with actual contest data.'
    );
    process.exit(1);
  }

  const entries = createContestEntries(contestYear, entriesData);

  console.log(
    `📸 Created ${entries.length} submissions across ${entriesData.length} categories`
  );

  // Download images
  console.log('\n📦 Downloading images...');
  for (const entry of entries) {
    await downloadImage(entry.imageUrl, entry.fileName);
  }

  // Generate migration file
  const migrationContent = `export interface MigrationSubmission {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  result: string;
  firstName: string;
  lastName: string;
  fileName: string;
}

export const submissions: MigrationSubmission[] = [
${entries
  .map(
    entry => `  {
    id: '${entry.id}',
    contestId: '${entry.contestId}',
    categoryId: '${entry.categoryId}',
    userEmail: '${entry.userEmail}',
    title: '${entry.title.replace(/'/g, "\\'")}',
    description: '${entry.description}',
    result: '${entry.result}',
    firstName: '${entry.firstName}',
    lastName: '${entry.lastName}',
    fileName: '${entry.fileName}',
  }`
  )
  .join(',\n')}
];
`;

  writeFileSync(`migration/uw-${contestYear}.ts`, migrationContent);

  console.log(`\n✅ Generated migration/uw-${contestYear}.ts`);
  console.log(`📊 Summary:`);
  console.log(`   Total submissions: ${entries.length}`);

  const categoryCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.categoryId] = (acc[entry.categoryId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  Object.entries(categoryCounts).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} submissions`);
  });
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

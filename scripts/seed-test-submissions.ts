#!/usr/bin/env bun

/**
 * SEED TEST SUBMISSIONS WITH REAL IMAGES (LOCAL ONLY)
 * ====================================================
 * Downloads placeholder images from picsum.photos, uploads to local R2,
 * and seeds the local D1 database.
 *
 * Usage:
 *   bun run scripts/seed-test-submissions.ts
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';

import {
  PHOTO_TYPES,
  PHOTOS_PER_PORTFOLIO,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../src/constants';
import { CURRENT_CONTEST_CATEGORIES } from '../src/constants/categories';

console.log('🌱 Seeding test submissions with real images (LOCAL only)...\n');

// Use the same categories as the app
const CATEGORIES = CURRENT_CONTEST_CATEGORIES.map(c => c.id);
const SUBMISSIONS_PER_CATEGORY = 8;
const TEMP_IMAGES_DIR = join(process.cwd(), '.temp-test-images');
const CONTEST_ID = 'uw-2025';

function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
}

const TITLES = [
  'Dancing Jellyfish',
  'Coral Garden at Dawn',
  'The Silent Predator',
  'Blue Depths',
  'Seahorse Portrait',
  'Turtle Journey',
  'Octopus Den',
  'Manta Ray Flight',
  'Reef Colors',
  'Shark Encounter',
  'Nudibranch World',
  'Kelp Forest',
  'Anemone City',
  'Whale Song',
  'Sunset Dive',
  'Hidden Moray',
  'Clownfish Home',
  'Ray of Light',
  'Deep Blue',
  'Marine Life',
  'Ocean Dreams',
  'Underwater World',
  'Sea Creatures',
  'Aquatic Beauty',
  "Neptune's Garden",
  'The Deep',
  'Marine Paradise',
  'Ocean Floor',
  'Sea Wonders',
  'Diving Adventure',
  'Blue Planet',
  'Submerged',
];

type Submission = {
  id: string;
  category: string;
  r2Key: string;
  title: string;
  description: string;
  email: string;
  localFile: string;
  portfolio?: string;
  portfolioPhotoType?: string;
};

async function downloadImage(
  imageIndex: number,
  filename: string
): Promise<boolean> {
  const url = `https://picsum.photos/seed/${imageIndex + 100}/800/800`;
  const filepath = join(TEMP_IMAGES_DIR, filename);

  if (existsSync(filepath)) {
    console.log(`   ⏭️  ${filename} already exists, skipping download`);
    return true;
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      console.log(
        `   ❌ Failed to download image ${imageIndex}: ${response.status}`
      );
      return false;
    }

    const buffer = await response.arrayBuffer();
    writeFileSync(filepath, Buffer.from(buffer));
    console.log(`   ✅ Downloaded ${filename}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Error downloading image ${imageIndex}: ${error}`);
    return false;
  }
}

function uploadToR2(localPath: string, r2Key: string): boolean {
  try {
    execSync(
      `bunx wrangler r2 object put see-in-the-sea-images/${r2Key} --file="${localPath}" --local --content-type="image/jpeg"`,
      { stdio: 'pipe' }
    );
    return true;
  } catch {
    console.log(`   ❌ Failed to upload to R2: ${r2Key}`);
    return false;
  }
}

async function main() {
  // Create temp images directory
  if (!existsSync(TEMP_IMAGES_DIR)) {
    mkdirSync(TEMP_IMAGES_DIR, { recursive: true });
    console.log(`📁 Created temp directory: ${TEMP_IMAGES_DIR}\n`);
  }

  // Calculate total images needed
  // Regular categories: 8 per category
  // Mediterranean: 2 portfolios × 3 photos × 2 users = 12
  const regularCategories = CATEGORIES.filter(c => c !== 'mediterranean');
  const totalRegularImages =
    regularCategories.length * SUBMISSIONS_PER_CATEGORY;
  const totalMediterraneanImages =
    PORTFOLIOS_PER_MEDITERRANEAN * PHOTOS_PER_PORTFOLIO * 2; // 2 users
  const totalImages = totalRegularImages + totalMediterraneanImages;

  // Download images
  console.log('📥 Downloading images from picsum.photos...');
  for (let i = 0; i < totalImages; i++) {
    const filename = `test-${i + 1}.jpg`;
    await downloadImage(i, filename);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Images downloaded\n`);

  // Generate submissions and upload to R2
  console.log(
    '📤 Uploading images to local R2 and generating database records...'
  );
  const submissions: Submission[] = [];
  let imageIndex = 0;

  // Regular categories
  for (const category of regularCategories) {
    console.log(`\n   📂 Category: ${category}`);
    for (let i = 0; i < SUBMISSIONS_PER_CATEGORY; i++) {
      const id = nanoid();
      const title = TITLES[imageIndex % TITLES.length];
      const localFile = join(TEMP_IMAGES_DIR, `test-${imageIndex + 1}.jpg`);
      const r2Key = `${CONTEST_ID}/${category}/${id}`;
      const userEmail = `testuser${(i % 8) + 1}@example.com`;

      if (existsSync(localFile)) {
        const success = uploadToR2(localFile, r2Key);
        if (success) {
          console.log(`      ✅ Uploaded: ${r2Key}`);
          submissions.push({
            id,
            category,
            r2Key,
            title,
            description: `Una bellissima foto di ${title.toLowerCase()}`,
            email: userEmail,
            localFile,
          });
        }
      }
      imageIndex++;
    }
  }

  // Mediterranean category - with portfolios
  // Each user has PORTFOLIOS_PER_MEDITERRANEAN portfolios, each with PHOTOS_PER_PORTFOLIO photos
  // Portfolio is identified by: userEmail + portfolio number (1 or 2)
  console.log(`\n   📂 Category: mediterranean (with portfolios)`);
  const medUsers = ['testuser1@example.com', 'testuser2@example.com'];

  for (const userEmail of medUsers) {
    for (
      let portfolioNum = 1;
      portfolioNum <= PORTFOLIOS_PER_MEDITERRANEAN;
      portfolioNum++
    ) {
      // Portfolio ID is just the number - combined with userEmail it's unique
      const portfolioId = String(portfolioNum);
      console.log(`      📁 User: ${userEmail}, Portfolio ${portfolioId}`);

      for (const photoType of PHOTO_TYPES) {
        const id = nanoid();
        const title = `Mediterranean ${photoType} - Portfolio ${portfolioNum}`;
        const localFile = join(TEMP_IMAGES_DIR, `test-${imageIndex + 1}.jpg`);
        const r2Key = `${CONTEST_ID}/mediterranean/${id}`;

        // Intentionally skip some photos for testuser2's portfolio 2 to test incomplete data
        const isIncompletePortfolio =
          userEmail === 'testuser2@example.com' &&
          portfolioNum === 2 &&
          photoType !== 'macro'; // Only keep 'macro', skip 'wide-angle' and 'free'

        if (isIncompletePortfolio) {
          console.log(
            `         ⏭️  SKIPPED ${photoType} (testing incomplete portfolio)`
          );
          imageIndex++;
          continue;
        }

        if (existsSync(localFile)) {
          const success = uploadToR2(localFile, r2Key);
          if (success) {
            console.log(`         ✅ ${photoType}: ${r2Key}`);
            submissions.push({
              id,
              category: 'mediterranean',
              r2Key,
              title,
              description: `Foto ${photoType} del portfolio ${portfolioNum}`,
              email: userEmail,
              localFile,
              portfolio: portfolioId, // "1" or "2" - combined with userEmail is unique
              portfolioPhotoType: photoType,
            });
          }
        }
        imageIndex++;
      }
    }
  }

  // Generate SQL
  console.log('\n\n📝 Generating SQL...');
  const sqlStatements = submissions.map(sub => {
    const portfolioVal = sub.portfolio ? `'${sub.portfolio}'` : 'NULL';
    const photoTypeVal = sub.portfolioPhotoType
      ? `'${sub.portfolioPhotoType}'`
      : 'NULL';

    return `INSERT OR IGNORE INTO submissions (
    id, contest_id, category_id, user_email, title, description, r2_image_id, r2_key, original_filename, file_size, content_type, portfolio, portfolio_photo_type
  ) VALUES (
    '${sub.id}',
    '${CONTEST_ID}',
    '${sub.category}',
    '${sub.email}',
    '${escapeSqlString(sub.title)}',
    '${escapeSqlString(sub.description)}',
    '${sub.r2Key}',
    '${sub.r2Key}',
    'test-image.jpg',
    1024000,
    'image/jpeg',
    ${portfolioVal},
    ${photoTypeVal}
  );`;
  });

  const sql = `-- Test submissions for local R2 (LOCAL ONLY)
-- Generated at ${new Date().toISOString()}

${sqlStatements.join('\n\n')}
`;

  const tempSqlFile = join(process.cwd(), 'temp-test-submissions.sql');
  writeFileSync(tempSqlFile, sql);

  // Execute LOCAL ONLY
  try {
    // Clear related tables first (foreign key constraints)
    console.log('\n🗑️  Clearing old judging flags...');
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM judging_flags WHERE submission_id IN (SELECT id FROM submissions WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com');"`,
      { stdio: 'pipe' }
    );

    console.log('🗑️  Clearing old results...');
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM results WHERE submission_id IN (SELECT id FROM submissions WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com');"`,
      { stdio: 'pipe' }
    );

    console.log('🗑️  Clearing old test submissions...');
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM submissions WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com';"`,
      { stdio: 'inherit' }
    );

    console.log('\n🚀 Inserting test submissions into LOCAL database...');
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --file="${tempSqlFile}"`,
      { stdio: 'inherit' }
    );

    console.log('\n🔧 Ensuring judging_flags table exists...');
    const migrationPath = join(
      process.cwd(),
      'drizzle',
      'migrations',
      '0003_judging_flags.sql'
    );
    try {
      execSync(
        `bunx wrangler d1 execute see-in-the-sea-db --local --file="${migrationPath}"`,
        { stdio: 'pipe' }
      );
    } catch {
      // Table might already exist
    }

    console.log('\n✅ Done!');
    console.log(`\n📊 Summary:`);
    console.log(`   Regular categories: ${regularCategories.length}`);
    console.log(
      `   Mediterranean portfolios: ${PORTFOLIOS_PER_MEDITERRANEAN * medUsers.length}`
    );
    console.log(`   Total submissions: ${submissions.length}`);
    console.log(`   Images uploaded to: local R2 bucket`);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }

  console.log('\n🎉 Visit /admin/judging or /admin/current-contest to test!');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

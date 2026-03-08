#!/usr/bin/env bun

/**
 * SEED TEST SUBMISSIONS WITH LOCAL IMAGES (LOCAL ONLY)
 * =====================================================
 * Uses static images from public/images/contests/ to seed the local D1
 * database and local R2 bucket for testing the judging panel.
 *
 * Usage:
 *   bun run scripts/seed-test-submissions.ts
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';

import {
  PHOTO_TYPES,
  PHOTOS_PER_PORTFOLIO,
  PORTFOLIOS_PER_MEDITERRANEAN,
} from '../src/constants';
import { CURRENT_CONTEST_CATEGORIES } from '../src/constants/categories';

console.log(
  '🌱 Seeding test submissions with local images (LOCAL only)...\n'
);

const CATEGORIES = CURRENT_CONTEST_CATEGORIES.map(c => c.id);
const SUBMISSIONS_PER_CATEGORY = 6;
const CONTEST_ID = 'uw-2025';
const IMAGES_DIR = join(process.cwd(), 'public', 'images', 'contests');

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

/** Collect all image files from public/images/contests/ subdirectories */
function collectLocalImages(): string[] {
  const images: string[] = [];
  if (!existsSync(IMAGES_DIR)) {
    console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const years = readdirSync(IMAGES_DIR).filter(d =>
    statSync(join(IMAGES_DIR, d)).isDirectory()
  );

  for (const year of years.sort().reverse()) {
    const yearDir = join(IMAGES_DIR, year);
    const files = readdirSync(yearDir).filter(f =>
      /\.(webp|jpg|jpeg|png)$/i.test(f)
    );
    for (const f of files) {
      images.push(join(yearDir, f));
    }
  }

  return images;
}

function contentTypeForFile(filepath: string): string {
  if (filepath.endsWith('.webp')) return 'image/webp';
  if (filepath.endsWith('.png')) return 'image/png';
  return 'image/jpeg';
}

function uploadToR2(localPath: string, r2Key: string): boolean {
  const ct = contentTypeForFile(localPath);
  try {
    execSync(
      `bunx wrangler r2 object put see-in-the-sea-images/${r2Key} --file="${localPath}" --local --content-type="${ct}"`,
      { stdio: 'pipe' }
    );
    return true;
  } catch {
    console.log(`   ❌ Failed to upload to R2: ${r2Key}`);
    return false;
  }
}

function main() {
  const localImages = collectLocalImages();
  console.log(`📂 Found ${localImages.length} local images\n`);

  if (localImages.length < 30) {
    console.error(
      '❌ Need at least 30 images to seed all categories. Found:',
      localImages.length
    );
    process.exit(1);
  }

  const submissions: Submission[] = [];
  const userEmails = new Set<string>();
  let imgIdx = 0;

  function nextImage(): string {
    const img = localImages[imgIdx % localImages.length];
    imgIdx++;
    return img;
  }

  // Regular categories
  const regularCategories = CATEGORIES.filter(c => c !== 'mediterranean');
  for (const category of regularCategories) {
    console.log(`📂 Category: ${category}`);
    for (let i = 0; i < SUBMISSIONS_PER_CATEGORY; i++) {
      const id = nanoid();
      const title = TITLES[imgIdx % TITLES.length];
      const localFile = nextImage();
      const r2Key = `${CONTEST_ID}/${category}/${id}`;
      const userEmail = `testuser${(i % 4) + 1}@example.com`;
      userEmails.add(userEmail);

      const success = uploadToR2(localFile, r2Key);
      if (success) {
        console.log(`   ✅ ${title}`);
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
  }

  // Mediterranean category with portfolios
  console.log(`\n📂 Category: mediterranean (portfolios)`);
  const medUsers = ['testuser1@example.com', 'testuser2@example.com'];

  for (const userEmail of medUsers) {
    userEmails.add(userEmail);
    for (
      let portfolioNum = 1;
      portfolioNum <= PORTFOLIOS_PER_MEDITERRANEAN;
      portfolioNum++
    ) {
      const portfolioId = String(portfolioNum);
      console.log(`   📁 ${userEmail} / Portfolio ${portfolioId}`);

      for (const photoType of PHOTO_TYPES) {
        const id = nanoid();
        const title = `Mediterranean ${photoType} - Portfolio ${portfolioNum}`;
        const localFile = nextImage();
        const r2Key = `${CONTEST_ID}/mediterranean/${id}`;

        const success = uploadToR2(localFile, r2Key);
        if (success) {
          console.log(`      ✅ ${photoType}`);
          submissions.push({
            id,
            category: 'mediterranean',
            r2Key,
            title,
            description: `Foto ${photoType} del portfolio ${portfolioNum}`,
            email: userEmail,
            localFile,
            portfolio: portfolioId,
            portfolioPhotoType: photoType,
          });
        }
      }
    }
  }

  // Generate SQL for submissions
  console.log('\n📝 Generating SQL...');
  const sqlStatements: string[] = [];

  for (const sub of submissions) {
    const portfolioVal = sub.portfolio ? `'${sub.portfolio}'` : 'NULL';
    const photoTypeVal = sub.portfolioPhotoType
      ? `'${sub.portfolioPhotoType}'`
      : 'NULL';

    sqlStatements.push(`INSERT OR IGNORE INTO submissions (
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
    'image/webp',
    ${portfolioVal},
    ${photoTypeVal}
  );`);
  }

  // Generate payment records so the judging API inner-join works
  for (const email of userEmails) {
    const paymentId = nanoid();
    const stripeSessionId = `cs_test_${nanoid()}`;
    sqlStatements.push(`INSERT OR IGNORE INTO payments (
    id, contest_id, user_email, amount, currency, stripe_session_id, status, category_count, paid_at
  ) VALUES (
    '${paymentId}',
    '${CONTEST_ID}',
    '${email}',
    5000,
    'eur',
    '${stripeSessionId}',
    'paid',
    4,
    '${new Date().toISOString()}'
  );`);
  }

  const sql = `-- Test submissions + payments for local judging (LOCAL ONLY)
-- Generated at ${new Date().toISOString()}

${sqlStatements.join('\n\n')}
`;

  const tempSqlFile = join(process.cwd(), 'temp-test-submissions.sql');
  writeFileSync(tempSqlFile, sql);

  // Execute against local D1
  try {
    console.log('\n🗑️  Clearing old test data...');
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM judging_flags WHERE submission_id IN (SELECT id FROM submissions WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com');"`,
      { stdio: 'pipe' }
    );
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM results WHERE submission_id IN (SELECT id FROM submissions WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com');"`,
      { stdio: 'pipe' }
    );
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM submissions WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com';"`,
      { stdio: 'pipe' }
    );
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --command="DELETE FROM payments WHERE contest_id='${CONTEST_ID}' AND user_email LIKE 'testuser%@example.com';"`,
      { stdio: 'pipe' }
    );

    console.log('🚀 Inserting test data into LOCAL database...');
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --local --file="${tempSqlFile}"`,
      { stdio: 'inherit' }
    );

    console.log('\n✅ Done!');
    console.log(`\n📊 Summary:`);
    console.log(`   Regular categories: ${regularCategories.length}`);
    console.log(
      `   Mediterranean portfolios: ${PORTFOLIOS_PER_MEDITERRANEAN * medUsers.length}`
    );
    console.log(`   Total submissions: ${submissions.length}`);
    console.log(`   Payment records: ${userEmails.size}`);
    console.log(`   Images uploaded to: local R2 bucket`);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }

  console.log('\n🎉 Visit /admin/judging to test!');
}

main();

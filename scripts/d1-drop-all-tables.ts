#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🗑️  Starting complete tear down of all resources...\n');

// Step 1: Drop all tables from D1 database
console.log('📊 STEP 1: Dropping all D1 database tables...');

// Easy toggle: use --remote flag for remote mode, otherwise local
const isRemote = process.argv.includes('--remote');
const mode = isRemote ? 'remote' : 'local';

const tablesToDrop = [
  'submissions',
  'results',
  'judges',
  'categories',
  'contests',
];

for (const table of tablesToDrop) {
  try {
    const dropCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --command="DROP TABLE IF EXISTS ${table};"`;
    console.log(`   Dropping table: ${table}`);
    execSync(dropCommand, { stdio: 'pipe' });
    console.log(`   ✅ Dropped: ${table}`);
  } catch (error) {
    console.log(`   ⚠️  Table ${table} doesn't exist or already dropped`);
    console.log(error);
  }
}

// Step 2: Drop Drizzle migrations folder
console.log('\n📁 STEP 2: Dropping Drizzle migrations folder...');

try {
  const drizzleDir = join(process.cwd(), 'drizzle');
  if (existsSync(drizzleDir)) {
    console.log('   Removing drizzle directory...');
    rmSync(drizzleDir, { recursive: true, force: true });
    console.log('   ✅ Dropped: drizzle/');
  } else {
    console.log('   ⚠️  drizzle directory does not exist');
  }
} catch (error) {
  console.log('   ❌ Failed to remove drizzle directory:');
  console.log(error);
}

// Step 3: Note about R2 cleanup
console.log('\n📤 STEP 3: R2 Media cleanup...');
console.log('   ⚠️  Note: Wrangler CLI does not support listing R2 objects');
console.log(
  '   📋 To manually clean R2 bucket, use Cloudflare Dashboard or API'
);
console.log(
  '   🔗 Visit: https://dash.cloudflare.com/ > R2 > see-in-the-sea-media'
);
console.log(
  '   💡 Or use: aws s3 ls s3://see-in-the-sea-media (if configured)'
);

// Step 4: Verify cleanup
console.log('\n🔍 STEP 4: Verifying cleanup...');

try {
  const verifyTablesCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --command="SELECT name FROM sqlite_master WHERE type='table';"`;
  const tableOutput = execSync(verifyTablesCommand, { encoding: 'utf8' });
  console.log('   Remaining tables in D1:');
  console.log(tableOutput);
} catch (error) {
  console.log('   ❌ Could not verify D1 tables');
  console.log(error);
}

console.log('\n🎉 Tear down complete!');

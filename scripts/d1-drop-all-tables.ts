#!/usr/bin/env bun

import { execSync } from 'child_process';

console.log('🗑️  Starting complete tear down of all resources...\n');

// Step 1: Drop all tables from D1 database
console.log('📊 STEP 1: Dropping all D1 database tables...');

const tablesToDrop = [
  'submissions',
  'results',
  'judges',
  'categories',
  'contests',
];

for (const table of tablesToDrop) {
  try {
    const dropCommand = `bunx wrangler d1 execute see-in-the-sea-db --remote --command="DROP TABLE IF EXISTS ${table};"`;
    console.log(`   Dropping table: ${table}`);
    execSync(dropCommand, { stdio: 'pipe' });
    console.log(`   ✅ Dropped: ${table}`);
  } catch (error) {
    console.log(`   ⚠️  Table ${table} doesn't exist or already dropped`);
    console.log(error);
  }
}

// Step 2: Note about R2 cleanup
console.log('\n📤 STEP 2: R2 Media cleanup...');
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

// Step 3: Verify cleanup
console.log('\n🔍 STEP 3: Verifying cleanup...');

try {
  const verifyTablesCommand = `bunx wrangler d1 execute see-in-the-sea-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"`;
  const tableOutput = execSync(verifyTablesCommand, { encoding: 'utf8' });
  console.log('   Remaining tables in D1:');
  console.log(tableOutput);
} catch (error) {
  console.log('   ❌ Could not verify D1 tables');
  console.log(error);
}

console.log('\n🎉 Tear down complete!');

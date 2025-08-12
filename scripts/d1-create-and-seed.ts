#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Easy toggle: use --remote flag for remote mode, otherwise local
const isRemote = process.argv.includes('--remote');
const mode = isRemote ? 'remote' : 'local';

console.log(
  `🚀 Setting up D1 database using Drizzle migrations (${mode} mode)...\n`
);

// Step 0: Check and generate migrations if needed
console.log('📋 STEP 0: Checking for existing migrations...');

try {
  const migrationsDir = join(process.cwd(), 'drizzle', 'migrations');
  const migrationFiles = existsSync(migrationsDir)
    ? readdirSync(migrationsDir).filter(file => file.endsWith('.sql'))
    : [];

  if (migrationFiles.length === 0) {
    console.log('   No migration files found. Generating initial schema...');
    execSync('bunx drizzle-kit generate --name initial_schema', {
      stdio: 'pipe',
    });
    console.log('   ✅ Generated initial schema migration');
  } else {
    console.log(`   Found ${migrationFiles.length} existing migration files`);
  }
} catch (error) {
  console.log(
    '   ❌ Failed to check/generate migrations:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Step 1: Apply Drizzle migrations
console.log('\n📊 STEP 1: Applying Drizzle migrations...');

try {
  console.log('   Reading migration files...');
  const migrationsDir = join(process.cwd(), 'drizzle', 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Apply in order

  console.log(`   Found ${migrationFiles.length} migration files`);

  for (const migrationFile of migrationFiles) {
    console.log(`   Applying: ${migrationFile}`);
    const migrationPath = join(migrationsDir, migrationFile);

    const command = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --file="${migrationPath}"`;
    execSync(command, { stdio: 'pipe' });
    console.log(`   ✅ Applied: ${migrationFile}`);
  }

  console.log('   ✅ All migrations applied successfully');
} catch (error) {
  console.log(
    '   ❌ Failed to apply migrations:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Step 2: Generate seed data
console.log('\n🌱 STEP 2: Generating seed data...');

try {
  console.log('   Generating seed.sql from TypeScript definitions...');

  // Import and run the seed generation
  const { generateSeedSQL } = await import('./seeds.ts');
  const { mkdirSync, writeFileSync } = await import('fs');

  // Ensure drizzle directory exists
  mkdirSync('./drizzle', { recursive: true });

  // Generate and write seed SQL
  const seedSQL = generateSeedSQL();
  const seedDataPath = join(process.cwd(), 'drizzle', 'seed.sql');
  writeFileSync(seedDataPath, seedSQL);

  console.log('   ✅ Generated seed.sql successfully');
} catch (error) {
  console.log(
    '   ❌ Failed to generate seed data:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Step 3: Apply seed data in correct order
console.log('\n🌱 STEP 3: Seeding initial data...');

try {
  console.log('   Reading seed data...');
  const seedDataPath = join(process.cwd(), 'drizzle', 'seed.sql');

  // First, seed parent tables (categories and contests)
  console.log('   Seeding categories and contests (parent tables)...');
  const parentSeedCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --file="${seedDataPath}"`;
  execSync(parentSeedCommand, { stdio: 'pipe' });
  console.log('   ✅ Parent tables seeded successfully');

  // Then, seed judges (which reference contests)
  console.log('   Seeding judges (child tables)...');
  const { generateJudgesSeedSQL } = await import('./seeds.ts');
  const { writeFileSync } = await import('fs');

  const judgesSQL = generateJudgesSeedSQL();
  const judgesSeedPath = join(process.cwd(), 'drizzle', 'judges-seed.sql');
  writeFileSync(judgesSeedPath, judgesSQL);

  const judgesSeedCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --file="${judgesSeedPath}"`;
  execSync(judgesSeedCommand, { stdio: 'pipe' });
  console.log('   ✅ Judges seeded successfully');

  // Note: Other child tables (submissions, results) will be seeded separately
  // when running the submission insertion scripts
  console.log(
    '   ℹ️  Other child tables (submissions, results) will be populated'
  );
  console.log('      when running submission insertion scripts');
} catch (error) {
  console.log(
    '   ❌ Failed to seed data:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Step 4: Verify setup
console.log('\n🔍 STEP 4: Verifying database setup...');

try {
  // Check tables
  const tablesCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"`;
  const tablesOutput = execSync(tablesCommand, { encoding: 'utf8' });
  console.log('   📋 Created tables:');
  console.log(tablesOutput);

  // Check categories
  const categoriesCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --command="SELECT id, name FROM categories;"`;
  const categoriesOutput = execSync(categoriesCommand, { encoding: 'utf8' });
  console.log('   📋 Seeded categories:');
  console.log(categoriesOutput);

  // Check contests
  const contestsCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --command="SELECT id, name FROM contests;"`;
  const contestsOutput = execSync(contestsCommand, { encoding: 'utf8' });
  console.log('   📋 Seeded contests:');
  console.log(contestsOutput);

  // Check judges
  const judgesCommand = `bunx wrangler d1 execute see-in-the-sea-db --${mode} --command="SELECT id, contest_id, full_name FROM judges;"`;
  const judgesOutput = execSync(judgesCommand, { encoding: 'utf8' });
  console.log('   📋 Seeded judges:');
  console.log(judgesOutput);
} catch (error) {
  console.log(
    '   ❌ Could not verify database setup:',
    error instanceof Error ? error.message : String(error)
  );
}

console.log('\n🎉 Database setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Run: bun scripts/r2-upload-submissions.ts (to upload images)');
console.log(
  '2. Run: bun scripts/d1-insert-submissions.ts (to insert submission data)'
);

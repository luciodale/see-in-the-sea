#!/usr/bin/env bun
import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';

const isLocal = process.argv.includes('--local');
const target = isLocal ? '--local' : '--remote';
const targetName = isLocal ? 'local' : 'remote';

const migrationsDir = './drizzle/migrations';

if (!existsSync(migrationsDir)) {
  console.log('❌ No migrations directory found. Run "bun run db:generate" first.');
  process.exit(1);
}

// Get all .sql files and sort them
const migrationFiles = readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

if (migrationFiles.length === 0) {
  console.log('❌ No migration files found. Run "bun run db:generate" first.');
  process.exit(1);
}

console.log(`🚀 Applying ${migrationFiles.length} migration(s) to ${targetName} database:`);

for (const file of migrationFiles) {
  const filePath = `${migrationsDir}/${file}`;
  console.log(`  📄 ${file}`);
  
  try {
    execSync(`wrangler d1 execute see-in-the-sea-db ${target} --file=${filePath}`, {
      stdio: 'inherit'
    });
  } catch (error) {
    console.error(`❌ Failed to apply migration: ${file}`);
    process.exit(1);
  }
}

console.log(`✅ All migrations applied to ${targetName} database!`); 
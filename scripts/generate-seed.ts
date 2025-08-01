#!/usr/bin/env bun

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Import and run the seed generation
const { generateSeedSQL } = await import('./seeds.js');

// Ensure drizzle directory exists
mkdirSync('./drizzle', { recursive: true });

// Generate and write seed SQL
const seedSQL = generateSeedSQL();
const seedDataPath = join(process.cwd(), 'drizzle', 'seed.sql');
writeFileSync(seedDataPath, seedSQL);

console.log('✅ Generated seed.sql successfully'); 
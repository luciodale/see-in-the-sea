#!/usr/bin/env bun
import { mkdirSync, writeFileSync } from 'fs';
import { generateSeedSQL } from './seed-db';

// Ensure drizzle directory exists
mkdirSync('./drizzle', { recursive: true });

// Generate and write seed SQL
const seedSQL = generateSeedSQL();
writeFileSync('./drizzle/seed.sql', seedSQL);

console.log('✅ Generated seed.sql from TypeScript definitions');
console.log('📁 Location: ./drizzle/seed.sql');

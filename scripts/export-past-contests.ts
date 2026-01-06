#!/usr/bin/env bun
import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getImageApiUrl } from '../src/server/imageService';

const isRemote = process.argv.includes('--remote');
const mode = isRemote ? 'remote' : 'local';
const DB_NAME = 'see-in-the-sea-db';

async function runQuery(sql: string) {
  // Use the --command flag to send the SQL directly.
  // We use --json to get a clean, predictable object back.
  const command = `bunx wrangler d1 execute ${DB_NAME} --${mode} --command="${sql.replace(/"/g, '\\"')}" --json`;

  const rawOutput = execSync(command, { encoding: 'utf8' });
  const result = JSON.parse(rawOutput);

  // Wrangler returns an array of result objects (one for each statement)
  return result[0]?.results || [];
}

async function main() {
  console.log(`📊 Exporting contests from D1 (${mode})...`);

  // ONE QUERY to get everything: Inactive contests + their first-place image IDs
  // This replaces the N+1 query problem in your original script
  const megaQuery = `
    SELECT 
      c.id, c.name, c.description, c.year,
      (
        SELECT s.r2_image_id 
        FROM results r 
        JOIN submissions s ON r.submission_id = s.id 
        WHERE s.contest_id = c.id AND r.result = 'first' 
        LIMIT 1
      ) as winning_image_id
    FROM contests c
    WHERE c.status = 'inactive'
    ORDER BY c.year DESC
  `;

  try {
    const rows = await runQuery(megaQuery);

    const data = rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      year: row.year,
      winningImage: getImageApiUrl(row.winning_image_id) || undefined,
    }));

    // Save output
    const dataDir = join(process.cwd(), 'src', 'data');
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

    writeFileSync(
      join(dataDir, 'past-contests.json'),
      JSON.stringify(data, null, 2)
    );

    console.log(`✅ Exported ${data.length} contests.`);
  } catch (error) {
    console.error('❌ Export failed:', error);
    process.exit(1);
  }
}

main();

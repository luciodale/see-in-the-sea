#!/usr/bin/env bun
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// --- CONFIGURATION ---
const CONCURRENCY_LIMIT = 5;
const DB_NAME = 'see-in-the-sea-db';
const R2_BUCKET = 'see-in-the-sea-images';

// --- ARGS ---
const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter(a => a.startsWith('--')));
const positional = rawArgs.filter(a => !a.startsWith('--'));

const mode: 'local' | 'remote' = flags.has('--local') ? 'local' : 'remote';
const shouldOverride = flags.has('--override');

const yearArg = positional[0];
if (!yearArg || !/^\d{4}$/.test(yearArg)) {
  console.error(
    'Usage: bun scripts/download-contest-images.ts <year> [--local] [--override]'
  );
  console.error('Example: bun scripts/download-contest-images.ts 2024');
  process.exit(1);
}
const contestYear = Number.parseInt(yearArg, 10);

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, `see-in-the-sea-${contestYear}`);

// --- TYPES ---
type RawSubmissionRow = {
  submission_id: string;
  contest_id: string;
  category_id: string;
  user_email: string;
  r2_image_id: string | null;
  original_filename: string | null;
  result_placement: string | null;
  first_name: string | null;
  last_name: string | null;
};

type DownloadItem = {
  r2ImageId: string;
  categoryId: string;
  firstName: string | null;
  lastName: string | null;
  placement: string | null;
  originalFilename: string | null;
};

// --- HELPERS ---
function robustExec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, { shell: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      stdout += d;
    });
    proc.stderr.on('data', d => {
      stderr += d;
    });
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`Command failed: ${command}\nStderr: ${stderr}`));
    });
  });
}

// --- FILENAME LOGIC (ported from src/react/hooks/useContestDownload.ts) ---
function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function getExtension(originalFilename: string | null): string {
  if (!originalFilename) return '.jpg';
  const ext = originalFilename.split('.').pop()?.toLowerCase();
  return ext && ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif'].includes(ext)
    ? `.${ext}`
    : '.jpg';
}

function buildFilename(params: {
  contestYear: number;
  categoryId: string;
  placement: string | null;
  firstName: string | null;
  lastName: string | null;
  originalFilename: string | null;
}): string {
  const parts = [
    String(params.contestYear),
    sanitizeFilename(params.categoryId),
  ];

  if (params.placement) {
    parts.push(params.placement);
  }

  const nameParts = [params.firstName, params.lastName].filter(
    (n): n is string => !!n
  );
  if (nameParts.length > 0) {
    parts.push(nameParts.map(n => sanitizeFilename(n)).join('_'));
  }

  const ext = getExtension(params.originalFilename);
  return `${parts.join('_')}${ext}`;
}

function deduplicateFilename(
  filename: string,
  seen: Map<string, number>
): string {
  const count = seen.get(filename) ?? 0;
  seen.set(filename, count + 1);
  if (count === 0) return filename;
  const dot = filename.lastIndexOf('.');
  return `${filename.slice(0, dot)}_${count + 1}${filename.slice(dot)}`;
}

// --- MAIN ---
async function main() {
  console.log(`Starting download for contest year ${contestYear} (${mode})...`);
  const start = Date.now();

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  // 1. Query submissions for the contest year
  const sql = `
    SELECT
      s.id as submission_id,
      s.contest_id,
      s.category_id,
      s.user_email,
      s.r2_image_id,
      s.original_filename,
      r.result as result_placement,
      r.first_name,
      r.last_name
    FROM contests c
    INNER JOIN submissions s ON s.contest_id = c.id
    LEFT JOIN results r ON r.submission_id = s.id
    WHERE c.year = ${contestYear}
  `;

  console.log('Querying D1 for submissions...');
  const raw = await robustExec(
    `bunx wrangler d1 execute ${DB_NAME} --${mode} --command="${sql.replace(/"/g, '\\"').replace(/\s+/g, ' ').trim()}" --json`
  );

  const rows = (JSON.parse(raw)[0]?.results || []) as RawSubmissionRow[];
  if (rows.length === 0) {
    console.log(`No submissions found for contest year ${contestYear}.`);
    return;
  }

  const downloadable: DownloadItem[] = rows
    .filter(
      (r): r is RawSubmissionRow & { r2_image_id: string } => !!r.r2_image_id
    )
    .map(r => ({
      r2ImageId: r.r2_image_id.trim(),
      categoryId: r.category_id,
      firstName: r.first_name,
      lastName: r.last_name,
      placement: r.result_placement,
      originalFilename: r.original_filename,
    }));

  if (downloadable.length === 0) {
    console.log(
      'No downloadable images (all submissions missing r2_image_id).'
    );
    return;
  }

  console.log(`Found ${downloadable.length} images to download.`);

  // 2. Pre-compute deduplicated filenames
  const seenFilenames = new Map<string, number>();
  const tasks = downloadable.map(item => {
    const base = buildFilename({
      contestYear,
      categoryId: item.categoryId,
      placement: item.placement,
      firstName: item.firstName,
      lastName: item.lastName,
      originalFilename: item.originalFilename,
    });
    const filename = deduplicateFilename(base, seenFilenames);
    return { item, filename };
  });

  // 3. Download with concurrency
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  const runTask = async ({
    item,
    filename,
  }: {
    item: DownloadItem;
    filename: string;
  }) => {
    const outPath = join(OUT_DIR, filename);

    if (existsSync(outPath) && !shouldOverride) {
      skipped++;
      return;
    }

    try {
      await robustExec(
        `bunx wrangler r2 object get "${R2_BUCKET}/${item.r2ImageId}" --${mode} --file "${outPath}"`
      );
      downloaded++;
      process.stdout.write('.');
    } catch (e) {
      failed++;
      console.error(`\nFailed: ${item.r2ImageId} -> ${filename}`);
      console.error(e instanceof Error ? e.message : String(e));
    }
  };

  for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
    const chunk = tasks.slice(i, i + CONCURRENCY_LIMIT);
    await Promise.all(chunk.map(runTask));
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\nDone.`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Skipped (already present): ${skipped}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Time: ${duration}s`);
  console.log(`  Output: ${OUT_DIR}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});

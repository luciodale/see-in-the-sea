#!/usr/bin/env bun
/**
 * judging-pull.ts
 *
 * Prepares this laptop for an OFFLINE judging session ("Valutazione") for a
 * single contest, so that during a Zoom screen share every photo is served
 * from disk and the shared Cloudflare account takes no load.
 *
 * What it does, for one contest (default `uw-2026`):
 *   1. Reads a snapshot from the PRODUCTION D1 database (--remote, read only)
 *      and writes it into the LOCAL D1 database (--local): the contest row,
 *      all categories, the contest judges, the contest payments, EVERY
 *      submission of the contest and their judging_flags and results (see the
 *      symmetry note below).
 *   2. Downloads the R2 photos of the submissions that will actually be judged
 *      (authors who paid) into
 *      public/judging/, writing a full-size webp and a 1200px webp thumbnail.
 *   3. Writes public/judging/manifest.json as the record of what was pulled.
 *
 * The mirror is ALL WEBP: src/react/utils/imageUtils.ts asks for
 * /judging/<variant>/<key>.webp for both variants, so the full-size file is
 * re-encoded to webp at quality 90 with no resize. It is visually lossless at
 * the 5x zoom used during judging, but it is NOT a byte-identical copy of the
 * original upload.
 *
 * This script only ever READS production. The only writes it performs are to
 * the local D1 database and to public/judging/.
 *
 * public/judging/ holds hundreds of megabytes of photos and MUST NOT be
 * committed, nor be present when the site is built (`astro build` copies
 * public/ into dist/). Add this line to .gitignore:
 *
 *     public/judging/
 *
 * Usage:
 *   bun scripts/judging-pull.ts                       # contest uw-2026
 *   bun scripts/judging-pull.ts uw-2025               # another contest
 *   bun scripts/judging-pull.ts --contest=uw-2025
 *   bun scripts/judging-pull.ts --dry-run             # report only
 *   bun scripts/judging-pull.ts --override            # re-download photos
 */
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import {
  getLocalJudgingPath,
  toLocalJudgingKey,
} from '../src/react/utils/imageUtils';

// --- CONFIGURATION ---
const DEFAULT_CONTEST_ID = 'uw-2026';
const DB_NAME = 'see-in-the-sea-db';
const R2_BUCKET = 'see-in-the-sea-images';
const CONCURRENCY_LIMIT = 5;
const INSERT_CHUNK_SIZE = 50;
const THUMB_LONG_EDGE = 1200;
const THUMB_QUALITY = 80;
const FULL_QUALITY = 90;

const USAGE = `Usage: bun scripts/judging-pull.ts [contestId] [--contest=<id>] [--dry-run] [--override]

  (no flags)        pull contest ${DEFAULT_CONTEST_ID} into the local D1 and public/judging/.
  --contest=<id>    contest to pull. A bare positional argument works too.
  --dry-run         report what would be pulled; touches nothing.
  --override        re-download and re-encode photos already on disk.
`;

// --- ARGS ---
const rawArgs = process.argv.slice(2);
const flags = rawArgs.filter(a => a.startsWith('--'));
const positional = rawArgs.filter(a => !a.startsWith('--'));

if (flags.includes('--help')) {
  console.log(USAGE);
  process.exit(0);
}

const isDryRun = flags.includes('--dry-run');
const shouldOverride = flags.includes('--override');

const contestFlag = flags.find(a => a.startsWith('--contest='));
const contestId =
  contestFlag?.slice('--contest='.length) ??
  positional[0] ??
  DEFAULT_CONTEST_ID;

if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(contestId)) {
  console.error(`Refusing to run: unsafe contest id "${contestId}".`);
  console.error(USAGE);
  process.exit(1);
}

// --- PATHS ---
const ROOT = process.cwd();
const OUT_DIR = join(ROOT, 'public', 'judging');
const FULL_DIR = join(OUT_DIR, 'full');
const THUMB_DIR = join(OUT_DIR, 'thumb');
const TEMP_DIR = join(OUT_DIR, '.tmp');
const MANIFEST_FILE = join(OUT_DIR, 'manifest.json');
const SQL_FILE = join(TEMP_DIR, `judging-pull-${contestId}.sql`);

// --- TYPES ---

/**
 * One production row, already rendered by SQLite as a VALUES tuple.
 *
 * The tuple is built with SQLite's `quote()` rather than in TypeScript:
 * `wrangler d1 execute --json` reports SQL NULL as the *string* "null", so
 * reading columns individually cannot tell a real NULL from the text "null"
 * and every nullable column (description, portfolio, placement...) would be
 * mirrored as the literal text 'null'. Letting SQLite emit the literal keeps
 * NULLs, quotes and numbers exact. Same approach as scripts/judging-push.ts.
 */
type TupleRow = {
  tuple: string;
};

/** The contest row, plus the two fields the summary prints. */
type ContestTupleRow = TupleRow & {
  name: string;
  year: number;
};

/**
 * A submission row, plus the fields the script itself needs: its photo key,
 * its author and whether that author paid. `r2_image_id` is COALESCEd to ''
 * in the SELECT so a real NULL never arrives as the string "null".
 */
type SubmissionTupleRow = TupleRow & {
  user_email: string;
  r2_image_id: string;
  is_paid: number;
};

type Snapshot = {
  contest: ContestTupleRow | null;
  categories: TupleRow[];
  judges: TupleRow[];
  payments: TupleRow[];
  submissions: SubmissionTupleRow[];
  judgingFlags: TupleRow[];
  results: TupleRow[];
};

type LocalCountsRow = {
  contests: number;
  categories: number;
  judges: number;
  payments: number;
  submissions: number;
  judging_flags: number;
  results: number;
};

type PhotoTask = {
  r2ImageId: string;
  /** `uw-2026/wide-angle/abc` -> `uw-2026_wide-angle_abc`. */
  key: string;
};

type PhotoOutcome = 'downloaded' | 'skipped' | 'failed';

type ManifestEntry = { full: string; thumb: string };

// Column order used both for SELECT and for INSERT, so the two always agree.
const COLUMNS = {
  contests: [
    'id',
    'name',
    'description',
    'year',
    'status',
    'max_submissions_per_category',
    'created_at',
    'updated_at',
  ],
  categories: ['id', 'name', 'description', 'created_at'],
  judges: ['id', 'contest_id', 'full_name', 'r2_image_id', 'created_at'],
  payments: [
    'id',
    'contest_id',
    'user_email',
    'amount',
    'currency',
    'stripe_session_id',
    'paid_at',
  ],
  submissions: [
    'id',
    'contest_id',
    'category_id',
    'user_email',
    'title',
    'description',
    'r2_image_id',
    'original_filename',
    'file_size',
    'content_type',
    'portfolio',
    'portfolio_photo_type',
    'uploaded_at',
  ],
  judging_flags: [
    'id',
    'submission_id',
    'status',
    'rating',
    'placement',
    'updated_at',
  ],
  results: [
    'id',
    'submission_id',
    'result',
    'first_name',
    'last_name',
    'created_at',
  ],
} as const;

// --- HELPERS ---

/**
 * Runs the wrangler CLI without a shell, so SQL and paths never need quoting.
 */
function runWrangler(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn('bunx', ['wrangler', ...args]);
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => {
      stdout += d;
    });
    proc.stderr.on('data', d => {
      stderr += d;
    });
    proc.on('error', reject);
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else
        reject(
          new Error(`wrangler ${args.join(' ')} failed\nStderr: ${stderr}`)
        );
    });
  });
}

/**
 * wrangler can print warnings before the JSON payload, so start at the first
 * line that actually opens the array. Same parser as scripts/judging-push.ts.
 */
function parseD1Rows<TRow>(raw: string): TRow[] {
  const lines = raw.split('\n');
  const startLine = lines.findIndex(line => line.trimStart().startsWith('['));
  if (startLine === -1) {
    throw new Error(`Could not find JSON in wrangler output:\n${raw}`);
  }

  const payload: unknown = JSON.parse(lines.slice(startLine).join('\n'));
  if (!Array.isArray(payload)) {
    throw new Error(`Unexpected wrangler JSON shape:\n${raw}`);
  }

  const first = payload[0] as { results?: TRow[] } | undefined;
  return first?.results ?? [];
}

function collapse(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim();
}

async function queryRemote<TRow>(label: string, sql: string): Promise<TRow[]> {
  process.stdout.write(`  querying ${label}... `);
  const raw = await runWrangler([
    'd1',
    'execute',
    DB_NAME,
    '--remote',
    '--json',
    '--command',
    collapse(sql),
  ]);
  const rows = parseD1Rows<TRow>(raw);
  console.log(`${rows.length} row(s)`);
  return rows;
}

async function queryLocal<TRow>(sql: string): Promise<TRow[]> {
  const raw = await runWrangler([
    'd1',
    'execute',
    DB_NAME,
    '--local',
    '--json',
    '--command',
    collapse(sql),
  ]);
  return parseD1Rows<TRow>(raw);
}

function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** SQLite expression that renders a row as a ready-to-insert VALUES tuple. */
function tupleExpression(alias: string, columns: readonly string[]): string {
  const parts = columns
    .map(column => `quote(${alias}.${column})`)
    .join(" || ', ' || ");
  return `'(' || ${parts} || ')'`;
}

function assertUsableTuple(row: TupleRow, table: string): void {
  if (
    typeof row.tuple !== 'string' ||
    !row.tuple.startsWith('(') ||
    !row.tuple.endsWith(')')
  ) {
    throw new Error(
      `A production ${table} row did not render a usable VALUES tuple - refusing to write the local database.`
    );
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

/**
 * Builds chunked multi-row INSERTs from the tuples SQLite already rendered,
 * so no single statement exceeds D1 limits.
 */
function buildInserts(
  table: string,
  columns: readonly string[],
  rows: TupleRow[],
  conflict: 'REPLACE' | 'IGNORE'
): string[] {
  if (rows.length === 0) return [];
  for (const row of rows) assertUsableTuple(row, table);

  const columnList = columns.map(c => `"${c}"`).join(', ');
  return chunk(rows, INSERT_CHUNK_SIZE).map(group => {
    const values = group.map(row => `  ${row.tuple}`).join(',\n');
    return `INSERT OR ${conflict} INTO ${table} (${columnList}) VALUES\n${values};`;
  });
}

/** Simple worker pool: keeps CONCURRENCY_LIMIT downloads in flight. */
async function runPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        out[index] = await worker(items[index], index);
      }
    })()
  );
  await Promise.all(runners);
  return out;
}

function directoryBytes(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((total, name) => {
    const stats = statSync(join(dir, name));
    return stats.isFile() ? total + stats.size : total;
  }, 0);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

// --- STEP 1: PRODUCTION SNAPSHOT (READ ONLY) ---

/** Authors who paid for this contest; the only submissions that get judged. */
const PAID_AUTHORS = `SELECT user_email FROM payments WHERE contest_id = ${sqlText(contestId)}`;
const CONTEST_SUBMISSION_IDS = `SELECT id FROM submissions WHERE contest_id = ${sqlText(contestId)}`;

/**
 * Reads production, never writes it. Every table comes back as SQLite-rendered
 * VALUES tuples (see TupleRow) so NULLs survive the JSON round trip.
 *
 * Scope: the whole contest. judging_flags and results are foreign keys onto
 * submissions and scripts/judging-push.ts clears them for the whole contest,
 * so the mirror must hold every submission, not only the paid ones. The paid
 * filter decides which PHOTOS are downloaded, nothing else.
 */
async function pullSnapshot(): Promise<Snapshot> {
  console.log(`\nReading production D1 snapshot for "${contestId}"...`);

  const contests = await queryRemote<ContestTupleRow>(
    'contest',
    `SELECT ${tupleExpression('c', COLUMNS.contests)} AS tuple, c.name AS name, c.year AS year
     FROM contests c WHERE c.id = ${sqlText(contestId)}`
  );
  const categories = await queryRemote<TupleRow>(
    'categories',
    `SELECT ${tupleExpression('c', COLUMNS.categories)} AS tuple FROM categories c`
  );
  const judges = await queryRemote<TupleRow>(
    'judges',
    `SELECT ${tupleExpression('j', COLUMNS.judges)} AS tuple
     FROM judges j WHERE j.contest_id = ${sqlText(contestId)}`
  );
  const payments = await queryRemote<TupleRow>(
    'payments',
    `SELECT ${tupleExpression('p', COLUMNS.payments)} AS tuple
     FROM payments p WHERE p.contest_id = ${sqlText(contestId)}`
  );
  const submissions = await queryRemote<SubmissionTupleRow>(
    'submissions (whole contest)',
    `SELECT ${tupleExpression('s', COLUMNS.submissions)} AS tuple,
            s.user_email AS user_email,
            COALESCE(s.r2_image_id, '') AS r2_image_id,
            CASE WHEN s.user_email IN (${PAID_AUTHORS}) THEN 1 ELSE 0 END AS is_paid
     FROM submissions s WHERE s.contest_id = ${sqlText(contestId)}`
  );
  const judgingFlags = await queryRemote<TupleRow>(
    'judging_flags',
    `SELECT ${tupleExpression('f', COLUMNS.judging_flags)} AS tuple
     FROM judging_flags f WHERE f.submission_id IN (${CONTEST_SUBMISSION_IDS})`
  );
  const results = await queryRemote<TupleRow>(
    'results',
    `SELECT ${tupleExpression('r', COLUMNS.results)} AS tuple
     FROM results r WHERE r.submission_id IN (${CONTEST_SUBMISSION_IDS})`
  );

  const contest = contests[0] ?? null;
  if (contest) assertUsableTuple(contest, 'contests');
  for (const row of categories) assertUsableTuple(row, 'categories');
  for (const row of judges) assertUsableTuple(row, 'judges');
  for (const row of payments) assertUsableTuple(row, 'payments');
  for (const row of submissions) assertUsableTuple(row, 'submissions');
  for (const row of judgingFlags) assertUsableTuple(row, 'judging_flags');
  for (const row of results) assertUsableTuple(row, 'results');

  return {
    contest,
    categories,
    judges,
    payments,
    submissions,
    judgingFlags,
    results,
  };
}

// --- STEP 2: APPLY TO LOCAL D1 ---

function buildSnapshotSql(snapshot: Snapshot): string {
  const id = sqlText(contestId);
  const statements: string[] = [
    `-- Generated by scripts/judging-pull.ts for contest ${contestId}`,
    '-- Scope: this contest only. Categories are never deleted.',
    '-- Every VALUES tuple was rendered by SQLite quote() on the production',
    '-- side, so NULLs, quotes and numbers survive the round trip exactly.',
    '',
    `DELETE FROM judging_flags WHERE submission_id IN (${CONTEST_SUBMISSION_IDS});`,
    `DELETE FROM results WHERE submission_id IN (${CONTEST_SUBMISSION_IDS});`,
    `DELETE FROM submissions WHERE contest_id = ${id};`,
    `DELETE FROM judges WHERE contest_id = ${id};`,
    `DELETE FROM payments WHERE contest_id = ${id};`,
    `DELETE FROM contests WHERE id = ${id};`,
    '',
  ];

  // Category ids are global and stable, so production always wins over a
  // local mock row that kept the id but drifted on the name.
  statements.push(
    ...buildInserts(
      'categories',
      COLUMNS.categories,
      snapshot.categories,
      'REPLACE'
    )
  );
  if (snapshot.contest) {
    statements.push(
      ...buildInserts(
        'contests',
        COLUMNS.contests,
        [snapshot.contest],
        'REPLACE'
      )
    );
  }
  statements.push(
    ...buildInserts('payments', COLUMNS.payments, snapshot.payments, 'REPLACE'),
    ...buildInserts('judges', COLUMNS.judges, snapshot.judges, 'REPLACE'),
    ...buildInserts(
      'submissions',
      COLUMNS.submissions,
      snapshot.submissions,
      'REPLACE'
    ),
    ...buildInserts(
      'judging_flags',
      COLUMNS.judging_flags,
      snapshot.judgingFlags,
      'REPLACE'
    ),
    ...buildInserts('results', COLUMNS.results, snapshot.results, 'REPLACE')
  );

  return `${statements.join('\n')}\n`;
}

async function applySnapshotLocally(snapshot: Snapshot): Promise<void> {
  console.log('\nApplying snapshot to the LOCAL D1 database...');
  const sql = buildSnapshotSql(snapshot);
  writeFileSync(SQL_FILE, sql);

  try {
    await runWrangler([
      'd1',
      'execute',
      DB_NAME,
      '--local',
      '--yes',
      '--file',
      SQL_FILE,
    ]);
    rmSync(SQL_FILE, { force: true });
    console.log('  local database updated.');
  } catch (error) {
    console.error(`  failed. SQL kept for inspection at: ${SQL_FILE}`);
    throw error;
  }
}

async function readLocalCounts(): Promise<LocalCountsRow | null> {
  const id = sqlText(contestId);
  const rows = await queryLocal<LocalCountsRow>(
    `SELECT
       (SELECT COUNT(*) FROM contests WHERE id = ${id}) AS contests,
       (SELECT COUNT(*) FROM categories) AS categories,
       (SELECT COUNT(*) FROM judges WHERE contest_id = ${id}) AS judges,
       (SELECT COUNT(*) FROM payments WHERE contest_id = ${id}) AS payments,
       (SELECT COUNT(*) FROM submissions WHERE contest_id = ${id}) AS submissions,
       (SELECT COUNT(*) FROM judging_flags WHERE submission_id IN
         (${CONTEST_SUBMISSION_IDS})) AS judging_flags,
       (SELECT COUNT(*) FROM results WHERE submission_id IN
         (${CONTEST_SUBMISSION_IDS})) AS results`
  );
  return rows[0] ?? null;
}

// --- STEP 3: R2 PHOTOS ---

// Judge photos are deliberately NOT mirrored: nothing reads a local copy of
// them, so they stay on the CDN. Judges are still part of the D1 snapshot.
function buildPhotoTasks(snapshot: Snapshot): PhotoTask[] {
  const tasks = new Map<string, PhotoTask>();

  for (const submission of snapshot.submissions) {
    if (Number(submission.is_paid) !== 1) continue;
    const r2ImageId = submission.r2_image_id.trim();
    if (!r2ImageId) continue;
    tasks.set(r2ImageId, { r2ImageId, key: toLocalJudgingKey(r2ImageId) });
  }

  return Array.from(tasks.values());
}

/**
 * Full size, webp quality 90, NOT resized: the judges zoom to 5x on this file.
 * `.rotate()` bakes in the EXIF orientation, which the webp output would
 * otherwise drop along with the rest of the metadata.
 */
async function writeFullSize(source: string, dest: string): Promise<void> {
  await sharp(source).rotate().webp({ quality: FULL_QUALITY }).toFile(dest);
}

async function writeThumbnail(source: string, dest: string): Promise<void> {
  await sharp(source)
    .rotate()
    .resize(THUMB_LONG_EDGE, THUMB_LONG_EDGE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: THUMB_QUALITY })
    .toFile(dest);
}

/** Encode beside the target, then rename, so a half-written file never sticks. */
async function encodeInto(
  encode: (source: string, dest: string) => Promise<void>,
  source: string,
  dest: string,
  stagingPath: string
): Promise<void> {
  rmSync(stagingPath, { force: true });
  await encode(source, stagingPath);
  rmSync(dest, { force: true });
  renameSync(stagingPath, dest);
}

async function processPhoto(
  task: PhotoTask,
  index: number,
  total: number,
  manifest: Map<string, ManifestEntry>
): Promise<PhotoOutcome> {
  const fullPath = join(FULL_DIR, `${task.key}.webp`);
  const thumbPath = join(THUMB_DIR, `${task.key}.webp`);
  const tempPath = join(TEMP_DIR, `${task.key}.download`);
  const label = `[${index + 1}/${total}] ${task.r2ImageId}`;

  function record() {
    manifest.set(task.r2ImageId, {
      full: getLocalJudgingPath(task.r2ImageId, 'full'),
      thumb: getLocalJudgingPath(task.r2ImageId, 'thumb'),
    });
  }

  try {
    if (existsSync(fullPath) && !shouldOverride) {
      if (!existsSync(thumbPath)) {
        await encodeInto(
          writeThumbnail,
          fullPath,
          thumbPath,
          `${tempPath}.thumb`
        );
      }
      record();
      console.log(`${label} skipped (already on disk)`);
      return 'skipped';
    }

    await runWrangler([
      'r2',
      'object',
      'get',
      `${R2_BUCKET}/${task.r2ImageId}`,
      '--remote',
      '--file',
      tempPath,
    ]);

    await encodeInto(writeFullSize, tempPath, fullPath, `${tempPath}.full`);
    await encodeInto(writeThumbnail, tempPath, thumbPath, `${tempPath}.thumb`);
    record();
    console.log(`${label} downloaded`);
    return 'downloaded';
  } catch (error) {
    console.error(`${label} FAILED`);
    console.error(
      `  ${error instanceof Error ? error.message : String(error)}`
    );
    return 'failed';
  } finally {
    rmSync(tempPath, { force: true });
  }
}

// --- MAIN ---

async function main() {
  const start = Date.now();
  console.log(
    `Judging pull for contest "${contestId}"${isDryRun ? ' (dry run)' : ''}`
  );

  const snapshot = await pullSnapshot();

  if (!snapshot.contest) {
    console.error(
      `\nNo contest "${contestId}" found in production. Nothing to pull.`
    );
    process.exit(1);
  }

  const photoTasks = buildPhotoTasks(snapshot);
  const unpaidSubmissions = snapshot.submissions.filter(
    s => Number(s.is_paid) !== 1
  ).length;
  const missingPhotos = snapshot.submissions.filter(
    s => Number(s.is_paid) === 1 && !s.r2_image_id.trim()
  ).length;

  console.log('\nSnapshot from production:');
  console.log(
    `  contest:       ${snapshot.contest.name} (${snapshot.contest.year})`
  );
  console.log(`  categories:    ${snapshot.categories.length}`);
  console.log(`  judges:        ${snapshot.judges.length}`);
  console.log(`  payments:      ${snapshot.payments.length}`);
  console.log(
    `  submissions:   ${snapshot.submissions.length} (${unpaidSubmissions} by authors who have not paid)`
  );
  console.log(`  judging_flags: ${snapshot.judgingFlags.length}`);
  console.log(`  results:       ${snapshot.results.length}`);
  console.log(`  photos to fetch: ${photoTasks.length}`);
  if (missingPhotos > 0) {
    console.log(`  submissions to judge without an image: ${missingPhotos}`);
  }

  if (isDryRun) {
    console.log(
      '\nDry run: local database untouched, no photos downloaded, no manifest written.'
    );
    return;
  }

  for (const dir of [OUT_DIR, FULL_DIR, THUMB_DIR, TEMP_DIR]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  await applySnapshotLocally(snapshot);

  const localCounts = await readLocalCounts();
  if (localCounts) {
    console.log('\nPresent in the LOCAL database now:');
    console.log(`  contests:      ${localCounts.contests}`);
    console.log(`  categories:    ${localCounts.categories}`);
    console.log(`  judges:        ${localCounts.judges}`);
    console.log(`  payments:      ${localCounts.payments}`);
    console.log(`  submissions:   ${localCounts.submissions}`);
    console.log(`  judging_flags: ${localCounts.judging_flags}`);
    console.log(`  results:       ${localCounts.results}`);
  }

  console.log(`\nDownloading ${photoTasks.length} photo(s) from R2...`);
  const manifest = new Map<string, ManifestEntry>();
  const outcomes = await runPool(photoTasks, CONCURRENCY_LIMIT, (task, index) =>
    processPhoto(task, index, photoTasks.length, manifest)
  );

  const downloaded = outcomes.filter(o => o === 'downloaded').length;
  const skipped = outcomes.filter(o => o === 'skipped').length;
  const failed = outcomes.filter(o => o === 'failed').length;

  const images: Record<string, ManifestEntry> = {};
  for (const [r2ImageId, entry] of Array.from(manifest.entries()).sort(
    ([a], [b]) => a.localeCompare(b)
  )) {
    images[r2ImageId] = entry;
  }

  writeFileSync(
    MANIFEST_FILE,
    `${JSON.stringify(
      {
        contestId,
        generatedAt: new Date().toISOString(),
        counts: {
          submissions: snapshot.submissions.length,
          judges: snapshot.judges.length,
          photos: Object.keys(images).length,
          downloaded,
          skipped,
          failed,
        },
        images,
      },
      null,
      2
    )}\n`
  );

  rmSync(TEMP_DIR, { recursive: true, force: true });

  const bytes = directoryBytes(FULL_DIR) + directoryBytes(THUMB_DIR);
  const duration = ((Date.now() - start) / 1000).toFixed(1);

  console.log('\nDone.');
  console.log(`  submissions pulled: ${snapshot.submissions.length}`);
  console.log(
    '  paid-author filter: applied - only photos of authors who paid were mirrored.'
  );
  console.log(`  photos downloaded:  ${downloaded}`);
  console.log(`  photos skipped:     ${skipped}`);
  console.log(`  photos failed:      ${failed}`);
  console.log(`  bytes on disk:      ${formatBytes(bytes)}`);
  console.log(`  manifest:           ${MANIFEST_FILE}`);
  console.log(`  time:               ${duration}s`);

  console.log(
    '\n!!! WARNING: public/judging/ now holds the photo mirror, and `astro build`'
  );
  console.log(
    '!!! copies everything under public/ into dist/. Delete it BEFORE any build'
  );
  console.log('!!! or deploy:');
  console.log('!!!');
  console.log('!!!     rm -rf public/judging');

  if (failed > 0) process.exit(1);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});

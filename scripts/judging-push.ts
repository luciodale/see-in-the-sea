#!/usr/bin/env bun
/**
 * Push the offline judging outcome for ONE contest from the local D1 back to
 * production D1.
 *
 * Only `judging_flags` and `results` rows that belong to that contest are
 * touched: every generated statement is scoped to the contest, either by the
 * `submission_id IN (SELECT id FROM submissions WHERE contest_id = ...)`
 * subquery (deletes) or by a join onto `submissions` (inserts). There is never
 * a bare DELETE.
 *
 * Defaults to a dry run. Writing production needs `--apply` plus a typed
 * confirmation of the contest id on a TTY.
 *
 *   bun scripts/judging-push.ts                       # dry run, uw-2026
 *   bun scripts/judging-push.ts --contest=uw-2025     # dry run, other contest
 *   bun scripts/judging-push.ts --check-remote        # read-only remote checks
 *   bun scripts/judging-push.ts --apply               # writes production
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

// --- CONFIGURATION ---
const DB_NAME = 'see-in-the-sea-db';
const DEFAULT_CONTEST_ID = 'uw-2026';
const INSERT_CHUNK_SIZE = 50;
const PREVIEW_STATEMENT_COUNT = 4;
const PREVIEW_STATEMENT_CHARS = 400;
const PREVIEW_ID_COUNT = 10;
const OUT_DIR_NAME = '.judging-push';

// Column order is shared by the read query and the generated INSERT, so the
// two can never drift apart. `submission_id` must stay at index 1: the INSERT
// joins on it to keep every row inside the contest.
const FLAG_COLUMNS = [
  'id',
  'submission_id',
  'status',
  'rating',
  'placement',
  'updated_at',
] as const;

const RESULT_COLUMNS = [
  'id',
  'submission_id',
  'result',
  'first_name',
  'last_name',
  'created_at',
] as const;

const SUBMISSION_COLUMN_INDEX = 1;

const USAGE = `Usage: bun scripts/judging-push.ts [--contest=<id>] [--check-remote] [--apply]
                                   [--allow-empty-judging-flags] [--allow-empty-results]

  (no flags)       dry run: read local D1, write the SQL file, print the plan.
                   Never touches production.
  --contest=<id>   contest to push (default: ${DEFAULT_CONTEST_ID}). A bare
                   positional argument works too.
  --check-remote   also run the read-only production checks (row counts, stale
                   snapshot and scope-symmetry detection). Does not write.
  --apply          write production. Requires a TTY and a typed confirmation
                   of the contest id.

  A table the local snapshot has NO rows for is never deleted in production:
  its DELETE is simply not generated, so a push taken before the owner pressed
  "Invia" cannot silently clear production. To clear a table on purpose:

  --allow-empty-judging-flags
                   emit DELETE FROM judging_flags even with 0 local flags, and
                   push nothing back. Also lifts the "0 local flags" refusal.
  --allow-empty-results
                   emit DELETE FROM results even with 0 local results, and
                   push nothing back.`;

// --- TYPES ---

/**
 * Per-table permission to emit a DELETE although the local snapshot has no
 * rows for that table. Default is `false` everywhere: silence beats a wipe.
 */
export type EmptyTableAllowance = {
  judgingFlags: boolean;
  results: boolean;
};

type Args = {
  contestId: string;
  apply: boolean;
  checkRemote: boolean;
  allowEmpty: EmptyTableAllowance;
};

/**
 * One local row, already rendered by SQLite as a VALUES tuple.
 *
 * The tuple is built with SQLite's `quote()` rather than in TypeScript:
 * `wrangler d1 execute --json` reports SQL NULL as the *string* "null", so
 * reading columns individually cannot tell a real NULL from the text "null".
 * Letting SQLite emit the literal keeps NULLs, quotes and numbers exact.
 */
export type PushRow = {
  id: string;
  submission_id: string;
  tuple: string;
};

type SubmissionIdRow = {
  id: string;
};

type RemoteSubmissionRow = {
  id: string;
  flag_count: number;
  result_count: number;
  payment_count: number;
};

type RemoteSubmission = {
  id: string;
  flagCount: number;
  resultCount: number;
  paymentCount: number;
};

type CountsRow = {
  judging_flags: number;
  results: number;
  submissions: number;
};

type Counts = {
  judgingFlags: number;
  results: number;
  submissions: number;
};

type ScopeAuditRow = {
  submissions: number;
  payments: number;
  submissions_without_payment: number;
  flagged_submissions_without_payment: number;
};

/**
 * How wide the LOCAL snapshot actually is for this contest, used to catch a
 * snapshot that is narrower than the contest-wide DELETE. See the comment on
 * `buildStatements`.
 */
type ScopeAudit = {
  submissions: number;
  payments: number;
  submissionsWithoutPayment: number;
  flaggedSubmissionsWithoutPayment: number;
};

type D1Mode = 'local' | 'remote';

// --- ARGS ---
function parseArgs(argv: string[]): Args {
  let contestId = DEFAULT_CONTEST_ID;
  let apply = false;
  let checkRemote = false;
  let dryRunRequested = false;
  let contestFromPositional = false;
  let allowEmptyJudgingFlags = false;
  let allowEmptyResults = false;

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      console.log(USAGE);
      process.exit(0);
    }

    if (!arg.startsWith('--')) {
      if (arg.startsWith('-')) {
        throw new Error(`Unknown flag: ${arg}\n\n${USAGE}`);
      }
      if (contestFromPositional) {
        throw new Error(`Unexpected extra argument: ${arg}\n\n${USAGE}`);
      }
      contestId = arg;
      contestFromPositional = true;
      continue;
    }

    const eq = arg.indexOf('=');
    const key = eq === -1 ? arg : arg.slice(0, eq);
    const value = eq === -1 ? null : arg.slice(eq + 1);

    switch (key) {
      case '--contest':
        if (!value) throw new Error(`--contest needs a value\n\n${USAGE}`);
        contestId = value;
        break;
      case '--apply':
        apply = true;
        break;
      case '--check-remote':
        checkRemote = true;
        break;
      case '--dry-run':
        dryRunRequested = true;
        break;
      case '--allow-empty-judging-flags':
        allowEmptyJudgingFlags = true;
        break;
      case '--allow-empty-results':
        allowEmptyResults = true;
        break;
      default:
        throw new Error(`Unknown flag: ${key}\n\n${USAGE}`);
    }
  }

  if (apply && dryRunRequested) {
    throw new Error('--apply and --dry-run are mutually exclusive.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(contestId)) {
    throw new Error(
      `Refusing to run: contest id "${contestId}" is not a plain slug ` +
        '(letters, digits, "-" and "_" only).'
    );
  }

  return {
    contestId,
    apply,
    checkRemote: checkRemote || apply,
    allowEmpty: {
      judgingFlags: allowEmptyJudgingFlags,
      results: allowEmptyResults,
    },
  };
}

// --- PROCESS HELPERS ---
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

function inheritExec(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, { shell: true, stdio: 'inherit' });
    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed (exit ${code}): ${command}`));
    });
  });
}

/**
 * wrangler can print warnings before the JSON payload, so start at the first
 * line that actually opens the array.
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

function d1Query<TRow>(mode: D1Mode, sql: string): Promise<TRow[]> {
  const flat = sql.replace(/\s+/g, ' ').trim().replace(/"/g, '\\"');
  return robustExec(
    `bunx wrangler d1 execute ${DB_NAME} --${mode} --json --command="${flat}"`
  ).then(raw => parseD1Rows<TRow>(raw));
}

async function promptLine(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  // Racing 'close' turns a Ctrl-D (or a closed stdin) into a clean abort
  // instead of a promise that never settles.
  const closed = new Promise<string>((_, reject) => {
    rl.once('close', () =>
      reject(new Error('Input closed before the confirmation was typed.'))
    );
  });
  try {
    const answer = await Promise.race([rl.question(question), closed]);
    return answer.trim();
  } finally {
    rl.close();
    process.stdin.pause();
  }
}

// --- SQL HELPERS ---
function sqlText(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function contestScope(contestId: string): string {
  return `submission_id IN (SELECT id FROM submissions WHERE contest_id = ${sqlText(contestId)})`;
}

/** Submissions of the contest whose author has no payments row for it. */
function unpaidSubmissionPredicate(contestId: string): string {
  return `s.contest_id = ${sqlText(contestId)}
          AND NOT EXISTS (
            SELECT 1 FROM payments p
            WHERE p.contest_id = s.contest_id AND p.user_email = s.user_email
          )`;
}

/** SQLite expression that renders a row as a ready-to-insert VALUES tuple. */
function tupleExpression(alias: string, columns: readonly string[]): string {
  const parts = columns
    .map(column => `quote(${alias}.${column})`)
    .join(" || ', ' || ");
  return `'(' || ${parts} || ')'`;
}

function timestampSlug(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-').replace('Z', '');
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function assertUsableRow(row: PushRow, table: string): void {
  if (typeof row.id !== 'string' || row.id.length === 0) {
    throw new Error(`Local ${table} row has an empty id - refusing to push.`);
  }
  if (typeof row.submission_id !== 'string' || row.submission_id.length === 0) {
    throw new Error(
      `Local ${table} row ${row.id} has an empty submission_id - refusing to push.`
    );
  }
  if (
    typeof row.tuple !== 'string' ||
    !row.tuple.startsWith('(') ||
    !row.tuple.endsWith(')')
  ) {
    throw new Error(
      `Local ${table} row ${row.id} did not render a usable VALUES tuple - refusing to push.`
    );
  }
}

/**
 * A table is only deleted in production when the local snapshot actually has
 * something to put back, or when the owner explicitly allowed the wipe.
 */
export function shouldDeleteTable(
  localRowCount: number,
  allowEmpty: boolean
): boolean {
  return localRowCount > 0 || allowEmpty;
}

// --- SQL GENERATION ---
function buildInsertChunk(
  table: string,
  columns: readonly string[],
  tuples: string[],
  contestId: string
): string {
  const selectList = columns
    .map((_, index) => `v.column${index + 1}`)
    .join(', ');
  const submissionColumn = `v.column${SUBMISSION_COLUMN_INDEX + 1}`;

  return [
    `INSERT INTO ${table} (${columns.join(', ')})`,
    `SELECT ${selectList}`,
    'FROM (VALUES',
    tuples.map(tuple => `  ${tuple}`).join(',\n'),
    ') AS v',
    `JOIN submissions s ON s.id = ${submissionColumn} AND s.contest_id = ${sqlText(contestId)};`,
  ].join('\n');
}

/**
 * SCOPE SYMMETRY - READ THIS BEFORE CHANGING ANY STATEMENT BELOW.
 *
 * The deletes cover EVERY judging_flags / results row of the contest,
 * regardless of whether the submission's author has a payments row. The pull
 * script MUST mirror exactly the same set of rows into the local database:
 * pull and push have to agree on "all judging_flags and results for this
 * contest, payment irrelevant".
 *
 * If the pull is ever narrowed again (e.g. back to paid authors only) while
 * these deletes stay contest-wide, every production row outside the narrower
 * scope is deleted here and never re-inserted. `auditLocalScope()` and the
 * remote scope check warn when the local snapshot looks narrower than the
 * contest; the fix is to widen the pull, never to narrow these deletes.
 *
 * Second rule, same spirit: a table the local snapshot has NO rows for is not
 * deleted at all, unless `--allow-empty-<table>` says otherwise. A push taken
 * before the owner pressed "Invia" holds zero results, and must not be the
 * thing that clears production's results for the contest.
 */
export function buildStatements(
  contestId: string,
  flagRows: PushRow[],
  resultRows: PushRow[],
  allowEmpty: EmptyTableAllowance
): string[] {
  const scope = contestScope(contestId);
  const statements: string[] = [];

  if (shouldDeleteTable(flagRows.length, allowEmpty.judgingFlags)) {
    statements.push(`DELETE FROM judging_flags WHERE ${scope};`);
  }
  if (shouldDeleteTable(resultRows.length, allowEmpty.results)) {
    statements.push(`DELETE FROM results WHERE ${scope};`);
  }

  for (const row of flagRows) assertUsableRow(row, 'judging_flags');
  for (const row of resultRows) assertUsableRow(row, 'results');

  for (const group of chunk(flagRows, INSERT_CHUNK_SIZE)) {
    statements.push(
      buildInsertChunk(
        'judging_flags',
        FLAG_COLUMNS,
        group.map(row => row.tuple),
        contestId
      )
    );
  }

  for (const group of chunk(resultRows, INSERT_CHUNK_SIZE)) {
    statements.push(
      buildInsertChunk(
        'results',
        RESULT_COLUMNS,
        group.map(row => row.tuple),
        contestId
      )
    );
  }

  return statements;
}

export function buildSqlFile(
  contestId: string,
  statements: string[],
  generatedAt: Date,
  notes: readonly string[]
): string {
  const header = [
    `-- Judging push for contest ${contestId}`,
    `-- Generated ${generatedAt.toISOString()} by scripts/judging-push.ts`,
    '-- Source: local D1 (.wrangler/state/v3/d1)',
    '--',
    '-- Every statement is scoped to this contest: the deletes use a',
    '-- submissions subquery, the inserts join submissions on contest_id.',
    '-- Pull and push cover the same rows: ALL judging_flags/results of the',
    '-- contest, regardless of payment.',
    '-- A table with no local rows gets no DELETE unless --allow-empty-<table>.',
    '-- Re-applying this file is safe - it deletes then re-inserts the same rows.',
    ...notes.map(note => `-- NOTE: ${note}`),
    '',
  ].join('\n');

  return `${header}${statements.join('\n\n')}\n`;
}

function buildPushNotes(
  flagCount: number,
  resultCount: number,
  allowEmpty: EmptyTableAllowance
): string[] {
  const notes: string[] = [];

  if (flagCount === 0 && !allowEmpty.judgingFlags) {
    notes.push(
      'judging_flags: 0 local rows, no DELETE emitted - production judging_flags for this contest are left untouched.'
    );
  }
  if (flagCount === 0 && allowEmpty.judgingFlags) {
    notes.push(
      'judging_flags: 0 local rows and --allow-empty-judging-flags was passed - production judging_flags for this contest are DELETED and not replaced.'
    );
  }
  if (resultCount === 0 && !allowEmpty.results) {
    notes.push(
      'results: 0 local rows, no DELETE emitted - production results for this contest are left untouched. Pass --allow-empty-results to clear them on purpose.'
    );
  }
  if (resultCount === 0 && allowEmpty.results) {
    notes.push(
      'results: 0 local rows and --allow-empty-results was passed - production results for this contest are DELETED and not replaced.'
    );
  }

  return notes;
}

// --- QUERIES ---
function readLocalFlags(contestId: string): Promise<PushRow[]> {
  return d1Query<PushRow>(
    'local',
    `SELECT f.id AS id, f.submission_id AS submission_id,
            ${tupleExpression('f', FLAG_COLUMNS)} AS tuple
     FROM judging_flags f
     INNER JOIN submissions s ON s.id = f.submission_id
     WHERE s.contest_id = ${sqlText(contestId)}
     ORDER BY f.id`
  );
}

function readLocalResults(contestId: string): Promise<PushRow[]> {
  return d1Query<PushRow>(
    'local',
    `SELECT r.id AS id, r.submission_id AS submission_id,
            ${tupleExpression('r', RESULT_COLUMNS)} AS tuple
     FROM results r
     INNER JOIN submissions s ON s.id = r.submission_id
     WHERE s.contest_id = ${sqlText(contestId)}
     ORDER BY r.id`
  );
}

function readLocalSubmissionIds(contestId: string): Promise<SubmissionIdRow[]> {
  return d1Query<SubmissionIdRow>(
    'local',
    `SELECT id FROM submissions WHERE contest_id = ${sqlText(contestId)}`
  );
}

/**
 * Local-only narrowness probe: it needs no production call, so a plain dry run
 * still gets a scope warning.
 */
async function auditLocalScope(contestId: string): Promise<ScopeAudit | null> {
  const unpaid = unpaidSubmissionPredicate(contestId);
  const rows = await d1Query<ScopeAuditRow>(
    'local',
    `SELECT
       (SELECT COUNT(*) FROM submissions WHERE contest_id = ${sqlText(contestId)}) AS submissions,
       (SELECT COUNT(*) FROM payments WHERE contest_id = ${sqlText(contestId)}) AS payments,
       (SELECT COUNT(*) FROM submissions s WHERE ${unpaid}) AS submissions_without_payment,
       (SELECT COUNT(*) FROM submissions s
         WHERE ${unpaid}
           AND EXISTS (SELECT 1 FROM judging_flags f WHERE f.submission_id = s.id)
       ) AS flagged_submissions_without_payment`
  );

  const row = rows[0];
  if (!row) return null;
  return {
    submissions: Number(row.submissions),
    payments: Number(row.payments),
    submissionsWithoutPayment: Number(row.submissions_without_payment),
    flaggedSubmissionsWithoutPayment: Number(
      row.flagged_submissions_without_payment
    ),
  };
}

async function readCounts(
  mode: D1Mode,
  contestId: string
): Promise<Counts | null> {
  const scope = contestScope(contestId);
  const rows = await d1Query<CountsRow>(
    mode,
    `SELECT
       (SELECT COUNT(*) FROM judging_flags WHERE ${scope}) AS judging_flags,
       (SELECT COUNT(*) FROM results WHERE ${scope}) AS results,
       (SELECT COUNT(*) FROM submissions WHERE contest_id = ${sqlText(contestId)}) AS submissions`
  );

  const row = rows[0];
  if (!row) return null;
  return {
    judgingFlags: Number(row.judging_flags),
    results: Number(row.results),
    submissions: Number(row.submissions),
  };
}

/**
 * Every production submission of the contest, with the judging rows attached
 * to it. Used both for the stale-snapshot check (local rows pointing at
 * submissions production does not have) and for the scope check (production
 * submissions the local snapshot never mirrored).
 */
async function readRemoteSubmissions(
  contestId: string
): Promise<RemoteSubmission[]> {
  const rows = await d1Query<RemoteSubmissionRow>(
    'remote',
    `SELECT s.id AS id,
            (SELECT COUNT(*) FROM judging_flags f WHERE f.submission_id = s.id) AS flag_count,
            (SELECT COUNT(*) FROM results r WHERE r.submission_id = s.id) AS result_count,
            (SELECT COUNT(*) FROM payments p
              WHERE p.contest_id = s.contest_id AND p.user_email = s.user_email) AS payment_count
     FROM submissions s
     WHERE s.contest_id = ${sqlText(contestId)}`
  );

  return rows.map(row => ({
    id: row.id,
    flagCount: Number(row.flag_count),
    resultCount: Number(row.result_count),
    paymentCount: Number(row.payment_count),
  }));
}

// --- OUTPUT HELPERS ---
function formatDiff(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function formatCounts(label: string, counts: Counts | null): string {
  if (!counts) return `  ${label}: (no rows returned)`;
  return `  ${label}: judging_flags=${counts.judgingFlags} results=${counts.results} submissions=${counts.submissions}`;
}

function describeMode(apply: boolean, checkRemote: boolean): string {
  if (apply) return 'APPLY (writes production)';
  if (checkRemote) return 'DRY RUN + remote checks (read only)';
  return 'DRY RUN (no remote calls)';
}

function printIdSample(ids: string[]): void {
  for (const id of ids.slice(0, PREVIEW_ID_COUNT)) console.log(`    ${id}`);
  if (ids.length > PREVIEW_ID_COUNT) {
    console.log(`    ... and ${ids.length - PREVIEW_ID_COUNT} more`);
  }
}

function printWarnings(warnings: readonly string[]): void {
  for (const warning of warnings) console.warn(`  WARNING: ${warning}`);
}

/**
 * Turns the local audit into scope warnings. A snapshot in which *every*
 * submission has a payments row, while payments exist at all, is the
 * signature of a payment-filtered pull - exactly the case the contest-wide
 * DELETE would punish.
 */
function localScopeWarnings(audit: ScopeAudit): string[] {
  if (audit.submissions === 0 || audit.payments === 0) return [];
  if (audit.submissionsWithoutPayment > 0) return [];

  return [
    `all ${audit.submissions} local submission(s) for this contest have a payments row. ` +
      'If the pull filtered submissions by payment, the contest submissions whose author never paid ' +
      'are missing from this snapshot, yet the contest-wide DELETE removes their production ' +
      'judging_flags/results without putting anything back. Re-pull with a contest-wide pull first.',
  ];
}

function printLocalScope(audit: ScopeAudit): void {
  console.log(
    `  local scope: submissions=${audit.submissions} payments=${audit.payments} ` +
      `without-payment=${audit.submissionsWithoutPayment} ` +
      `(${audit.flaggedSubmissionsWithoutPayment} of those carry judging_flags)`
  );
}

function printRePullReminder(): void {
  console.log('\nRe-pull safety:');
  console.log(
    '  AFTER a successful push it is safe to re-run scripts/judging-pull.ts - it simply mirrors back what you just sent.'
  );
  console.log(
    '  BEFORE pushing, a re-pull DESTROYS the local judging work: the pull deletes the local judging_flags/results'
  );
  console.log(
    '  for this contest and replaces them with production. Push first, pull second.'
  );
}

// --- MAIN ---
async function main() {
  const { contestId, apply, checkRemote, allowEmpty } = parseArgs(
    process.argv.slice(2)
  );
  const start = Date.now();

  console.log(
    `Judging push for contest "${contestId}" - mode: ${describeMode(apply, checkRemote)}`
  );

  // 0. Fail fast, before any production call, if the confirmation can never
  //    be typed.
  if (apply && !process.stdin.isTTY) {
    console.error(
      '\nRefusing to apply: stdin is not a TTY, so the contest id confirmation cannot be typed.'
    );
    console.error('Run this from an interactive terminal.');
    process.exit(1);
  }

  // 1. Read the local judging outcome, contest-scoped.
  //    Sequential on purpose: two concurrent wrangler processes against the
  //    same local D1 file fail with SQLITE_BUSY.
  console.log('Reading local D1...');
  const flagRows = await readLocalFlags(contestId);
  const resultRows = await readLocalResults(contestId);

  if (flagRows.length === 0 && !allowEmpty.judgingFlags) {
    console.error(
      `\nRefusing to push: the local database has 0 judging_flags for "${contestId}".`
    );
    console.error(
      'Nothing to send - this usually means the wrong contest id or the wrong database.'
    );
    console.error(
      'If production really should end up with no judging_flags for this contest, pass --allow-empty-judging-flags.'
    );
    process.exit(1);
  }

  console.log(
    `  local judging_flags: ${flagRows.length}, local results: ${resultRows.length}`
  );

  // 1b. Scope symmetry, local half. Works without touching production, so
  //     even a plain dry run gets the warning.
  const audit = await auditLocalScope(contestId);
  const scopeWarnings: string[] = [];
  if (audit) {
    printLocalScope(audit);
    scopeWarnings.push(...localScopeWarnings(audit));
    printWarnings(scopeWarnings);
  }

  // 2. Generate the SQL and keep it on disk as the owner's record.
  const generatedAt = new Date();
  const statements = buildStatements(
    contestId,
    flagRows,
    resultRows,
    allowEmpty
  );
  const notes = buildPushNotes(flagRows.length, resultRows.length, allowEmpty);
  const outDir = join(process.cwd(), OUT_DIR_NAME);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const sqlPath = join(
    outDir,
    `${contestId}-${timestampSlug(generatedAt)}.sql`
  );
  writeFileSync(
    sqlPath,
    buildSqlFile(contestId, statements, generatedAt, notes)
  );

  console.log(`  SQL file: ${sqlPath}`);
  console.log(`  statements: ${statements.length}`);
  for (const note of notes) console.log(`  NOTE: ${note}`);

  // 3. Remote checks - read only, and never during a plain dry run.
  let before: Counts | null = null;
  if (checkRemote) {
    console.log('\nChecking production (read only)...');
    const remoteSubmissions = await readRemoteSubmissions(contestId);
    const remoteIds = new Set(remoteSubmissions.map(row => row.id));

    const referencedIds = new Set<string>([
      ...flagRows.map(row => row.submission_id),
      ...resultRows.map(row => row.submission_id),
    ]);
    const missing = [...referencedIds].filter(id => !remoteIds.has(id));

    if (missing.length > 0) {
      console.error(
        `\nRefusing to push: ${missing.length} local row(s) reference submissions that do not exist in production for "${contestId}".`
      );
      console.error('The local snapshot is stale. Missing submission ids:');
      for (const id of missing) console.error(`  ${id}`);
      console.error(
        '\nRe-run the pull script to refresh the local snapshot, then judge again.'
      );
      process.exit(1);
    }

    console.log(
      `  all ${referencedIds.size} referenced submission ids exist in production`
    );

    // 3b. Scope symmetry, remote half: production submissions of this contest
    //     that the local snapshot never mirrored. Their judging rows fall
    //     inside the contest-wide DELETE but have no local replacement.
    const localIds = new Set(
      (await readLocalSubmissionIds(contestId)).map(row => row.id)
    );
    const notMirrored = remoteSubmissions.filter(row => !localIds.has(row.id));
    const deletesFlags = shouldDeleteTable(
      flagRows.length,
      allowEmpty.judgingFlags
    );
    const deletesResults = shouldDeleteTable(
      resultRows.length,
      allowEmpty.results
    );
    const atRisk = notMirrored.filter(
      row =>
        (deletesFlags && row.flagCount > 0) ||
        (deletesResults && row.resultCount > 0)
    );

    if (notMirrored.length === 0) {
      console.log(
        `  scope: the local snapshot mirrors all ${remoteIds.size} production submission(s) of the contest`
      );
    } else {
      const unpaid = notMirrored.filter(row => row.paymentCount === 0).length;
      const warning =
        `the local snapshot is NARROWER than the contest: ${notMirrored.length} of ${remoteIds.size} ` +
        `production submission(s) were never mirrored locally (${unpaid} of them have no payments row). ` +
        'Pull and push must cover the same rows.';
      scopeWarnings.push(warning);
      printWarnings([warning]);
      printIdSample(notMirrored.map(row => row.id));

      if (atRisk.length > 0) {
        const lost =
          `${atRisk.length} of those un-mirrored submission(s) DO have production judging_flags/results. ` +
          'This push deletes them and puts nothing back. Widen the pull, re-pull, and judge again before applying.';
        scopeWarnings.push(lost);
        printWarnings([lost]);
        printIdSample(atRisk.map(row => row.id));
      }
    }

    before = await readCounts('remote', contestId);
    console.log(formatCounts('production BEFORE', before));
  }

  // 4. Dry run stops here.
  if (!apply) {
    console.log('\nStatement preview:');
    for (const statement of statements.slice(0, PREVIEW_STATEMENT_COUNT)) {
      const text =
        statement.length > PREVIEW_STATEMENT_CHARS
          ? `${statement.slice(0, PREVIEW_STATEMENT_CHARS)}\n  ... (truncated)`
          : statement;
      console.log(`\n${text}`);
    }
    if (statements.length > PREVIEW_STATEMENT_COUNT) {
      console.log(
        `\n  ... and ${statements.length - PREVIEW_STATEMENT_COUNT} more statement(s) in the file.`
      );
    }

    console.log('\nDry run only - production was not modified.');
    if (scopeWarnings.length > 0) {
      console.log(
        `Resolve the ${scopeWarnings.length} scope warning(s) above before applying.`
      );
    }
    if (!checkRemote) {
      console.log(
        `Next (read only): bun scripts/judging-push.ts --contest=${contestId} --check-remote`
      );
    }
    console.log(
      `To write production: bun scripts/judging-push.ts --contest=${contestId} --apply`
    );
    printRePullReminder();
    return;
  }

  // 5. Apply - typed confirmation, then the write.
  console.log('\nAbout to REPLACE production judging data for this contest:');
  console.log(
    `  judging_flags: ${shouldDeleteTable(flagRows.length, allowEmpty.judgingFlags) ? 'DELETE' : 'left untouched'} + re-INSERT ${flagRows.length} row(s)`
  );
  console.log(
    `  results:       ${shouldDeleteTable(resultRows.length, allowEmpty.results) ? 'DELETE' : 'left untouched'} + re-INSERT ${resultRows.length} row(s)`
  );
  console.log(`  scoped to contest_id = ${contestId}`);
  if (scopeWarnings.length > 0) {
    console.log('');
    printWarnings(scopeWarnings);
  }

  const typed = await promptLine(
    `\nType the contest id "${contestId}" to confirm (anything else aborts): `
  );
  if (typed !== contestId) {
    console.log('Aborted - confirmation did not match. Nothing was changed.');
    process.exit(1);
  }

  console.log('\nApplying to production...');
  await inheritExec(
    `bunx wrangler d1 execute ${DB_NAME} --remote --file="${sqlPath}"`
  );

  const after = await readCounts('remote', contestId);
  console.log('');
  console.log(formatCounts('production BEFORE', before));
  console.log(formatCounts('production AFTER ', after));

  if (before && after) {
    const flagDiff = formatDiff(after.judgingFlags - before.judgingFlags);
    const resultDiff = formatDiff(after.results - before.results);
    console.log(`  diff: judging_flags ${flagDiff}, results ${resultDiff}`);
  }

  // Only meaningful for a table this push actually replaced: a table left
  // untouched keeps whatever production already had.
  if (
    after &&
    shouldDeleteTable(flagRows.length, allowEmpty.judgingFlags) &&
    after.judgingFlags !== flagRows.length
  ) {
    console.warn(
      `  WARNING: production has ${after.judgingFlags} judging_flags but the local snapshot had ${flagRows.length}.`
    );
  }
  if (
    after &&
    shouldDeleteTable(resultRows.length, allowEmpty.results) &&
    after.results !== resultRows.length
  ) {
    console.warn(
      `  WARNING: production has ${after.results} results but the local snapshot had ${resultRows.length}.`
    );
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\nDone in ${duration}s.`);
  console.log(`Record kept at: ${sqlPath}`);
  console.log(
    'If the CLI died mid-run, re-apply by hand with:\n' +
      `  bunx wrangler d1 execute ${DB_NAME} --remote --file="${sqlPath}"`
  );
  printRePullReminder();
}

// Guarded so the pure SQL builders above can be imported and checked without
// running the script. `import.meta.main` is a Bun extension, hence the cast.
type BunImportMeta = ImportMeta & { main?: boolean };

if ((import.meta as BunImportMeta).main !== false) {
  main().catch(e => {
    console.error('FATAL:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
}

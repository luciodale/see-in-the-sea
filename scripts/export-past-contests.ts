#!/usr/bin/env bun
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

// --- CONFIGURATION ---
const CONCURRENCY_LIMIT = 5;
const DB_NAME = 'see-in-the-sea-db';
const R2_BUCKET = 'see-in-the-sea-images';

// --- ARGS & PATHS ---
const args = new Set(process.argv.slice(2));
const mode = args.has('--remote') ? 'remote' : 'local';
const shouldOverride = args.has('--override');

const ROOT = process.cwd();
const TEMP_DIR = join(ROOT, '.temp-images');
const PUBLIC_IMG_DIR = join(ROOT, 'public', 'images', 'contests');
const DATA_DIR = join(ROOT, 'src', 'data');
const OUT_FILE = join(DATA_DIR, 'past-contests.ts');

// --- INTERNAL SCRIPT TYPES ---

// 1. Strict Typed Raw DB Rows
interface RawRow {
  contest_id: string;
  contest_name: string;
  contest_description: string | null;
  contest_year: number;
  category_id: string;
  category_name: string;
  result_id: string;
  result_placement: string;
  first_name: string | null;
  last_name: string | null;
  submission_id: string;
  submission_title: string;
  submission_description: string | null;
  r2_image_id: string | null;
}

interface RawJudgeRow {
  id: string;
  contest_id: string;
  full_name: string;
  r2_image_id: string | null;
}

interface RawContestRow {
  id: string;
  name: string;
  description: string | null;
  year: number;
  status: string;
}

// 2. Output Data Structure (Internal Working Types)
type Placement = 'first' | 'second' | 'third' | 'runner-up';

interface Judge {
  id: string;
  fullName: string;
  r2ImageId: string | null;
}

interface Photographer {
  firstName: string | null;
  lastName: string | null;
}

interface Entry {
  id: string;
  title: string;
  description: string | null;
  placement: Placement;
  photographer: Photographer;
  image: string | null;
  imageR2Id: string | null; // <--- NEW
}

interface Category {
  id: string;
  name: string;
  winnerImage: string | null;
  winnerImageR2Id: string | null; // <--- NEW
  entries: Entry[];
}

interface Contest {
  id: string;
  year: number;
  name: string;
  description: string | null;
  indexImage: string | null;
  indexImageR2Id: string | null;
  currentContest: boolean;
  judges: Judge[];
  categories: Category[];
}

// --- HELPER: ROBUST EXEC ---
function robustExec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, { shell: true });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => (stdout += d));
    proc.stderr.on('data', d => (stderr += d));
    proc.on('close', code => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`Command failed: ${command}\nStderr: ${stderr}`));
    });
  });
}

const PLACEMENT_SCORE: Record<string, number> = {
  first: 4,
  second: 3,
  third: 2,
  'runner-up': 1,
};

// --- MAIN ---
async function main() {
  console.log(`🚀 Starting Content Sync (${mode})...`);
  const start = Date.now();

  // 1. Create Directories
  [TEMP_DIR, PUBLIC_IMG_DIR, DATA_DIR].forEach(d => {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  });

  // 1b. Read prior generated file (if any) to preserve manual indexImage
  // overrides. We look up by r2Id first, then fall back to the raw path
  // (covers first regeneration before indexImageR2Id was tracked).
  const priorIndexByContest = new Map<
    string,
    { indexImage: string | null; indexImageR2Id: string | null }
  >();
  if (existsSync(OUT_FILE)) {
    try {
      const priorModule = await import(OUT_FILE);
      const priorData = (priorModule.pastContestsData ?? []) as Array<{
        id: string;
        indexImage?: string | null;
        indexImageR2Id?: string | null;
      }>;
      priorData.forEach(c => {
        priorIndexByContest.set(c.id, {
          indexImage: c.indexImage ?? null,
          indexImageR2Id: c.indexImageR2Id ?? null,
        });
      });
      console.log(
        `📌 Loaded ${priorIndexByContest.size} prior indexImage overrides`
      );
    } catch (e) {
      console.warn('⚠️ Could not read prior past-contests.ts:', e);
    }
  }

  // 2. Fetch DB Data (Main Content)
  const mainSql = `
    SELECT 
      c.id as contest_id, c.name as contest_name, c.description as contest_description, c.year as contest_year,
      cat.id as category_id, cat.name as category_name,
      r.id as result_id, r.result as result_placement, r.first_name, r.last_name,
      s.id as submission_id, s.title as submission_title, s.description as submission_description, s.r2_image_id
    FROM contests c
    INNER JOIN submissions s ON s.contest_id = c.id
    INNER JOIN results r ON r.submission_id = s.id
    INNER JOIN categories cat ON cat.id = s.category_id
  `;

  console.log(`📊 Querying main content...`);
  const mainRaw = await robustExec(
    `bunx wrangler d1 execute ${DB_NAME} --${mode} --command="${mainSql.replace(/"/g, '\\"')}" --json`
  );
  const rows = (JSON.parse(mainRaw)[0]?.results || []) as RawRow[];

  // 3. Fetch DB Data (Judges)
  const judgesSql = `SELECT id, contest_id, full_name, r2_image_id FROM judges`;

  console.log(`⚖️  Querying judges...`);
  const judgesRaw = await robustExec(
    `bunx wrangler d1 execute ${DB_NAME} --${mode} --command="${judgesSql.replace(/"/g, '\\"')}" --json`
  );
  const judgeRows = (JSON.parse(judgesRaw)[0]?.results || []) as RawJudgeRow[];

  // 3b. Fetch DB Data (All Contests)
  // Needed so contests without submissions/results (e.g. a currently running
  // contest that only has judges set up) still appear in the generated file
  // and get a static judges page.
  const contestsSql = `SELECT id, name, description, year, status FROM contests`;

  console.log(`🏆 Querying contests...`);
  const contestsRaw = await robustExec(
    `bunx wrangler d1 execute ${DB_NAME} --${mode} --command="${contestsSql.replace(/"/g, '\\"')}" --json`
  );
  const contestRows = (JSON.parse(contestsRaw)[0]?.results ||
    []) as RawContestRow[];

  if (!contestRows.length) {
    console.log('⚠️ No contests found.');
    return;
  }

  // 4. Process Images
  const uniqueImages = new Map<string, RawRow>();
  rows.forEach(r => {
    if (r.r2_image_id) uniqueImages.set(r.r2_image_id, r);
  });

  console.log(`🖼️  Processing ${uniqueImages.size} images...`);

  const imageMap = new Map<string, string>(); // R2_ID -> Local Path

  const tasks = Array.from(uniqueImages.entries()).map(
    ([r2Id, row]) =>
      async () => {
        const cleanR2Id = r2Id.trim();
        const relativePath = `/images/contests/${row.contest_year}/${row.submission_id}.webp`;
        const localFullPath = join(
          PUBLIC_IMG_DIR,
          row.contest_year.toString(),
          `${row.submission_id}.webp`
        );

        if (existsSync(localFullPath) && !shouldOverride) {
          return { id: cleanR2Id, path: relativePath };
        }

        const tempFile = join(TEMP_DIR, `${row.submission_id}.tmp`);
        const targetDir = dirname(localFullPath);
        if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

        try {
          await robustExec(
            `bunx wrangler r2 object get "${R2_BUCKET}/${cleanR2Id}" --remote --file "${tempFile}"`
          );
          await sharp(tempFile)
            .resize(1400, null, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 90 })
            .toFile(localFullPath);

          process.stdout.write('.');
          return { id: cleanR2Id, path: relativePath };
        } catch (_e) {
          console.error(`\n❌ Failed ID: "${cleanR2Id}"`);
          return null;
        } finally {
          if (existsSync(tempFile)) rmSync(tempFile);
        }
      }
  );

  for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
    const chunk = tasks.slice(i, i + CONCURRENCY_LIMIT);
    const results = await Promise.all(chunk.map(t => t()));
    results.forEach(res => {
      if (res) imageMap.set(res.id, res.path);
    });
  }

  console.log('\n✅ Images processed.');

  // 5. Structure Data
  console.log('🏗️  Structuring Data...');
  const contestsMap = new Map<string, Contest>();

  // A1. Seed map with ALL contests (including those without results yet).
  // `currentContest` is derived from the D1 status column: a contest is
  // considered current when its status is 'active'.
  for (const cRow of contestRows) {
    contestsMap.set(cRow.id, {
      id: cRow.id,
      year: cRow.year,
      name: cRow.name,
      description: cRow.description,
      indexImage: null,
      indexImageR2Id: null,
      currentContest: cRow.status === 'active',
      judges: [],
      categories: [],
    });
  }

  // A2. Overlay submission/result rows onto the seeded map
  for (const row of rows) {
    const contest = contestsMap.get(row.contest_id);
    if (!contest) continue;

    let category = contest.categories.find(c => c.id === row.category_id);
    if (!category) {
      category = {
        id: row.category_id,
        name: row.category_name,
        winnerImage: null,
        winnerImageR2Id: null, // <--- Init
        entries: [],
      };
      contest.categories.push(category);
    }

    const cleanR2Id = row.r2_image_id ? row.r2_image_id.trim() : null;
    const finalImage = cleanR2Id ? imageMap.get(cleanR2Id) || null : null;

    category.entries.push({
      id: row.submission_id,
      title: row.submission_title,
      description: row.submission_description,
      placement: row.result_placement as Placement,
      photographer: { firstName: row.first_name, lastName: row.last_name },
      image: finalImage,
      imageR2Id: cleanR2Id, // <--- Store ID
    });
  }

  // B. Attach Judges
  for (const jRow of judgeRows) {
    const contest = contestsMap.get(jRow.contest_id);
    if (contest) {
      contest.judges.push({
        id: jRow.id,
        fullName: jRow.full_name,
        r2ImageId: jRow.r2_image_id,
      });
    }
  }

  // 6. Post-Processing
  const finalOutput = Array.from(contestsMap.values())
    .map(contest => {
      contest.categories.sort((a, b) => a.name.localeCompare(b.name));

      contest.categories.forEach(cat => {
        cat.entries.sort((a, b) => {
          const scoreA = PLACEMENT_SCORE[a.placement] || 0;
          const scoreB = PLACEMENT_SCORE[b.placement] || 0;
          return scoreB - scoreA;
        });

        // Winner Image Logic
        if (cat.entries.length > 0) {
          // We assume the first sorted entry is the winner
          cat.winnerImage = cat.entries[0].image;
          cat.winnerImageR2Id = cat.entries[0].imageR2Id; // <--- Promote ID
        }
      });

      // Index image: preserve prior override if still valid; otherwise auto-
      // pick the first category's winner. "Still valid" means the referenced
      // r2Id (or raw path, on first regen) still exists in this contest.
      const prior = priorIndexByContest.get(contest.id);
      const allEntries = contest.categories.flatMap(c => c.entries);
      let chosenImage: string | null = null;
      let chosenR2Id: string | null = null;

      if (prior?.indexImageR2Id) {
        const match = allEntries.find(
          e => e.imageR2Id === prior.indexImageR2Id
        );
        if (match) {
          chosenImage = match.image;
          chosenR2Id = match.imageR2Id;
        }
      }
      if (!chosenR2Id && prior?.indexImage) {
        const match = allEntries.find(e => e.image === prior.indexImage);
        if (match) {
          chosenImage = match.image;
          chosenR2Id = match.imageR2Id;
        }
      }
      if (!chosenR2Id) {
        const heroCat = contest.categories.find(c => c.winnerImage);
        if (heroCat) {
          chosenImage = heroCat.winnerImage;
          chosenR2Id = heroCat.winnerImageR2Id;
        }
      }

      contest.indexImage = chosenImage;
      contest.indexImageR2Id = chosenR2Id;

      return contest;
    })
    .sort((a, b) => b.year - a.year);

  // 7. Save as TS (Using exact requested types)
  // Note: I added | null to images to be safe for TS strictness if data is missing
  const tsContent = `// Auto-generated by scripts/export-past-contests.ts
// Do not edit manually

export interface Judge {
  id: string;
  fullName: string;
  r2ImageId: string | null;
}

export interface Photographer {
  firstName: string | null;
  lastName: string | null;
}

export interface Entry {
  id: string;
  title: string;
  description: string | null;
  placement: 'first' | 'second' | 'third' | 'runner-up';
  photographer: Photographer;
  image: string;
  imageR2Id: string;
}

export interface Category {
  id: string;
  name: string;
  winnerImage: string;
  winnerImageR2Id: string;
  entries: Entry[];
}

export interface Contest {
  id: string;
  year: number;
  name: string;
  description: string | null;
  indexImage: string | null;
  indexImageR2Id: string | null;
  currentContest: boolean;
  judges: Judge[];
  categories: Category[];
}

export const pastContestsData: Contest[] = ${JSON.stringify(finalOutput, null, 2)};
`;

  const tempTs = `${OUT_FILE}.tmp`;
  writeFileSync(tempTs, tsContent);
  renameSync(tempTs, OUT_FILE);

  if (existsSync(TEMP_DIR)) rmSync(TEMP_DIR, { recursive: true, force: true });

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(
    `✨ Sync Complete: ${finalOutput.length} contests, ${imageMap.size} images.`
  );
  console.log(`⏱️  Time: ${duration}s`);
  console.log(`📂 Saved to: ${OUT_FILE}`);
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});

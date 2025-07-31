#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';
import {
  discoverContestFiles,
  processSubmissionsForDatabase,
  type MigrationSubmission,
  type ProcessedSubmission,
} from './utils.js';

interface DatabaseResult {
  total: number;
  inserted: number;
  failed: number;
  errors: string[];
}

async function insertIntoDatabase(
  submissions: ProcessedSubmission[]
): Promise<DatabaseResult> {
  const result: DatabaseResult = {
    total: submissions.length,
    inserted: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < submissions.length; i++) {
    const submission = submissions[i];
    console.log(
      `🗄️  [${i + 1}/${submissions.length}] Inserting: ${submission.title}`
    );

    try {
      // Insert submission
      const sql = `INSERT INTO submissions (
        id, contest_id, category_id, user_email, title, description, 
        r2_key, original_filename, file_size, content_type
      ) VALUES (
        '${submission.id}', '${submission.contestId}', '${submission.categoryId}', '${submission.userEmail}', 
        '${submission.title.replace(/'/g, "''")}', '', 
        '${submission.r2Key}', '${submission.originalFilename}', 
        ${submission.fileSize}, '${submission.contentType}'
      );`;

      try {
        execSync(
          `bunx wrangler d1 execute see-in-the-sea-db --remote --command="${sql.replace(
            /"/g,
            '\\"'
          )}"`,
          { stdio: 'pipe' }
        );
      } catch (execError) {
        const errorMessage =
          execError instanceof Error ? execError.message : String(execError);
        console.log(`   ❌ SQL Error: ${errorMessage}`);
        throw execError;
      }

      // Insert result if it exists
      if (submission.result) {
        const resultId = nanoid();
        const firstName = submission.firstName
          ? `'${submission.firstName.replace(/'/g, "''")}'`
          : 'NULL';
        const lastName = submission.lastName
          ? `'${submission.lastName.replace(/'/g, "''")}'`
          : 'NULL';

        const resultSql = `INSERT INTO results (
          id, submission_id, result, first_name, last_name
        ) VALUES (
          '${resultId}', '${submission.id}', '${submission.result}', ${firstName}, ${lastName}
        );`;

        try {
          execSync(
            `bunx wrangler d1 execute see-in-the-sea-db --remote --command="${resultSql.replace(
              /"/g,
              '\\"'
            )}"`,
            { stdio: 'pipe' }
          );
          console.log(`   ✅ Result: ${submission.result}`);
        } catch (resultError) {
          const errorMessage =
            resultError instanceof Error
              ? resultError.message
              : String(resultError);
          if (
            errorMessage.includes('UNIQUE constraint failed') ||
            errorMessage.includes('duplicate key')
          ) {
            console.log(`   ⚠️  Result duplicate: ${submission.result}`);
          } else {
            console.log(`   ⚠️  Result failed: ${errorMessage}`);
          }
        }
      }

      result.inserted++;
      console.log(`   ✅ Inserted: ${submission.title}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes('UNIQUE constraint failed') ||
        errorMessage.includes('duplicate key')
      ) {
        result.inserted++;
        console.log(`   ⚠️  Skipped (duplicate): ${submission.title}`);
      } else {
        result.errors.push(`${submission.title}: ${errorMessage}`);
        result.failed++;
        console.log(`   ❌ Failed: ${submission.title}`);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return result;
}

async function main() {
  console.log('🚀 Starting D1 database insertion...\n');

  // Discover and load contest files
  const contestFiles = discoverContestFiles();
  const allSubmissions: MigrationSubmission[] = [];

  for (const contestId of contestFiles) {
    try {
      const contestModule = await import(`../migration/${contestId}.ts`);
      allSubmissions.push(...contestModule.submissions);
    } catch (error) {
      console.log(
        `❌ Failed to load ${contestId}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  if (allSubmissions.length === 0) {
    console.log('❌ No submissions found. Exiting.');
    process.exit(1);
  }

  console.log(`📸 Processing ${allSubmissions.length} submissions...`);
  let processedSubmissions = processSubmissionsForDatabase(allSubmissions);

  // Add file sizes
  const picturesDir = join(process.cwd(), 'migration', 'pictures');
  processedSubmissions = processedSubmissions.map(submission => {
    const imagePath = join(picturesDir, submission.originalFilename);
    if (existsSync(imagePath)) {
      const fileSize = readFileSync(imagePath).length;
      return { ...submission, fileSize };
    }
    return submission;
  });

  if (processedSubmissions.length === 0) {
    console.log('❌ No valid submissions to insert. Exiting.');
    process.exit(1);
  }

  // Insert into database
  console.log(`\n🗄️  Inserting ${processedSubmissions.length} submissions...`);
  const dbResult = await insertIntoDatabase(processedSubmissions);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total: ${dbResult.total}`);
  console.log(`   Inserted: ${dbResult.inserted} ✅`);
  console.log(`   Failed: ${dbResult.failed} ❌`);

  if (dbResult.errors.length > 0) {
    console.log('\n❌ Errors:');
    dbResult.errors.forEach(error => console.log(`   - ${error}`));
  }

  console.log('\n🎉 Database insertion completed!');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

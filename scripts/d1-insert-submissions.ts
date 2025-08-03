#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';
import {
  discoverContestFiles,
  processSubmissionsForDatabase,
  type MigrationSubmission,
  type ProcessedSubmission,
} from './utils.js';

// Easy toggle: use --remote flag for remote mode, otherwise local
const isRemote = process.argv.includes('--remote');
const mode = isRemote ? 'remote' : 'local';

interface DatabaseResult {
  total: number;
  inserted: number;
  failed: number;
  errors: string[];
}

// Helper function to escape SQL strings properly
function escapeSqlString(str: string): string {
  return str.replace(/'/g, "''");
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

  console.log('🗄️  Generating batched SQL statements...');

  // Generate all submission INSERT statements
  const submissionInserts = submissions.map(submission => {
    return `INSERT OR IGNORE INTO submissions (
      id, contest_id, category_id, user_email, title, description, 
      r2_key, original_filename, file_size, content_type
    ) VALUES (
      '${escapeSqlString(submission.id)}', 
      '${escapeSqlString(submission.contestId)}', 
      '${escapeSqlString(submission.categoryId)}', 
      '${escapeSqlString(submission.userEmail)}', 
      '${escapeSqlString(submission.title)}', 
      '', 
      '${escapeSqlString(submission.r2Key)}', 
      '${escapeSqlString(submission.originalFilename)}', 
      ${submission.fileSize || 0}, 
      '${escapeSqlString(submission.contentType)}'
    );`;
  });

  // Generate all result INSERT statements
  const resultInserts = submissions
    .filter(submission => submission.result)
    .map(submission => {
      const resultId = nanoid();
      const firstName = submission.firstName
        ? `'${escapeSqlString(submission.firstName)}'`
        : 'NULL';
      const lastName = submission.lastName
        ? `'${escapeSqlString(submission.lastName)}'`
        : 'NULL';

      return `INSERT OR IGNORE INTO results (
        id, submission_id, result, first_name, last_name
      ) VALUES (
        '${resultId}', 
        '${escapeSqlString(submission.id)}', 
        '${escapeSqlString(submission.result!)}', 
        ${firstName}, 
        ${lastName}
      );`;
    });

  // Combine all SQL statements
  const allStatements = [...submissionInserts, ...resultInserts];
  const batchedSql = allStatements.join('\n');

  // Write to temporary file for easier debugging
  const tempSqlFile = join(process.cwd(), 'temp-batch-insert.sql');
  writeFileSync(tempSqlFile, batchedSql);
  console.log(`📝 SQL written to ${tempSqlFile} for review`);

  try {
    console.log('🚀 Executing batched SQL command...');

    // Execute single batched command
    execSync(
      `bunx wrangler d1 execute see-in-the-sea-db --${mode} --file="${tempSqlFile}"`,
      { stdio: 'inherit' }
    );

    console.log('✅ Batched SQL executed successfully!');
    result.inserted = submissions.length;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Batch execution failed: ${errorMessage}`);
    result.failed = submissions.length;
    result.errors.push(`Batch execution: ${errorMessage}`);
  }

  return result;
}

async function main() {
  console.log(`🚀 Starting D1 database insertion (${mode} mode)...\n`);

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

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { nanoid } from 'nanoid';
import { join } from 'path';

interface MigrationSubmission {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  fileName: string;
  result?: string; // 'first', 'second', 'third', 'runner-up'
  firstName?: string;
  lastName?: string;
}

interface ProcessedSubmission {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  r2Key: string;
  imageUrl: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  result?: string; // 'first', 'second', 'third', 'runner-up'
  firstName?: string;
  lastName?: string;
}

interface MigrationResult {
  contestId: string;
  totalSubmissions: number;
  processed: number;
  skipped: number;
  errors: Array<{
    submission: MigrationSubmission;
    error: string;
  }>;
  duplicates: Array<{
    submission: MigrationSubmission;
    reason: string;
  }>;
}

interface UploadResult {
  contestId: string;
  totalSubmissions: number;
  uploaded: number;
  failed: number;
  errors: Array<{
    submission: ProcessedSubmission;
    error: string;
  }>;
}

interface DatabaseResult {
  contestId: string;
  totalSubmissions: number;
  inserted: number;
  failed: number;
  errors: Array<{
    submission: ProcessedSubmission;
    error: string;
  }>;
}

function generateR2Key(
  contestId: string,
  categoryId: string,
  userEmail: string,
  fileExtension: string
): { submissionId: string; r2Key: string } {
  const submissionId = nanoid();
  const r2Key = `${contestId}/${categoryId}/${userEmail}/${submissionId}.${fileExtension}`;
  return { submissionId, r2Key };
}

function generateImageUrl(r2Key: string): string {
  return r2Key.replace(/\.[^/.]+$/, '');
}

async function processContestSubmissions(
  contestId: string,
  submissions: MigrationSubmission[]
): Promise<{
  result: MigrationResult;
  processedSubmissions: ProcessedSubmission[];
}> {
  console.log(`\n📸 Processing contest: ${contestId}`);
  console.log(`   Found ${submissions.length} submissions`);

  const result: MigrationResult = {
    contestId,
    totalSubmissions: submissions.length,
    processed: 0,
    skipped: 0,
    errors: [],
    duplicates: [],
  };

  const picturesDir = join(process.cwd(), 'migration', 'pictures');
  const processedSubmissions: ProcessedSubmission[] = [];

  // Check for duplicate file names within this contest
  const fileNames = new Set<string>();

  for (const submission of submissions) {
    console.log(`   Processing: ${submission.title}`);

    // Check for duplicate file names
    if (fileNames.has(submission.fileName)) {
      result.duplicates.push({
        submission,
        reason: `Duplicate file name: ${submission.fileName}`,
      });
      result.skipped++;
      console.log(`   ⚠️  Skipped (duplicate file): ${submission.title}`);
      continue;
    }
    fileNames.add(submission.fileName);

    const imagePath = join(picturesDir, submission.fileName);

    // Check if image file exists
    if (!existsSync(imagePath)) {
      result.errors.push({
        submission,
        error: `Image file not found: ${submission.fileName}`,
      });
      result.skipped++;
      console.log(`   ❌ Error (file not found): ${submission.title}`);
      continue;
    }

    try {
      // Read the image file
      const imageBuffer = readFileSync(imagePath);
      const fileExtension = submission.fileName.split('.').pop() || 'jpg';

      // Generate new submission ID and R2 key
      const { submissionId, r2Key } = generateR2Key(
        submission.contestId,
        submission.categoryId,
        submission.userEmail,
        fileExtension
      );

      // Generate image URL
      const imageUrl = generateImageUrl(r2Key);

      const processedSubmission: ProcessedSubmission = {
        id: submissionId,
        contestId: submission.contestId,
        categoryId: submission.categoryId,
        userEmail: submission.userEmail,
        title: submission.title,
        description: submission.description,
        r2Key,
        imageUrl,
        originalFilename: submission.fileName,
        fileSize: imageBuffer.length,
        contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
        result: submission.result,
        firstName: submission.firstName,
        lastName: submission.lastName,
      };

      processedSubmissions.push(processedSubmission);
      result.processed++;
      console.log(`   ✅ Processed: ${submission.title} (${submissionId})`);
    } catch (error) {
      result.errors.push({
        submission,
        error: `Failed to process image: ${error instanceof Error ? error.message : String(error)}`,
      });
      result.skipped++;
      console.log(`   ❌ Error (processing failed): ${submission.title}`);
    }
  }

  return { result, processedSubmissions };
}

async function uploadToR2(
  processedSubmissions: ProcessedSubmission[]
): Promise<UploadResult> {
  console.log(`\n📤 Uploading ${processedSubmissions.length} images to R2...`);

  const result: UploadResult = {
    contestId: 'all',
    totalSubmissions: processedSubmissions.length,
    uploaded: 0,
    failed: 0,
    errors: [],
  };

  const picturesDir = join(process.cwd(), 'migration', 'pictures');

  for (let i = 0; i < processedSubmissions.length; i++) {
    const submission = processedSubmissions[i];
    console.log(
      `   [${i + 1}/${processedSubmissions.length}] Uploading: ${submission.title}`
    );

    const imagePath = join(picturesDir, submission.originalFilename);

    try {
      const command = `bunx wrangler r2 object put see-in-the-sea-images/${submission.r2Key} --file "${imagePath}" --remote`;

      execSync(command, { stdio: 'pipe' });
      result.uploaded++;
      console.log(`   ✅ Uploaded: ${submission.title}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push({
        submission,
        error: `Upload failed: ${errorMessage}`,
      });
      result.failed++;
      console.log(`   ❌ Failed: ${submission.title}`);
    }

    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return result;
}

async function insertIntoDatabase(
  processedSubmissions: ProcessedSubmission[]
): Promise<DatabaseResult> {
  console.log(
    `\n🗄️  Inserting ${processedSubmissions.length} submissions into database...`
  );

  const result: DatabaseResult = {
    contestId: 'all',
    totalSubmissions: processedSubmissions.length,
    inserted: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < processedSubmissions.length; i++) {
    const submission = processedSubmissions[i];
    console.log(
      `   [${i + 1}/${processedSubmissions.length}] Inserting: ${submission.title}`
    );

    try {
      // Insert submission
      const sql = `INSERT INTO submissions (
        id, contest_id, category_id, user_email, title, description, 
        r2_key, image_url, original_filename, file_size, content_type
      ) VALUES (
        '${submission.id}', '${submission.contestId}', '${submission.categoryId}', '${submission.userEmail}', 
        '${submission.title.replace(/'/g, "''")}', '${submission.description.replace(/'/g, "''")}', 
        '${submission.r2Key}', '${submission.imageUrl}', '${submission.originalFilename}', 
        ${submission.fileSize}, '${submission.contentType}'
      );`;

      const command = `bunx wrangler d1 execute see-in-the-sea-db --remote --command="${sql.replace(/"/g, '\\"')}"`;

      execSync(command, { stdio: 'pipe' });

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

        const resultCommand = `bunx wrangler d1 execute see-in-the-sea-db --remote --command="${resultSql.replace(/"/g, '\\"')}"`;

        try {
          execSync(resultCommand, { stdio: 'pipe' });
          console.log(`   ✅ Inserted result: ${submission.result}`);
        } catch (resultError) {
          const resultErrorMessage =
            resultError instanceof Error
              ? resultError.message
              : String(resultError);
          if (
            resultErrorMessage.includes('UNIQUE constraint failed') ||
            resultErrorMessage.includes('duplicate key')
          ) {
            console.log(
              `   ⚠️  Skipped result (duplicate): ${submission.result}`
            );
          } else {
            console.log(`   ⚠️  Failed to insert result: ${resultError}`);
          }
        }
      }

      result.inserted++;
      console.log(`   ✅ Inserted: ${submission.title}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if it's a duplicate key error (which is expected for re-runs)
      if (
        errorMessage.includes('UNIQUE constraint failed') ||
        errorMessage.includes('duplicate key')
      ) {
        result.inserted++; // Count as success since it already exists
        console.log(`   ⚠️  Skipped (duplicate): ${submission.title}`);
      } else {
        result.errors.push({
          submission,
          error: `Database insert failed: ${errorMessage}`,
        });
        result.failed++;
        console.log(`   ❌ Failed: ${submission.title}`);
      }
    }

    // Small delay between inserts
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return result;
}

async function discoverContestFiles(): Promise<string[]> {
  const migrationDir = join(process.cwd(), 'migration');
  const files = readdirSync(migrationDir, { withFileTypes: true });

  return files
    .filter(
      file =>
        file.isFile() && file.name.endsWith('.ts') && file.name !== 'README.md'
    )
    .map(file => file.name.replace('.ts', ''))
    .filter(name => name !== 'contest-template'); // Exclude template
}

async function main() {
  console.log('🚀 Starting complete migration process...\n');

  try {
    // Discover all contest files
    const contestFiles = await discoverContestFiles();
    console.log(`📁 Found contest files: ${contestFiles.join(', ')}`);

    if (contestFiles.length === 0) {
      console.log('❌ No contest files found. Create contest files first.');
      process.exit(1);
    }

    const allResults: MigrationResult[] = [];
    const allProcessedSubmissions: ProcessedSubmission[] = [];

    // Step 1: Process all contests
    console.log('\n' + '='.repeat(60));
    console.log('STEP 1: PROCESSING CONTESTS');
    console.log('='.repeat(60));

    for (const contestFile of contestFiles) {
      try {
        const { submissions } = await import(`../migration/${contestFile}.js`);

        if (!submissions || !Array.isArray(submissions)) {
          console.log(
            `⚠️  Skipping ${contestFile}: No valid submissions array found`
          );
          continue;
        }

        const { result, processedSubmissions } =
          await processContestSubmissions(contestFile, submissions);
        allResults.push(result);
        allProcessedSubmissions.push(...processedSubmissions);
      } catch (error) {
        console.error(`❌ Failed to process ${contestFile}:`, error);
      }
    }

    if (allProcessedSubmissions.length === 0) {
      console.log(
        '\n❌ No submissions were processed successfully. Check for errors above.'
      );
      process.exit(1);
    }

    // Step 2: Upload to R2
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: UPLOADING TO R2');
    console.log('='.repeat(60));

    const uploadResult = await uploadToR2(allProcessedSubmissions);

    // Step 3: Insert into database
    console.log('\n' + '='.repeat(60));
    console.log('STEP 3: INSERTING INTO DATABASE');
    console.log('='.repeat(60));

    const databaseResult = await insertIntoDatabase(allProcessedSubmissions);

    // Generate final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLETE MIGRATION SUMMARY');
    console.log('='.repeat(60));

    const totalSubmissions = allResults.reduce(
      (sum, r) => sum + r.totalSubmissions,
      0
    );
    const totalProcessed = allResults.reduce((sum, r) => sum + r.processed, 0);
    const totalSkipped = allResults.reduce((sum, r) => sum + r.skipped, 0);
    const totalErrors = allResults.reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`📸 Processing:`);
    console.log(`   Total Submissions: ${totalSubmissions}`);
    console.log(`   Successfully Processed: ${totalProcessed} ✅`);
    console.log(`   Skipped: ${totalSkipped} ⚠️`);
    console.log(`   Errors: ${totalErrors} ❌`);

    console.log(`\n📤 R2 Upload:`);
    console.log(
      `   Uploaded: ${uploadResult.uploaded}/${uploadResult.totalSubmissions} ✅`
    );
    console.log(`   Failed: ${uploadResult.failed} ❌`);

    console.log(`\n🗄️  Database:`);
    console.log(
      `   Inserted: ${databaseResult.inserted}/${databaseResult.totalSubmissions} ✅`
    );
    console.log(`   Failed: ${databaseResult.failed} ❌`);

    // Show any errors
    if (uploadResult.errors.length > 0 || databaseResult.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      uploadResult.errors.forEach(error => {
        console.log(`   R2 Upload: ${error.submission.title} - ${error.error}`);
      });
      databaseResult.errors.forEach(error => {
        console.log(`   Database: ${error.submission.title} - ${error.error}`);
      });
    }

    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Verify images are loading in your application');
    console.log('2. Check the database for the new submissions');
    console.log(
      '3. Run: bunx wrangler d1 execute see-in-the-sea-db --remote --command="SELECT COUNT(*) as total FROM submissions;"'
    );
  } catch (error) {
    console.error('❌ Complete migration failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

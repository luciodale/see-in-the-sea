#!/usr/bin/env bun

import { exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import {
  discoverContestFiles,
  generateR2KeyWithoutEmail,
  type MigrationSubmission,
} from './utils.js';

const execAsync = promisify(exec);

const BATCH_SIZE = 60;

// Easy toggle: use --remote flag for remote mode, otherwise local
const isRemote = process.argv.includes('--remote');
const mode = isRemote ? 'remote' : 'local';

// Simple interface for R2 upload only
interface R2Submission {
  id: string;
  r2Key: string;
  originalFilename: string;
  title: string;
}

interface UploadResult {
  total: number;
  uploaded: number;
  failed: number;
  errors: string[];
}

function processSubmissionsForR2(
  submissions: MigrationSubmission[]
): R2Submission[] {
  const picturesDir = join(process.cwd(), 'migration', 'pictures');
  const processed: R2Submission[] = [];
  const fileNames = new Set<string>();

  for (const submission of submissions) {
    // Skip duplicates
    if (fileNames.has(submission.fileName)) {
      console.log(`⚠️  Skipped duplicate: ${submission.title}`);
      continue;
    }
    fileNames.add(submission.fileName);

    // Check if file exists
    const imagePath = join(picturesDir, submission.fileName);
    if (!existsSync(imagePath)) {
      console.log(`❌ File not found: ${submission.fileName}`);
      continue;
    }

    // Generate R2 key
    const fileExtension = submission.fileName.split('.').pop() || 'jpg';
    const { submissionId, r2Key } = generateR2KeyWithoutEmail(
      submission.contestId,
      submission.categoryId,
      fileExtension,
      submission.id
    );

    processed.push({
      id: submissionId,
      r2Key,
      originalFilename: submission.fileName,
      title: submission.title,
    });

    console.log(`✅ Processed: ${submission.title}`);
  }

  return processed;
}

// Helper function to split array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Upload a single submission
async function uploadSingleSubmission(
  submission: R2Submission,
  picturesDir: string,
  index: number,
  total: number
): Promise<{ success: boolean; error?: string }> {
  console.log(`📤 [${index + 1}/${total}] Uploading: ${submission.title}`);

  const imagePath = join(picturesDir, submission.originalFilename);

  try {
    const command = `bunx wrangler r2 object put see-in-the-sea-images/${submission.r2Key} --file "${imagePath}" --${mode}`;
    await execAsync(command);
    console.log(`✅ Uploaded: ${submission.title}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Failed: ${submission.title}`);
    return { success: false, error: `${submission.title}: ${errorMessage}` };
  }
}

async function uploadToR2(submissions: R2Submission[]): Promise<UploadResult> {
  const result: UploadResult = {
    total: submissions.length,
    uploaded: 0,
    failed: 0,
    errors: [],
  };

  const picturesDir = join(process.cwd(), 'migration', 'pictures');

  // Split submissions into batches
  const batches = chunkArray(submissions, BATCH_SIZE);

  console.log(
    `📦 Processing ${batches.length} batches of ${BATCH_SIZE} uploads each...`
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    const batchStart = batchIndex * BATCH_SIZE;

    console.log(`\n🔄 Processing batch ${batchIndex + 1}/${batches.length}...`);

    // Upload all files in the current batch in parallel
    const uploadPromises = batch.map((submission, localIndex) =>
      uploadSingleSubmission(
        submission,
        picturesDir,
        batchStart + localIndex,
        submissions.length
      )
    );

    // Wait for all uploads in this batch to complete
    const batchResults = await Promise.all(uploadPromises);

    // Process results
    for (const uploadResult of batchResults) {
      if (uploadResult.success) {
        result.uploaded++;
      } else {
        result.failed++;
        if (uploadResult.error) {
          result.errors.push(uploadResult.error);
        }
      }
    }
  }

  return result;
}

async function main() {
  console.log(`🚀 Starting R2 upload (${mode} mode)...\n`);

  // Discover contest files
  const contestFiles = discoverContestFiles();
  console.log(`📁 Found contests: ${contestFiles.join(', ')}`);

  // Process all submissions
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
  const processedSubmissions = processSubmissionsForR2(allSubmissions);

  if (processedSubmissions.length === 0) {
    console.log('❌ No valid submissions to upload. Exiting.');
    process.exit(1);
  }

  // Upload to R2
  console.log(`\n📤 Uploading ${processedSubmissions.length} images to R2...`);
  const uploadResult = await uploadToR2(processedSubmissions);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   Total: ${uploadResult.total}`);
  console.log(`   Uploaded: ${uploadResult.uploaded} ✅`);
  console.log(`   Failed: ${uploadResult.failed} ❌`);

  if (uploadResult.errors.length > 0) {
    console.log('\n❌ Errors:');
    uploadResult.errors.forEach(error => console.log(`   - ${error}`));
  }

  console.log('\n🎉 R2 upload completed!');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

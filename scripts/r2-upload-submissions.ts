#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  discoverContestFiles,
  generateR2KeyWithoutEmail,
  type MigrationSubmission,
} from './utils.js';

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

async function uploadToR2(submissions: R2Submission[]): Promise<UploadResult> {
  const result: UploadResult = {
    total: submissions.length,
    uploaded: 0,
    failed: 0,
    errors: [],
  };

  const picturesDir = join(process.cwd(), 'migration', 'pictures');

  for (let i = 0; i < submissions.length; i++) {
    const submission = submissions[i];
    console.log(
      `📤 [${i + 1}/${submissions.length}] Uploading: ${submission.title}`
    );

    const imagePath = join(picturesDir, submission.originalFilename);

    try {
      const command = `bunx wrangler r2 object put see-in-the-sea-images/${submission.r2Key} --file "${imagePath}" --${mode}`;
      execSync(command, { stdio: 'pipe' });
      result.uploaded++;
      console.log(`✅ Uploaded: ${submission.title}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      result.errors.push(`${submission.title}: ${errorMessage}`);
      result.failed++;
      console.log(`❌ Failed: ${submission.title}`);
    }

    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 100));
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

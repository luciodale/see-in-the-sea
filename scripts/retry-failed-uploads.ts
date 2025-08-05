#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { discoverContestFiles } from './utils';

interface FailedUpload {
  title: string;
  filePath: string;
  r2Key: string;
}

async function main() {
  const isRemote = process.argv.includes('--remote');
  const mode = isRemote ? 'remote' : 'local';

  console.log(`🔄 Retrying failed uploads in ${mode} mode...`);

  // Read the failed uploads file
  const failedUploadsFile = './failed-uploads.txt';
  if (!existsSync(failedUploadsFile)) {
    console.error('❌ failed-uploads.txt not found. Please create it first.');
    process.exit(1);
  }

  const failedTitles = readFileSync(failedUploadsFile, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log(`📋 Found ${failedTitles.length} failed uploads to retry`);

  // Discover all contest files to find the failed images
  const contestFiles = discoverContestFiles();
  const failedUploads: FailedUpload[] = [];

  for (const contestFile of contestFiles) {
    const { submissions } = await import(`../migration/${contestFile}`);

    for (const submission of submissions) {
      if (failedTitles.includes(submission.title)) {
        const fileName = submission.fileName || 'unknown.jpg';
        const filePath = join('./migration/pictures', fileName);

        if (existsSync(filePath)) {
          // Generate R2 key similar to how it's done in the upload script
          const r2Key = `${submission.userEmail}/${submission.contestId}/${submission.categoryId}/${submission.id}.jpg`;

          failedUploads.push({
            title: submission.title,
            filePath,
            r2Key,
          });
        } else {
          console.log(
            `⚠️  File not found for: ${submission.title} (${fileName})`
          );
        }
      }
    }
  }

  console.log(`🎯 Found ${failedUploads.length} files to retry uploading`);

  // Retry uploads
  let successCount = 0;
  let failCount = 0;
  const successfulTitles: string[] = [];
  const remainingFailedTitles = [...failedTitles];

  for (let i = 0; i < failedUploads.length; i++) {
    const upload = failedUploads[i];
    const progress = `[${i + 1}/${failedUploads.length}]`;

    console.log(`📤 ${progress} Retrying: ${upload.title}`);

    try {
      const command = isRemote
        ? `bunx wrangler r2 object put see-in-the-sea-images/${upload.r2Key} --file "${upload.filePath}"`
        : `bunx wrangler r2 object put see-in-the-sea-images/${upload.r2Key} --file "${upload.filePath}" --local`;

      execSync(command, { stdio: 'pipe' });
      console.log(`✅ ${progress} Success: ${upload.title}`);
      successCount++;
      successfulTitles.push(upload.title);

      // Remove from remaining failed titles
      const index = remainingFailedTitles.indexOf(upload.title);
      if (index > -1) {
        remainingFailedTitles.splice(index, 1);
      }
    } catch (error) {
      console.log(`❌ ${progress} Failed: ${upload.title}`);
      failCount++;
    }
  }

  console.log(`\n📊 Retry Summary:`);
  console.log(`   Total: ${failedUploads.length}`);
  console.log(`   Success: ${successCount} ✅`);
  console.log(`   Failed: ${failCount} ❌`);

  // Update the failed-uploads.txt file
  if (successCount > 0) {
    if (remainingFailedTitles.length === 0) {
      // All uploads successful, delete the file
      unlinkSync(failedUploadsFile);
      console.log(`\n🗑️  All uploads successful! Deleted ${failedUploadsFile}`);
    } else {
      // Some uploads successful, update the file with remaining failures
      writeFileSync(
        failedUploadsFile,
        remainingFailedTitles.join('\n') + '\n',
        'utf-8'
      );
      console.log(
        `\n📝 Updated ${failedUploadsFile} - removed ${successCount} successful uploads`
      );
      console.log(
        `   Remaining failed uploads: ${remainingFailedTitles.length}`
      );
    }
  }

  if (failCount > 0) {
    console.log(`\n💡 To retry failed uploads again, run:`);
    console.log(
      `   bun scripts/retry-failed-uploads.ts${isRemote ? ' --remote' : ''}`
    );
  }
}

main().catch(console.error);

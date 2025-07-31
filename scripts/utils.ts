import { readdirSync } from 'fs';
import { join } from 'path';
import type { NewSubmission } from '../src/db/schema.js';
import { generateR2Key } from '../src/server/imageService.js';

// Migration data interface (for the raw data from migration files)
export interface MigrationSubmission {
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

export interface ProcessedSubmission extends NewSubmission {
  originalFilename: string;
  fileSize: number;
  contentType: string;
  result?: string;
  firstName?: string;
  lastName?: string;
}

// Common utility functions
export function discoverContestFiles(): string[] {
  const migrationDir = join(process.cwd(), 'migration');
  const files = readdirSync(migrationDir, { withFileTypes: true });

  return files
    .filter(
      file =>
        file.isFile() &&
        file.name.endsWith('.ts') &&
        file.name.startsWith('uw-') &&
        file.name !== 'contest-template.ts'
    )
    .map(file => file.name.replace('.ts', ''));
}

export function processSubmissionsForDatabase(
  submissions: MigrationSubmission[]
): ProcessedSubmission[] {
  const processed: ProcessedSubmission[] = [];
  const fileNames = new Set<string>();

  for (const submission of submissions) {
    // Skip duplicates
    if (fileNames.has(submission.fileName)) {
      console.log(`⚠️  Skipped duplicate: ${submission.title}`);
      continue;
    }
    fileNames.add(submission.fileName);

    // Process file
    const fileExtension = submission.fileName.split('.').pop() || 'jpg';
    const { submissionId, r2Key } = generateR2Key(
      submission.contestId,
      submission.categoryId,
      submission.userEmail,
      fileExtension,
      submission.id
    );

    processed.push({
      id: submissionId,
      contestId: submission.contestId,
      categoryId: submission.categoryId,
      userEmail: submission.userEmail,
      title: submission.title,
      description: submission.description,
      r2Key,
      imageUrl: '',
      originalFilename: submission.fileName,
      fileSize: 0, // Will be set by the calling script
      contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
      result: submission.result,
      firstName: submission.firstName,
      lastName: submission.lastName,
    });

    console.log(`✅ Processed: ${submission.title}`);
  }

  return processed;
}

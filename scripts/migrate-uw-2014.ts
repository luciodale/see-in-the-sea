#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import { users } from '../users';

interface MigrationSubmission {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  result: string;
  firstName: string;
  lastName: string;
  fileName: string;
}

interface ParsedSubmission {
  imageUrl: string;
  description: string;
  result: string;
  category: string;
}

// Read the complete HTML content from the file
function getHtmlContent(): string {
  const htmlPath = './migration/migrationHtml.html';
  if (!existsSync(htmlPath)) {
    throw new Error(`HTML file not found: ${htmlPath}`);
  }
  return readFileSync(htmlPath, 'utf-8');
}

function parseHtmlContent(htmlContent: string): ParsedSubmission[] {
  const submissions: ParsedSubmission[] = [];

  // Find all category headings first
  // Use a simpler approach - find h2 tags and extract text content
  const categoryPattern =
    /<h2[^>]*class="wp-block-heading"[^>]*>([\s\S]*?)<\/h2>/g;
  const categories = [];
  let match;

  while ((match = categoryPattern.exec(htmlContent)) !== null) {
    // Extract text content and remove any inner HTML tags
    const rawText = match[1];
    const cleanText = rawText
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    console.log(`Found category match: "${cleanText}" at index ${match.index}`);
    categories.push({
      name: cleanText,
      startIndex: match.index + match[0].length,
      endIndex: -1,
    });
  }

  // Set end indices
  for (let i = 0; i < categories.length; i++) {
    if (i < categories.length - 1) {
      // Find the next category heading
      const nextCategoryMatch = htmlContent.indexOf(
        '<h2',
        categories[i].startIndex
      );
      categories[i].endIndex =
        nextCategoryMatch !== -1 ? nextCategoryMatch : htmlContent.length;
    } else {
      categories[i].endIndex = htmlContent.length;
    }
  }

  console.log(
    `Found ${categories.length} categories:`,
    categories.map(c => c.name)
  );

  if (categories.length === 0) {
    console.error('No category headings found in HTML');
    return submissions;
  }

  for (const category of categories) {
    const categoryName = category.name;
    const categoryContent = htmlContent.substring(
      category.startIndex,
      category.endIndex
    );

    console.log(`\n=== Processing category: ${categoryName} ===`);

    // Extract image data from href attributes in anchor tags
    // Look for data-slb-caption attributes that contain the description and result
    const imageMatches = categoryContent.match(
      /<a[^>]+href="([^"]+)"[^>]*data-slb-caption="([^"]*)"[^>]*>/g
    );

    if (imageMatches) {
      for (const match of imageMatches) {
        const hrefMatch = match.match(/href="([^"]+)"/);
        const captionMatch = match.match(/data-slb-caption="([^"]*)"/);

        if (hrefMatch && captionMatch) {
          const imageUrl = hrefMatch[1];
          let caption = captionMatch[1];

          // Decode HTML entities
          caption = caption
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&deg;/g, '°');

          // Extract description and result from caption
          // Format: <b>NAME - TITLE</b><p>RESULT</p> or <div><strong>NAME - TITLE</strong></div><p>RESULT</p>
          // Handle multiline captions by removing line breaks and extra whitespace
          const cleanCaption = caption.replace(/\s+/g, ' ').trim();

          const descMatch = cleanCaption.match(
            /<(?:b|(?:div><strong))>([^<]+)(?:<\/b>|(?:<\/strong><\/div>))\s*<p>([^<]+)<\/p>/
          );

          if (descMatch) {
            const description = descMatch[1].trim();
            const result = descMatch[2].trim();

            submissions.push({
              imageUrl,
              description,
              result,
              category: categoryName,
            });

            console.log(`  Found: ${description} - ${result}`);
          }
        }
      }
    }
  }

  console.log(`\nTotal submissions found: ${submissions.length}`);
  return submissions;
}

function mapCategory(categoryName: string): string {
  const categoryMap: Record<string, string> = {
    'Fresh waters': 'fresh-waters',
    'fresh waters': 'fresh-waters',
    'Wide angle': 'wide-angle',
    'wide angle': 'wide-angle',
    Macro: 'macro',
    macro: 'macro',
    Mediterranean: 'mediterranean',
    mediterranean: 'mediterranean',
    'Mediterranean Portfolio': 'mediterranean',
    Newcomers: 'newcomers',
    newcomers: 'newcomers',
    'The professions of the sea': 'the-professions-of-the-sea',
    'the professions of the sea': 'the-professions-of-the-sea',
  };

  return (
    categoryMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-')
  );
}

function mapResult(resultText: string): string {
  const resultMap: Record<string, string> = {
    '1° Classified': 'first',
    '1st Classified': 'first',
    '2° Classified': 'second',
    '2nd Classified': 'second',
    '3° Classified': 'third',
    '3rd Classified': 'third',
    'Runner Up': 'runner-up',
  };

  return resultMap[resultText] || 'runner-up';
}

function parseDescription(description: string): {
  firstName: string;
  lastName: string;
  title: string;
} {
  // Handle format: "FIRST LAST - TITLE" or "FIRST LAST"
  const parts = description.split(' - ');
  const namePart = parts[0].trim();
  const title = parts[1]?.trim() || '';

  // Split name into first and last
  const nameWords = namePart.split(' ');
  const firstName = nameWords[0] || '';
  const lastName = nameWords.slice(1).join(' ') || '';

  return { firstName, lastName, title };
}

function findUserEmail(firstName: string, lastName: string): string {
  // First try exact match
  const exactMatch = users.find(
    user =>
      user.firstName.toLowerCase() === firstName.toLowerCase() &&
      user.lastName.toLowerCase() === lastName.toLowerCase()
  );

  if (exactMatch) {
    return exactMatch.email;
  }

  // Try partial matches
  const partialMatches = users.filter(
    user =>
      user.firstName.toLowerCase().includes(firstName.toLowerCase()) ||
      firstName.toLowerCase().includes(user.firstName.toLowerCase()) ||
      user.lastName.toLowerCase().includes(lastName.toLowerCase()) ||
      lastName.toLowerCase().includes(user.lastName.toLowerCase())
  );

  if (partialMatches.length === 1) {
    console.log(
      `  Partial match: ${firstName} ${lastName} -> ${partialMatches[0].firstName} ${partialMatches[0].lastName} (${partialMatches[0].email})`
    );
    return partialMatches[0].email;
  }

  console.log(`  No user found for: ${firstName} ${lastName}`);
  return '';
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 50);
}

function generateUniqueFileName(
  title: string,
  existingFileNames: Set<string>,
  index: number
): string {
  let fileName = sanitizeFileName(title);
  if (!fileName) {
    fileName = `image-${index + 1}`;
  }

  let extension = '.jpg';
  let uniqueFileName = `${fileName}${extension}`;
  let counter = 1;

  while (existingFileNames.has(uniqueFileName)) {
    uniqueFileName = `${fileName}-${counter}${extension}`;
    counter++;
  }

  existingFileNames.add(uniqueFileName);
  return uniqueFileName;
}

function downloadImage(url: string, outputPath: string): boolean {
  try {
    console.log(`  Downloading: ${url} -> ${outputPath}`);
    // Add timeout and better error handling for the image download
    execSync(`curl -L --max-time 30 --retry 3 -o "${outputPath}" "${url}"`, {
      stdio: 'pipe',
    });

    // Check if file was actually downloaded and has content
    if (existsSync(outputPath)) {
      const stats = require('fs').statSync(outputPath);
      if (stats.size > 0) {
        console.log(`  ✅ Downloaded: ${stats.size} bytes`);
        return true;
      } else {
        console.log(`  ❌ Downloaded file is empty`);
        return false;
      }
    } else {
      console.log(`  ❌ File was not created`);
      return false;
    }
  } catch (error) {
    console.error(`  ❌ Failed to download ${url}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔍 Parsing HTML content for uw-2014...');

  const htmlContent = getHtmlContent();
  const parsedSubmissions = parseHtmlContent(htmlContent);
  console.log(`Found ${parsedSubmissions.length} submissions`);

  if (parsedSubmissions.length === 0) {
    console.error('❌ No submissions found. Check HTML parsing logic.');
    process.exit(1);
  }

  // Ensure migration/pictures directory exists
  const picturesDir = './migration/pictures';
  if (!existsSync(picturesDir)) {
    mkdirSync(picturesDir, { recursive: true });
  }

  const existingFileNames = new Set<string>();
  const migrationData: MigrationSubmission[] = [];

  console.log('\n📥 Processing submissions...');

  for (let i = 0; i < parsedSubmissions.length; i++) {
    const submission = parsedSubmissions[i];
    const { firstName, lastName, title } = parseDescription(
      submission.description
    );
    const userEmail = findUserEmail(firstName, lastName);
    const uniqueFileName = generateUniqueFileName(title, existingFileNames, i);
    const filePath = path.join(picturesDir, uniqueFileName);

    console.log(`\n${i + 1}. ${submission.description}`);
    console.log(`   Category: ${submission.category}`);
    console.log(`   Result: ${submission.result}`);
    console.log(`   User: ${userEmail || 'NOT FOUND'}`);
    console.log(`   File: ${uniqueFileName}`);

    // Try to download the image (with better error handling)
    const downloadSuccess = downloadImage(submission.imageUrl, filePath);

    if (!downloadSuccess) {
      console.log(
        `   ⚠️  Image download failed, but continuing with migration data`
      );
    }

    migrationData.push({
      id: nanoid(),
      contestId: 'uw-2014',
      categoryId: mapCategory(submission.category),
      userEmail,
      title,
      description: '',
      result: mapResult(submission.result),
      firstName,
      lastName,
      fileName: uniqueFileName,
    });
  }

  // Generate the migration file
  const migrationFileContent = `export interface MigrationSubmission {
  id: string;
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description: string;
  result: string;
  firstName: string;
  lastName: string;
  fileName: string;
}

export const submissions: MigrationSubmission[] = [
${migrationData
  .map(
    submission => `  {
    id: '${submission.id}',
    contestId: '${submission.contestId}',
    categoryId: '${submission.categoryId}',
    userEmail: '${submission.userEmail}',
    title: '${submission.title}',
    description: '${submission.description}',
    result: '${submission.result}',
    firstName: '${submission.firstName}',
    lastName: '${submission.lastName}',
    fileName: '${submission.fileName}',
  }`
  )
  .join(',\n')}
];
`;

  writeFileSync('./migration/uw-2014.ts', migrationFileContent);

  console.log('\n✅ Migration complete!');
  console.log(
    `📝 Generated: migration/uw-2014.ts with ${migrationData.length} submissions`
  );
  console.log(`📁 Images saved to: ${picturesDir}`);

  // Summary by category
  const categorySummary = migrationData.reduce(
    (acc, submission) => {
      acc[submission.categoryId] = (acc[submission.categoryId] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\n📊 Category summary:');
  Object.entries(categorySummary).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} submissions`);
  });

  // Summary of user matches
  const usersFound = migrationData.filter(s => s.userEmail).length;
  const usersNotFound = migrationData.length - usersFound;
  console.log(
    `\n👥 User matching: ${usersFound} found, ${usersNotFound} not found`
  );
}

main().catch(console.error);

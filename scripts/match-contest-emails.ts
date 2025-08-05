#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';

async function matchEmails(contestYear: string) {
  console.log(`🔍 Matching uw-${contestYear} participants with users.ts...\n`);

  try {
    // Import the data
    const { users } = await import('../users.ts');
    const { submissions } = await import(`../migration/uw-${contestYear}.ts`);

    console.log(`📧 Loaded ${users.length} users`);
    console.log(`📸 Loaded ${submissions.length} submissions`);

    // Find submissions with empty emails
    const emptyEmailSubmissions = submissions.filter(
      (s: any) => s.userEmail === ''
    );
    console.log(
      `🔍 Found ${emptyEmailSubmissions.length} submissions with empty emails\n`
    );

    const matches = [];
    const unmatched = [];

    function normalizeName(name: string): string {
      return name.toLowerCase().replace(/[^a-z]/g, '');
    }

    // Try to match each empty email submission with a user
    for (const submission of emptyEmailSubmissions) {
      let matched = false;

      for (const user of users) {
        const firstNameMatch =
          normalizeName(submission.firstName) === normalizeName(user.firstName);
        const lastNameMatch =
          normalizeName(submission.lastName) === normalizeName(user.lastName);

        if (firstNameMatch && lastNameMatch) {
          matches.push({
            submission,
            user,
            confidence: 'high',
          });
          matched = true;
          break;
        }
      }

      if (!matched) {
        unmatched.push(submission);
      }
    }

    console.log('✅ Matches found:');
    matches.forEach((match: any) => {
      console.log(
        `   ${match.submission.firstName} ${match.submission.lastName} -> ${match.user.email}`
      );
    });

    console.log(`\n❌ Unmatched (${unmatched.length}):`);
    unmatched.forEach((submission: any) => {
      console.log(
        `   ${submission.firstName} ${submission.lastName} (${submission.title})`
      );
    });

    console.log(`\n📊 Summary:`);
    console.log(
      `   Matched: ${matches.length}/${emptyEmailSubmissions.length}`
    );
    console.log(
      `   Success rate: ${((matches.length / emptyEmailSubmissions.length) * 100).toFixed(1)}%`
    );

    return matches;
  } catch (error) {
    console.error(`❌ Error loading uw-${contestYear} data:`, error);
    return [];
  }
}

async function updateEmails(contestYear: string, matches: any[]) {
  if (matches.length === 0) {
    console.log('ℹ️  No email matches to update');
    return;
  }

  const emailMappings: Record<string, string> = {};

  matches.forEach((match: any) => {
    const fullName = `${match.submission.firstName} ${match.submission.lastName}`;
    emailMappings[fullName] = match.user.email;
  });

  let content = readFileSync(`migration/uw-${contestYear}.ts`, 'utf-8');

  Object.entries(emailMappings).forEach(([name, email]) => {
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    // Find patterns like: userEmail: '', followed by lines that match firstName and lastName
    const pattern = new RegExp(
      `(userEmail: '',\\s*[^}]*?firstName: '${firstName}',\\s*lastName: '${lastName}',)`,
      'g'
    );

    content = content.replace(pattern, match => {
      return match.replace("userEmail: '',", `userEmail: '${email}',`);
    });
  });

  writeFileSync(`migration/uw-${contestYear}.ts`, content);
  console.log(
    `✅ Updated uw-${contestYear}.ts with ${matches.length} email addresses`
  );
}

async function main() {
  const contestYear = process.argv[2];

  if (!contestYear) {
    console.error(
      '❌ Please provide contest year: bun scripts/match-contest-emails.ts 2018'
    );
    process.exit(1);
  }

  console.log(`🚀 Starting email matching for uw-${contestYear}...\n`);

  const matches = await matchEmails(contestYear);
  await updateEmails(contestYear, matches);

  console.log(`\n🎉 Email matching completed for uw-${contestYear}!`);
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

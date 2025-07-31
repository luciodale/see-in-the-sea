#!/usr/bin/env bun

import { execSync } from 'child_process';

console.log('🗑️  Clearing R2 bucket using Cloudflare API...\n');

// You'll need to set these environment variables:
// CLOUDFLARE_API_TOKEN=your_api_token
// CLOUDFLARE_ACCOUNT_ID=your_account_id

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const BUCKET_NAME = 'see-in-the-sea-media';

if (!API_TOKEN || !ACCOUNT_ID) {
  console.log('❌ Missing environment variables:');
  console.log(
    '   CLOUDFLARE_API_TOKEN - Get from https://dash.cloudflare.com/profile/api-tokens'
  );
  console.log('   CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID');
  console.log(
    '\n💡 Run: export CLOUDFLARE_API_TOKEN=your_token && export CLOUDFLARE_ACCOUNT_ID=your_id'
  );
  process.exit(1);
}

try {
  // List objects
  console.log('📋 Listing objects in R2 bucket...');
  const listUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/buckets/${BUCKET_NAME}/objects`;

  const listResponse = execSync(
    `curl -s -H "Authorization: Bearer ${API_TOKEN}" "${listUrl}"`,
    { encoding: 'utf8' }
  );
  const listData = JSON.parse(listResponse);

  if (!listData.success) {
    console.log('❌ Failed to list objects:', listData.errors);
    process.exit(1);
  }

  const objects = listData.result.objects || [];
  console.log(`   Found ${objects.length} objects`);

  if (objects.length === 0) {
    console.log('   ✅ Bucket is already empty');
    process.exit(0);
  }

  // Delete objects
  console.log('\n🗑️  Deleting objects...');
  for (const obj of objects) {
    try {
      const deleteUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/buckets/${BUCKET_NAME}/objects/${obj.key}`;
      execSync(
        `curl -s -X DELETE -H "Authorization: Bearer ${API_TOKEN}" "${deleteUrl}"`,
        { stdio: 'pipe' }
      );
      console.log(`   ✅ Deleted: ${obj.key}`);
    } catch (error) {
      console.log(`   ❌ Failed to delete: ${obj.key}`);
    }
  }

  console.log('\n🎉 R2 bucket cleared successfully!');
} catch (error) {
  console.log(
    '❌ Error:',
    error instanceof Error ? error.message : String(error)
  );
  console.log(
    '\n💡 Alternative: Use Cloudflare Dashboard at https://dash.cloudflare.com/ > R2 > see-in-the-sea-media'
  );
}

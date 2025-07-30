# UW 2024 Migration Guide

This directory contains scripts and data for migrating the UW 2024 underwater photography contest submissions from the old database to the new one.

## Files

- `uw-2024.ts` - Contains the submissions data array with metadata
- `pictures/` - Directory containing the original image files
- `uw-2024-migration.sql` - Generated SQL to insert submissions into the database
- `uw-2024-processed.json` - Processed submission data with generated IDs and R2 keys

## Migration Process

### Step 1: Process Submissions

Run the migration script to process the submissions and generate the necessary files:

```bash
bun run migrate:uw-2024
```

This will:

- Read the submissions from `uw-2024.ts`
- Load the corresponding images from `pictures/`
- Generate new submission IDs and R2 keys
- Create `uw-2024-migration.sql` and `uw-2024-processed.json`

### Step 2: Upload Images to R2

You have several options to upload the images to R2:

#### Option A: Using Wrangler CLI (Recommended)

Run the upload helper script to get the exact commands:

```bash
bun run upload:uw-2024
```

This will output the exact Wrangler commands you need to run. Replace `<bucket-name>` with your actual R2 bucket name.

#### Option B: Manual Upload via Cloudflare Dashboard

1. Go to your Cloudflare R2 dashboard
2. Navigate to your bucket
3. Upload the images using the R2 keys from `uw-2024-processed.json`

### Step 3: Insert Database Records

You can insert the submission records into your database using the generated SQL:

#### For Local Development:

```bash
wrangler d1 execute see-in-the-sea-db --local --file=./migration/uw-2024-migration.sql
```

#### For Production:

```bash
wrangler d1 execute see-in-the-sea-db --remote --file=./migration/uw-2024-migration.sql
```

## Adding New Submissions

To add more submissions to the migration:

1. Add the image file to the `pictures/` directory
2. Add the submission data to the `submissions` array in `uw-2024.ts`:

```typescript
{
  id: nanoid(), // This will be replaced with a new ID
  contestId: 'uw-2024',
  categoryId: 'wide-angle', // or 'macro', 'bw'
  userEmail: 'user@example.com',
  title: 'Photo Title',
  description: 'Photo description',
  fileName: 'image-file.jpg', // Must match file in pictures/
},
```

3. Run the migration script again to regenerate the files

## File Structure

The R2 keys follow this pattern:

```
{contestId}/{categoryId}/{userEmail}/{submissionId}.{extension}
```

Example:

```
uw-2024/wide-angle/stefano.cerb@libero.it/WX4JCXXqDQ8LpPUFmJpqY.jpg
```

## Troubleshooting

- **Image not found**: Make sure the `fileName` in `uw-2024.ts` matches exactly with a file in the `pictures/` directory
- **Database errors**: Ensure the contest and category IDs exist in your database before running the migration
- **R2 upload errors**: Check that your R2 bucket exists and you have the correct permissions

## Scripts

- `bun run migrate:uw-2024` - Process submissions and generate migration files
- `bun run upload:uw-2024` - Show upload commands and validate processed data

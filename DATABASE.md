# Database Management with Drizzle

Your database schema is now managed entirely through TypeScript with Drizzle ORM. ✅ **Tested and Working!**

## 📁 File Structure

```
src/db/schema.ts          # Single source of truth for schema
scripts/seed-db.ts        # Default data definitions  
scripts/generate-seed.ts  # Script to generate seed SQL
drizzle/migrations/       # Auto-generated SQL migrations
drizzle/seed.sql         # Auto-generated seed data SQL
```

## 🚀 Available Commands

### Generate Named Migrations ⭐
When you change `src/db/schema.ts`, generate a new migration with a descriptive name:
```bash
bun run db:migration initial_schema
bun run db:migration add_user_preferences  
bun run db:migration update_contest_rules
bun run db:migration add_voting_system
```

### Apply Migrations
```bash
# Apply to remote Cloudflare D1
bun run db:migrate:remote

# Apply to local development
bun run db:migrate:local
```

### Seed Database
Insert default categories and contests:
```bash
bun run db:seed
```

### Full Setup (Fresh Database)
Set up everything from scratch:
```bash
bun run db:init
```
This runs: generate → migrate → seed

### Database Studio
Visual database browser:
```bash
bun run db:studio
```

## 🔄 Workflow

### 1. Modify Schema
Edit `src/db/schema.ts` - your single source of truth:

```typescript
export const submissions = sqliteTable('submissions', {
  // Add new field
  newField: text('new_field'),
  // ... existing fields
});
```

### 2. Generate Named Migration
```bash
bun run db:migration add_user_preferences
```
Creates: `drizzle/migrations/0001_add_user_preferences.sql` (much better than `0001_loud_the_enforcers.sql`!)

### 3. Apply to Cloudflare
```bash
bun run db:migrate:remote
```

### 4. Deploy Code
```bash
bun run deploy
```

## 📊 Default Data

Default categories and contests are defined in `scripts/seed-db.ts`:

```typescript
export const seedData = {
  categories: [
    { id: 'category-1', name: 'Wide Angle', description: 'Expansive underwater scenes, coral reefs, and seascapes' },
    { id: 'category-2', name: 'Macro', description: 'Close-up photography of small marine life and details' },
    { id: 'category-3', name: 'Black and White', description: 'Monochrome underwater photography showcasing contrast and composition' }
  ],
  contests: [
    { id: '2025-uw-contest', name: 'Underwater Photography Contest 2025', description: 'Annual underwater photography competition' }
  ]
};
```

## 🎯 Benefits

✅ **Single Source of Truth** - Only `src/db/schema.ts` matters  
✅ **Type Safety** - Full TypeScript support  
✅ **Version Control** - Migration history  
✅ **No Manual SQL** - Everything auto-generated  
✅ **Consistent** - Schema and code always in sync

## 🗑️ What You Can Delete

- `schema.sql` - No longer needed!
- Any manual SQL files - Drizzle generates everything
- Random migration names like `0000_loud_the_enforcers.sql` - Use descriptive names instead!

## ✅ Tested Workflow

This setup has been fully tested with:
1. ✅ Complete D1 database reset  
2. ✅ Named migration generation (`initial_schema`)
3. ✅ Migration application to Cloudflare D1
4. ✅ Database seeding with underwater photography data
5. ✅ Contest ID: `'2025-uw-contest'` 
6. ✅ Categories: Wide Angle, Macro, Black and White
7. ✅ App deployment and upload form testing

Your schema is now managed entirely in TypeScript! 🎉 
import type { Config } from 'drizzle-kit';

export default {
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'd1-http',
  dbCredentials: {
    // For migrations, we'll use wrangler commands instead of direct API
    accountId: 'placeholder',
    databaseId: 'e385ed45-21fc-4f9b-90ad-93b6397789b1',
    token: 'placeholder',
  },
} satisfies Config;

import { drizzle } from 'drizzle-orm/d1';
import { submissions, results, contests, categories, judges } from '../src/db/schema';

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  // Get D1 database instance
  const db = drizzle(process.env.DB as any);

  try {
    // Clear tables in the correct order (respecting foreign key constraints)
    console.log('   Clearing results table...');
    await db.delete(results);
    
    console.log('   Clearing submissions table...');
    await db.delete(submissions);
    
    console.log('   Clearing judges table...');
    await db.delete(judges);
    
    console.log('   Clearing contests table...');
    await db.delete(contests);
    
    console.log('   Clearing categories table...');
    await db.delete(categories);

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

// Run the script
clearDatabase().catch(console.error); 
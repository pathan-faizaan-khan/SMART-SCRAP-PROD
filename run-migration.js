import postgres from 'postgres';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function runMigration() {
  try {
    const migrationSQL = readFileSync('./drizzle/0002_create_saved_listings.sql', 'utf-8');
    
    console.log('Running migration...');
    console.log(migrationSQL);
    
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

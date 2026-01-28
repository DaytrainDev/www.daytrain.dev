/**
 * Initialize the Neon Postgres database schema for RPG game data
 * Run with: node scripts/init-db.mjs
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('\nTo set up Neon Postgres:');
  console.log('1. Go to https://neon.tech and create a free account');
  console.log('2. Create a new project');
  console.log('3. Copy the connection string');
  console.log('4. Add to .env.local: DATABASE_URL="your-connection-string"');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function initDatabase() {
  console.log('🗄️  Initializing database schema...\n');

  try {
    // Create rpg_saves table for player save data
    console.log('Creating rpg_saves table...');
    await sql`
      CREATE TABLE IF NOT EXISTS rpg_saves (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        slot INTEGER NOT NULL DEFAULT 1,
        save_data JSONB NOT NULL,
        playtime INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, slot)
      )
    `;
    console.log('   ✅ rpg_saves table created');

    // Create rpg_global_data table for shared world state
    console.log('Creating rpg_global_data table...');
    await sql`
      CREATE TABLE IF NOT EXISTS rpg_global_data (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('   ✅ rpg_global_data table created');

    // Create rpg_events table for logging game events
    console.log('Creating rpg_events table...');
    await sql`
      CREATE TABLE IF NOT EXISTS rpg_events (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        event_type VARCHAR(100) NOT NULL,
        event_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('   ✅ rpg_events table created');

    // Create indexes for better query performance
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_rpg_saves_user ON rpg_saves(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rpg_events_user ON rpg_events(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rpg_events_type ON rpg_events(event_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_rpg_events_created ON rpg_events(created_at)`;
    console.log('   ✅ Indexes created');

    console.log('\n✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

initDatabase();

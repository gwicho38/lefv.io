import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@db/schema";
import dotenv from "dotenv";
import { createClient } from '@supabase/supabase-js';
import { NodePgDatabase } from "drizzle-orm/node-postgres";

dotenv.config(); // Load .env file

// Determine if we should use Supabase or local Postgres
const useSupabase = process.env.USE_SUPABASE === 'true';

// Get environment-specific Supabase credentials
const env = process.env.NODE_ENV || 'development';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (env === 'production' 
    ? process.env.SUPABASE_URL_PROD 
    : process.env.SUPABASE_URL_DEV);
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (env === 'production' 
    ? process.env.SUPABASE_ANON_KEY_PROD 
    : process.env.SUPABASE_ANON_KEY_DEV);

let db: NodePgDatabase<typeof schema>;

if (useSupabase && supabaseUrl && supabaseKey) {
  // Use Supabase with a PostgreSQL connection
  // Since drizzle-orm doesn't have a direct Supabase adapter that works
  // with the latest version, we'll use the PostgreSQL connection
  
  if (!process.env.DATABASE_URL) {
    console.log(`Connected to Supabase (${env} environment) via API`);
    
    // Create a Supabase client for API access
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // For database migrations, you'll need to run the SQL script manually in the Supabase dashboard
    // The schema is defined in migrations/supabase_schema.sql
    
    // Use PostgreSQL connection for Drizzle
    const pool = new Pool({
      connectionString: env === 'production' 
        ? process.env.SUPABASE_POSTGRES_URL_PROD 
        : process.env.SUPABASE_POSTGRES_URL_DEV,
    });
    
    db = drizzle(pool, { schema });
  } else {
    // If we have a direct postgres connection to Supabase
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    db = drizzle(pool, { schema });
    console.log(`Connected to Supabase PostgreSQL (${env} environment) via direct connection`);
  }
} else {
  // Use local PostgreSQL
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  db = drizzle(pool, { schema });
  console.log('Connected to local PostgreSQL database');
}

export { db };

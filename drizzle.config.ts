import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

// Determine which database connection to use
const useSupabase = process.env.USE_SUPABASE === 'true';
const env = process.env.NODE_ENV || 'development';

let databaseUrl = process.env.DATABASE_URL;

// When using Supabase, we'll use the direct PostgreSQL connection string from Supabase
// You can find this in your Supabase dashboard > Project Settings > Database > Connection string
if (useSupabase) {
  // Note: For Drizzle migrations to work with Supabase, you'll need to set up a direct PostgreSQL 
  // connection in your Supabase dashboard and add it to your .env file as SUPABASE_POSTGRES_URL_DEV
  // or SUPABASE_POSTGRES_URL_PROD depending on the environment
  databaseUrl = env === 'production' 
    ? process.env.SUPABASE_POSTGRES_URL_PROD 
    : process.env.SUPABASE_POSTGRES_URL_DEV;
}

if (!databaseUrl) {
  throw new Error("Database URL not found. Ensure either DATABASE_URL or Supabase connection is properly configured in .env");
}

export default defineConfig({
  out: "./migrations",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

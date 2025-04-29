import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Define environment settings
const environments = {
  development: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_DEV || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY_DEV || '',
  },
  production: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL_PROD || '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY_PROD || '',
  },
};

// Get current environment
const env = process.env.NODE_ENV || 'development';
const config = environments[env as keyof typeof environments];

// Validate configuration
if (!config.url || !config.key) {
  console.error(`Missing Supabase configuration for ${env} environment`);
  console.error('Make sure you have defined Supabase URL and ANON_KEY in your .env file');
}

// Create Supabase client
export const supabase = createClient(config.url, config.key);
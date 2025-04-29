import { createClient } from '@supabase/supabase-js';

// Environment variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
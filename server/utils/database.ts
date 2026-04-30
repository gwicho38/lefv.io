import { logError, logInfo } from './logger';

export function validateDatabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const useSupabase = process.env.USE_SUPABASE === 'true';

  if (useSupabase) {
    if (
      !process.env.VITE_SUPABASE_URL &&
      !process.env.SUPABASE_URL_DEV &&
      !process.env.SUPABASE_URL_PROD
    ) {
      errors.push('Missing Supabase URL configuration');
    }
    if (
      !process.env.VITE_SUPABASE_ANON_KEY &&
      !process.env.SUPABASE_ANON_KEY_DEV &&
      !process.env.SUPABASE_ANON_KEY_PROD
    ) {
      errors.push('Missing Supabase anon key configuration');
    }
  } else {
    if (!process.env.DATABASE_URL) {
      errors.push('Missing DATABASE_URL for local PostgreSQL');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { db } = await import("@db");
    const { sql } = await import("drizzle-orm");

    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    logError('Database health check failed', error);
    return false;
  }
}

export function logDatabaseConnectionInfo(): void {
  const useSupabase = process.env.USE_SUPABASE === 'true';
  
  if (useSupabase) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 
                       process.env.SUPABASE_URL_DEV || 
                       process.env.SUPABASE_URL_PROD;
    
    if (supabaseUrl) {
      logInfo('Using Supabase database', {
        url: supabaseUrl.substring(0, 30) + '...'
      });
    }
  } else {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      logInfo('Using local PostgreSQL database', {
        url: databaseUrl.substring(0, 30) + '...'
      });
    }
  }
}
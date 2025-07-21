import { db } from "@db";
import type { Response } from 'express';
import { errorResponse } from './validation';

/**
 * Executes a database operation with proper error handling
 */
export async function executeDatabaseOperation<T>(
  operation: () => Promise<T>,
  res: Response,
  errorMessage: string = "Database operation failed"
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error instanceof Error ? error.message : error);
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connection')) {
      errorResponse(res, 503, "Database connection error", { 
        message: "Please try again later" 
      });
    } else {
      errorResponse(res, 500, errorMessage);
    }
    
    return null;
  }
}

/**
 * Checks database health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to check if database is accessible
    await db.query.posts.findFirst();
    return true;
  } catch (error) {
    console.error("Database health check failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Validates required environment variables for database connection
 */
export function validateDatabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const useSupabase = process.env.USE_SUPABASE === 'true';
  
  if (useSupabase) {
    if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL_DEV && !process.env.SUPABASE_URL_PROD) {
      errors.push('Missing Supabase URL configuration');
    }
    
    if (!process.env.VITE_SUPABASE_ANON_KEY && !process.env.SUPABASE_ANON_KEY_DEV && !process.env.SUPABASE_ANON_KEY_PROD) {
      errors.push('Missing Supabase API key configuration');
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
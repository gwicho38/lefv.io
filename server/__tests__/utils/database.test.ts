import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateDatabaseConfig, checkDatabaseHealth, logDatabaseConnectionInfo } from '../../utils/database';

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn()
}));

describe('Database Utils', () => {
  beforeEach(() => {
    // Clear environment variables before each test
    delete process.env.USE_SUPABASE;
    delete process.env.DATABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.SUPABASE_URL_DEV;
    delete process.env.SUPABASE_URL_PROD;
    delete process.env.VITE_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_ANON_KEY_DEV;
    delete process.env.SUPABASE_ANON_KEY_PROD;
    vi.clearAllMocks();
  });

  describe('validateDatabaseConfig', () => {
    it('should validate local PostgreSQL configuration', () => {
      process.env.USE_SUPABASE = 'false';
      process.env.DATABASE_URL = 'postgresql://REDACTED';

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return error when DATABASE_URL is missing for local PostgreSQL', () => {
      process.env.USE_SUPABASE = 'false';
      // No DATABASE_URL set

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing DATABASE_URL for local PostgreSQL');
    });

    it('should validate Supabase configuration with VITE variables', () => {
      process.env.USE_SUPABASE = 'true';
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Supabase configuration with DEV variables', () => {
      process.env.USE_SUPABASE = 'true';
      process.env.SUPABASE_URL_DEV = 'https://dev.supabase.co';
      process.env.SUPABASE_ANON_KEY_DEV = 'dev-anon-key';

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors when Supabase URL is missing', () => {
      process.env.USE_SUPABASE = 'true';
      process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';
      // No URL variables set

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing Supabase URL configuration');
    });

    it('should return errors when Supabase anon key is missing', () => {
      process.env.USE_SUPABASE = 'true';
      process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      // No anon key variables set

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing Supabase anon key configuration');
    });

    it('should return multiple errors when multiple configurations are missing', () => {
      process.env.USE_SUPABASE = 'true';
      // No Supabase variables set

      const result = validateDatabaseConfig();

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Missing Supabase URL configuration');
      expect(result.errors).toContain('Missing Supabase anon key configuration');
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return true when database query succeeds', async () => {
      // Mock successful database query
      const mockDb = {
        execute: vi.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] })
      };
      
      vi.doMock('../../db', () => ({ db: mockDb }));
      vi.doMock('drizzle-orm', () => ({ sql: vi.fn() }));

      const result = await checkDatabaseHealth();

      expect(result).toBe(true);
    });

    it('should return false and log error when database query fails', async () => {
      // Mock failing database query
      const mockDb = {
        execute: vi.fn().mockRejectedValue(new Error('Connection failed'))
      };
      
      vi.doMock('../../db', () => ({ db: mockDb }));
      vi.doMock('drizzle-orm', () => ({ sql: vi.fn() }));

      const result = await checkDatabaseHealth();

      expect(result).toBe(false);
    });
  });

  describe('logDatabaseConnectionInfo', () => {
    it('should log Supabase connection info', () => {
      const { logInfo } = require('../../utils/logger');
      
      process.env.USE_SUPABASE = 'true';
      process.env.VITE_SUPABASE_URL = 'https://very-long-project-id.supabase.co';

      logDatabaseConnectionInfo();

      expect(logInfo).toHaveBeenCalledWith('Using Supabase database', {
        url: 'https://very-long-project-id...'
      });
    });

    it('should log local PostgreSQL connection info', () => {
      const { logInfo } = require('../../utils/logger');
      
      process.env.USE_SUPABASE = 'false';
      process.env.DATABASE_URL = 'postgresql://REDACTED';

      logDatabaseConnectionInfo();

      expect(logInfo).toHaveBeenCalledWith('Using local PostgreSQL database', {
        url: 'postgresql://REDACTED'
      });
    });

    it('should not log when no database URL is configured for Supabase', () => {
      const { logInfo } = require('../../utils/logger');
      
      process.env.USE_SUPABASE = 'true';
      // No URL variables set

      logDatabaseConnectionInfo();

      expect(logInfo).not.toHaveBeenCalled();
    });

    it('should not log when no DATABASE_URL is configured for local PostgreSQL', () => {
      const { logInfo } = require('../../utils/logger');
      
      process.env.USE_SUPABASE = 'false';
      // No DATABASE_URL set

      logDatabaseConnectionInfo();

      expect(logInfo).not.toHaveBeenCalled();
    });
  });
});
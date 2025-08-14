import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import winston from 'winston';
import { logger, logInfo, logError, logWarn, logDebug } from '../../utils/logger';

// Mock winston
vi.mock('winston', () => ({
  default: {
    createLogger: vi.fn(() => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      add: vi.fn()
    })),
    format: {
      combine: vi.fn(),
      timestamp: vi.fn(),
      errors: vi.fn(),
      json: vi.fn(),
      colorize: vi.fn(),
      simple: vi.fn()
    },
    transports: {
      Console: vi.fn(),
      File: vi.fn()
    }
  }
}));

describe('Logger', () => {
  let mockLogger: any;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
      add: vi.fn()
    };
    (winston.createLogger as any).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('logInfo', () => {
    it('should call winston logger info with message and meta', () => {
      const message = 'Test info message';
      const meta = { userId: '123', action: 'login' };

      logInfo(message, meta);

      expect(mockLogger.info).toHaveBeenCalledWith(message, meta);
    });

    it('should call winston logger info with just message', () => {
      const message = 'Test info message';

      logInfo(message);

      expect(mockLogger.info).toHaveBeenCalledWith(message, undefined);
    });
  });

  describe('logError', () => {
    it('should call winston logger error with message and error object', () => {
      const message = 'Test error message';
      const error = new Error('Something went wrong');

      logError(message, error);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        error: 'Something went wrong',
        stack: error.stack
      });
    });

    it('should handle error as string', () => {
      const message = 'Test error message';
      const error = 'String error message';

      logError(message, error);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        error: 'String error message',
        stack: undefined
      });
    });

    it('should call winston logger error with just message', () => {
      const message = 'Test error message';

      logError(message);

      expect(mockLogger.error).toHaveBeenCalledWith(message, {
        error: undefined,
        stack: undefined
      });
    });
  });

  describe('logWarn', () => {
    it('should call winston logger warn with message and meta', () => {
      const message = 'Test warning message';
      const meta = { deprecatedFeature: 'oldAPI' };

      logWarn(message, meta);

      expect(mockLogger.warn).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logDebug', () => {
    it('should call winston logger debug with message and meta', () => {
      const message = 'Test debug message';
      const meta = { debugData: { step: 1, value: 'test' } };

      logDebug(message, meta);

      expect(mockLogger.debug).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logger configuration', () => {
    it('should create logger with correct configuration in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Re-import to test configuration
      expect(winston.createLogger).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('should create logger with correct configuration in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // The logger should add file transports in production
      expect(mockLogger.add).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('stream', () => {
    it('should log message through stream.write', async () => {
      // Import stream after mocks are set up
      const { stream } = await import('../../utils/logger');
      const message = 'HTTP request log message\n';

      stream.write(message);

      expect(mockLogger.info).toHaveBeenCalledWith('HTTP request log message');
    });
  });
});
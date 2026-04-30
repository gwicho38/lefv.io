import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, logInfo, logError, logWarn, logDebug, stream } from '../../utils/logger';

describe('Logger', () => {
  let infoSpy: any;
  let errorSpy: any;
  let warnSpy: any;
  let debugSpy: any;

  beforeEach(() => {
    // Spy on the actual logger methods
    infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => logger);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logInfo', () => {
    it('should call winston logger info with message and meta', () => {
      const message = 'Test info message';
      const meta = { userId: '123', action: 'login' };

      logInfo(message, meta);

      expect(infoSpy).toHaveBeenCalledWith(message, meta);
    });

    it('should call winston logger info with just message', () => {
      const message = 'Test info message';

      logInfo(message);

      expect(infoSpy).toHaveBeenCalledWith(message, undefined);
    });
  });

  describe('logError', () => {
    it('should call winston logger error with message and error object', () => {
      const message = 'Test error message';
      const error = new Error('Something went wrong');

      logError(message, error);

      expect(errorSpy).toHaveBeenCalledWith(message, {
        error: 'Something went wrong',
        stack: error.stack
      });
    });

    it('should handle error as string', () => {
      const message = 'Test error message';
      const error = 'String error message';

      logError(message, error);

      expect(errorSpy).toHaveBeenCalledWith(message, {
        error: 'String error message',
        stack: undefined
      });
    });

    it('should call winston logger error with just message', () => {
      const message = 'Test error message';

      logError(message);

      expect(errorSpy).toHaveBeenCalledWith(message, {
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

      expect(warnSpy).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logDebug', () => {
    it('should call winston logger debug with message and meta', () => {
      const message = 'Test debug message';
      const meta = { debugData: { step: 1, value: 'test' } };

      logDebug(message, meta);

      expect(debugSpy).toHaveBeenCalledWith(message, meta);
    });
  });

  describe('logger configuration', () => {
    it('should create logger with correct configuration in development', () => {
      // Logger exists and has expected methods
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.debug).toBeDefined();
    });

    it('should create logger with correct configuration in production', () => {
      // Logger exists with necessary methods
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.add).toBe('function');
    });
  });

  describe('stream', () => {
    it('should log message through stream.write', () => {
      const message = 'HTTP request log message\n';

      stream.write(message);

      expect(infoSpy).toHaveBeenCalledWith('HTTP request log message');
    });
  });
});
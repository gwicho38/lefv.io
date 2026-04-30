import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { weatherService } from '../../services/weatherService';
import { server as mswServer } from '../../../client/src/__tests__/mocks/server';

// This file mocks fetch directly via vi.fn(); the global MSW interceptor (set
// up in client/src/__tests__/setup.ts) tries to clone the response shape
// produced by those mocks, which is not a real Response and lacks .clone().
// Stop the MSW server for the duration of this file and restart it after, so
// the global setup's afterAll close() still works.
beforeAll(() => {
  mswServer.close();
});
afterAll(() => {
  mswServer.listen({ onUnhandledRequest: 'bypass' });
});

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('WeatherService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Clear environment variables
    delete process.env.AMBIENT_API_KEY;
    delete process.env.AMBIENT_APP_KEY;
    delete process.env.AMBIENT_MAC_ADDRESS;
    delete process.env.OPENWEATHER_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should return Ambient Weather data when configured', async () => {
      // Set up environment
      process.env.AMBIENT_API_KEY = 'test-api-key';
      process.env.AMBIENT_APP_KEY = 'test-app-key';

      // Mock Ambient Weather API response
      const mockAmbientData = [{
        lastData: {
          tempf: 72.5,
          humidity: 65,
          windspeedmph: 5.2,
          baromrelin: 29.92,
          winddir: 180,
          hourlyrainin: 0.05,
          dailyrainin: 0.15,
          weeklyrainin: 1.2,
          monthlyrainin: 3.5,
          feelsLike: 71.0,
          dewPoint: 58.0,
          lastRain: '2024-01-01T10:00:00Z'
        }
      }];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAmbientData)
      });

      const result = await weatherService.getCurrentWeather();

      expect(result.source).toBe('ambient');
      expect(result.temperature).toBe(72.5);
      expect(result.humidity).toBe(65);
      expect(result.windSpeed).toBe(5.2);
      expect(result.pressure).toBe(29.92);
      expect(result.windDir).toBe(180);
    });

    it('should fallback to OpenWeatherMap when Ambient Weather fails', async () => {
      // Set up environment - Ambient configured but will fail
      process.env.AMBIENT_API_KEY = 'test-api-key';
      process.env.AMBIENT_APP_KEY = 'test-app-key';
      process.env.OPENWEATHER_API_KEY = 'test-openweather-key';
      process.env.OPENWEATHER_CITY = 'Paris';
      process.env.OPENWEATHER_COUNTRY = 'FR';

      // Mock Ambient Weather API failure
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })
        // Mock OpenWeatherMap success
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            main: {
              temp: 20.5,
              humidity: 70,
              pressure: 1013.25,
              feels_like: 19.0
            },
            wind: {
              speed: 3.5,
              deg: 270
            },
            weather: [{
              description: 'partly cloudy'
            }],
            name: 'Paris',
            sys: {
              country: 'FR'
            }
          })
        });

      const result = await weatherService.getCurrentWeather();

      expect(result.source).toBe('openweather');
      expect(result.temperature).toBe(20.5);
      expect(result.humidity).toBe(70);
      expect(result.description).toBe('partly cloudy');
      expect(result.city).toBe('Paris');
      expect(result.country).toBe('FR');
    });

    it('should use OpenWeatherMap when only it is configured', async () => {
      // Set up environment - only OpenWeatherMap
      process.env.OPENWEATHER_API_KEY = 'test-openweather-key';
      process.env.OPENWEATHER_CITY = 'London';
      process.env.OPENWEATHER_COUNTRY = 'GB';

      // Mock OpenWeatherMap API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          main: {
            temp: 15.0,
            humidity: 80,
            pressure: 1020,
            feels_like: 14.5
          },
          wind: {
            speed: 2.1,
            deg: 90
          },
          weather: [{
            description: 'overcast'
          }],
          name: 'London',
          sys: {
            country: 'GB'
          }
        })
      });

      const result = await weatherService.getCurrentWeather();

      expect(result.source).toBe('openweather');
      expect(result.temperature).toBe(15.0);
      expect(result.city).toBe('London');
      expect(result.country).toBe('GB');
      expect(result.description).toBe('overcast');
    });

    it('should throw error when no services are configured', async () => {
      // No environment variables set
      await expect(weatherService.getCurrentWeather()).rejects.toThrow('No weather service configured');
    });

    it('should throw error when all services fail', async () => {
      // Set up environment
      process.env.AMBIENT_API_KEY = 'test-api-key';
      process.env.AMBIENT_APP_KEY = 'test-app-key';
      process.env.OPENWEATHER_API_KEY = 'test-openweather-key';

      // Mock both services failing
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 401
        });

      await expect(weatherService.getCurrentWeather()).rejects.toThrow('All weather services failed');
    });
  });

  describe('getWeatherHistory', () => {
    it('should return temperature history from Ambient Weather', async () => {
      // Set up environment
      process.env.AMBIENT_API_KEY = 'test-api-key';
      process.env.AMBIENT_APP_KEY = 'test-app-key';
      process.env.AMBIENT_MAC_ADDRESS = 'test-mac';

      // Mock API response
      const mockHistoryData = [
        { date: '2024-01-01T10:00:00Z', tempf: 70.0 },
        { date: '2024-01-01T11:00:00Z', tempf: 72.0 },
        { date: '2024-01-01T12:00:00Z', tempf: 74.0 }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryData)
      });

      const result = await weatherService.getWeatherHistory('temperature');

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        time: '2024-01-01T10:00:00Z',
        value: 70.0
      });
      expect(result[2]).toEqual({
        time: '2024-01-01T12:00:00Z',
        value: 74.0
      });
    });

    it('should return precipitation history from Ambient Weather', async () => {
      // Set up environment
      process.env.AMBIENT_API_KEY = 'test-api-key';
      process.env.AMBIENT_APP_KEY = 'test-app-key';
      process.env.AMBIENT_MAC_ADDRESS = 'test-mac';

      // Mock API response
      const mockHistoryData = [
        { date: '2024-01-01T10:00:00Z', hourlyrainin: 0.1, dailyrainin: 0.3 },
        { date: '2024-01-01T11:00:00Z', hourlyrainin: 0.0, dailyrainin: 0.3 }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoryData)
      });

      const result = await weatherService.getWeatherHistory('precipitation');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        time: '2024-01-01T10:00:00Z',
        hourly: 0.1,
        daily: 0.3
      });
    });

    it('should throw error when Ambient Weather is not configured', async () => {
      await expect(weatherService.getWeatherHistory('temperature'))
        .rejects.toThrow('Weather history only available with Ambient Weather station');
    });
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { registerRoutes } from '../../routes';
import express from 'express';

// Mock the database
vi.mock('@db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    execute: vi.fn()
  }
}));

// Mock the weather service
vi.mock('../../services/weatherService', () => ({
  weatherService: {
    getCurrentWeather: vi.fn(),
    getWeatherHistory: vi.fn()
  }
}));

// Mock the logger
vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logDebug: vi.fn()
}));

// Mock database health check
vi.mock('../../utils/database', () => ({
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
  validateDatabaseConfig: vi.fn().mockReturnValue({
    isValid: true,
    errors: []
  })
}));

describe('API Integration Tests', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    app = express() as express.Express;
    app.use(express.json());
    server = registerRoutes(app);
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('connected', true);
    });

    it('should include environment information in health check', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('Blog Posts Endpoints', () => {
    it('should return empty array when no posts exist', async () => {
      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return posts with correct structure', async () => {
      const mockPosts = [
        {
          id: '1',
          slug: 'test-post',
          title: 'Test Post',
          description: 'A test post',
          content: '# Test Content',
          date: '2024-01-01',
          readingTime: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: 'tech,web'
        }
      ];

      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('slug', 'test-post');
      expect(response.body[0]).toHaveProperty('title', 'Test Post');
    });

    it('should filter posts by tag', async () => {
      const mockPosts = [
        {
          id: '1',
          slug: 'tech-post',
          title: 'Tech Post',
          tags: 'tech,web'
        }
      ];

      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue(mockPosts);

      const response = await request(app)
        .get('/api/posts?tag=tech')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('Tech Post');
    });

    it('should return 404 for non-existent post', async () => {
      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue([]);

      await request(app)
        .get('/api/posts/non-existent-post')
        .expect(404);
    });

    it('should return specific post by slug', async () => {
      const mockPost = [
        {
          id: '1',
          slug: 'specific-post',
          title: 'Specific Post',
          content: '# Specific Content',
          tags: 'specific'
        }
      ];

      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue(mockPost);

      const response = await request(app)
        .get('/api/posts/specific-post')
        .expect(200);

      expect(response.body.slug).toBe('specific-post');
      expect(response.body.title).toBe('Specific Post');
    });
  });

  describe('Tags Endpoint', () => {
    it('should return unique tags', async () => {
      const mockTags = [
        { id: '1', name: 'tech', slug: 'tech', postCount: 5 },
        { id: '2', name: 'web', slug: 'web', postCount: 3 }
      ];

      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue(mockTags);

      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'tech');
      expect(response.body[0]).toHaveProperty('postCount', 5);
    });

    it('should handle empty tags gracefully', async () => {
      const { db } = await import('@db');
      (db.execute as any).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('Weather Endpoints', () => {
    it('should return current weather data', async () => {
      const { weatherService } = await import('../../services/weatherService');
      const mockWeatherData = {
        temperature: 20.5,
        humidity: 65,
        windSpeed: 5.2,
        pressure: 1013.25,
        windDir: 180,
        feelsLike: 19.0,
        source: 'openweather',
        city: 'Paris',
        country: 'FR'
      };

      (weatherService.getCurrentWeather as any).mockResolvedValue(mockWeatherData);

      const response = await request(app)
        .get('/api/weather')
        .expect(200);

      expect(response.body).toEqual(mockWeatherData);
    });

    it('should handle weather service errors gracefully', async () => {
      const { weatherService } = await import('../../services/weatherService');
      (weatherService.getCurrentWeather as any).mockRejectedValue(new Error('Service unavailable'));

      await request(app)
        .get('/api/weather')
        .expect(500);
    });

    it('should return weather history for valid type', async () => {
      const { weatherService } = await import('../../services/weatherService');
      const mockHistoryData = [
        { time: '2024-01-01T10:00:00Z', value: 20.0 },
        { time: '2024-01-01T11:00:00Z', value: 21.0 }
      ];

      (weatherService.getWeatherHistory as any).mockResolvedValue(mockHistoryData);

      const response = await request(app)
        .get('/api/weather/history/temperature')
        .expect(200);

      expect(response.body).toEqual(mockHistoryData);
    });

    it('should validate weather history type parameter', async () => {
      await request(app)
        .get('/api/weather/history/invalid-type')
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow normal request rates', async () => {
      // Make a few requests in quick succession
      for (let i = 0; i < 3; i++) {
        await request(app)
          .get('/api/posts')
          .expect(200);
      }
    });

    // Note: Rate limiting tests are complex and may require longer timeouts
    // in real scenarios. These are simplified for unit testing.
  });

  describe('Error Handling', () => {
    it('should return 500 when database throws error', async () => {
      const { db } = await import('@db');
      (db.execute as any).mockRejectedValue(new Error('Database error'));

      await request(app)
        .get('/api/posts')
        .expect(500);
    });

    it('should return proper error format', async () => {
      const { db } = await import('@db');
      (db.execute as any).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/posts')
        .expect(500);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle OPTIONS requests', async () => {
      await request(app)
        .options('/api/posts')
        .expect(204);
    });
  });
});
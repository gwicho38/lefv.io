import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from '../../routes';
import type { BlogPost } from '../../utils/blogPosts';

// --- Module mocks (must come before importing routes) ----------------------

vi.mock('chokidar', () => ({
  default: { watch: vi.fn().mockReturnValue({ on: vi.fn().mockReturnThis() }) },
}));

vi.mock('@db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    execute: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../utils/blogPosts', () => ({
  loadAllPosts: vi.fn(),
  loadPostBySlug: vi.fn(),
  sortPosts: (posts: BlogPost[]) => posts,
  parseSortOrder: () => 'newest',
}));

vi.mock('../../services/weatherService', () => ({
  weatherService: {
    getCurrentWeather: vi.fn(),
    getWeatherHistory: vi.fn(),
  },
}));

vi.mock('../../utils/database', () => ({
  checkDatabaseHealth: vi.fn().mockResolvedValue(true),
  validateDatabaseConfig: vi.fn().mockReturnValue({ isValid: true, errors: [] }),
}));

vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logDebug: vi.fn(),
}));

// --- Helpers ---------------------------------------------------------------

const samplePost = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: 1,
  slug: 'test-post',
  title: 'Test Post',
  content: 'Test content',
  excerpt: 'Excerpt',
  readingTime: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  draft: false,
  tags: [{ id: 1, name: 'tech' }],
  ...overrides,
});

// --- Suite ----------------------------------------------------------------

describe('API Integration Tests', () => {
  let app: express.Express;
  let server: any;

  beforeAll(async () => {
    app = express() as express.Express;
    app.use(cors({ origin: true }));
    app.use(express.json());
    server = registerRoutes(app);
  });

  afterAll(() => {
    if (server) server.close();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Health Check Endpoint', () => {
    it('should return 200 and health status', async () => {
      const res = await request(app).get('/api/health').expect(200);
      expect(res.body).toHaveProperty('status', 'healthy');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('database');
      expect(res.body.database).toHaveProperty('connected', true);
    });

    it('should include environment information in health check', async () => {
      const res = await request(app).get('/api/health').expect(200);
      expect(res.body).toHaveProperty('environment');
    });
  });

  describe('Blog Posts Endpoints', () => {
    it('should return empty array when no posts exist', async () => {
      const { loadAllPosts } = await import('../../utils/blogPosts');
      (loadAllPosts as any).mockResolvedValue([]);

      const res = await request(app).get('/api/posts').expect(200);
      expect(res.body).toEqual([]);
    });

    it('should return posts with correct structure', async () => {
      const { loadAllPosts } = await import('../../utils/blogPosts');
      (loadAllPosts as any).mockResolvedValue([samplePost()]);

      const res = await request(app).get('/api/posts').expect(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'Excerpt',
        readingTime: 1,
      });
    });

    it('should return 404 for non-existent post', async () => {
      const { loadPostBySlug } = await import('../../utils/blogPosts');
      (loadPostBySlug as any).mockResolvedValue(null);

      await request(app).get('/api/posts/non-existent-post').expect(404);
    });

    it('should return specific post by slug', async () => {
      const { loadPostBySlug } = await import('../../utils/blogPosts');
      (loadPostBySlug as any).mockResolvedValue(samplePost({ slug: 'specific-post' }));

      const res = await request(app).get('/api/posts/specific-post').expect(200);
      expect(res.body.slug).toBe('specific-post');
    });

    it('should return 404 for draft post', async () => {
      const { loadPostBySlug } = await import('../../utils/blogPosts');
      (loadPostBySlug as any).mockResolvedValue(samplePost({ slug: 'hidden', draft: true }));

      await request(app).get('/api/posts/hidden').expect(404);
    });
  });

  describe('Tags Endpoint', () => {
    it('should return unique tags collected from posts', async () => {
      const { loadAllPosts } = await import('../../utils/blogPosts');
      (loadAllPosts as any).mockResolvedValue([
        samplePost({ tags: [{ id: 1, name: 'tech' }, { id: 2, name: 'web' }] }),
        samplePost({ id: 2, slug: 'b', tags: [{ id: 1, name: 'tech' }] }),
      ]);

      const res = await request(app).get('/api/tags').expect(200);
      const names = res.body.map((t: any) => t.name).sort();
      expect(names).toEqual(['tech', 'web']);
    });

    it('should handle empty tags gracefully', async () => {
      const { loadAllPosts } = await import('../../utils/blogPosts');
      (loadAllPosts as any).mockResolvedValue([]);

      const res = await request(app).get('/api/tags').expect(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('Weather Endpoints', () => {
    it('should return current weather data', async () => {
      const { weatherService } = await import('../../services/weatherService');
      const mockData = {
        temperature: 20.5,
        humidity: 65,
        windSpeed: 5.2,
        pressure: 1013.25,
        windDir: 180,
        feelsLike: 19.0,
        source: 'openweather',
        city: 'Paris',
        country: 'FR',
      };
      (weatherService.getCurrentWeather as any).mockResolvedValue(mockData);

      const res = await request(app).get('/api/weather').expect(200);
      expect(res.body).toEqual(mockData);
    });

    it('should handle weather service errors gracefully', async () => {
      const { weatherService } = await import('../../services/weatherService');
      (weatherService.getCurrentWeather as any).mockRejectedValue(new Error('Service unavailable'));

      await request(app).get('/api/weather').expect(500);
    });

    it('should validate weather history type parameter', async () => {
      await request(app).get('/api/weather/history/invalid-type').expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 when post loader throws', async () => {
      const { loadAllPosts } = await import('../../utils/blogPosts');
      (loadAllPosts as any).mockRejectedValue(new Error('Loader error'));

      await request(app).get('/api/posts').expect(500);
    });

    it('should return proper error format', async () => {
      const { loadAllPosts } = await import('../../utils/blogPosts');
      (loadAllPosts as any).mockRejectedValue(new Error('Loader error'));

      const res = await request(app).get('/api/posts').expect(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://example.com')
        .expect(200);
      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle OPTIONS requests', async () => {
      await request(app)
        .options('/api/posts')
        .set('Origin', 'http://example.com')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);
    });
  });
});

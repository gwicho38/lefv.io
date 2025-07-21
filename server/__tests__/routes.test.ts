import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { registerRoutes } from '../routes';
import fs from 'fs';
import path from 'path';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    promises: {
      readdir: vi.fn(),
      readFile: vi.fn(),
    },
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

// Mock chokidar
vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock database
vi.mock('@db', () => ({
  db: {
    query: {
      posts: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe('API Routes', () => {
  let app: express.Express;
  let server: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    server = registerRoutes(app);
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('GET /api/posts', () => {
    it('should return blog posts', async () => {
      const mockFiles = ['post1.md', 'post2.md'];
      const mockFileContent = `---
title: Test Post
date: 2024-01-01
tags: ['test', 'blog']
---

This is a test post content.`;

      (fs.promises.readdir as any).mockResolvedValue(mockFiles);
      (fs.promises.readFile as any).mockResolvedValue(mockFileContent);

      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title', 'Test Post');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('tags');
    });

    it('should handle errors gracefully', async () => {
      (fs.promises.readdir as any).mockRejectedValue(new Error('File system error'));

      const response = await request(app)
        .get('/api/posts')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to load posts');
    });
  });

  describe('GET /api/tags', () => {
    it('should return unique tags from all posts', async () => {
      const mockFiles = ['post1.md', 'post2.md'];
      const mockFileContent1 = `---
title: Post 1
tags: ['javascript', 'react']
---
Content 1`;
      const mockFileContent2 = `---
title: Post 2
tags: ['javascript', 'node']
---
Content 2`;

      (fs.promises.readdir as any).mockResolvedValue(mockFiles);
      (fs.promises.readFile as any)
        .mockResolvedValueOnce(mockFileContent1)
        .mockResolvedValueOnce(mockFileContent2);

      const response = await request(app)
        .get('/api/tags')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(3); // javascript, react, node
      expect(response.body.map((tag: any) => tag.name)).toContain('javascript');
      expect(response.body.map((tag: any) => tag.name)).toContain('react');
      expect(response.body.map((tag: any) => tag.name)).toContain('node');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /api/weather', () => {
    it('should return error when API keys are missing', async () => {
      // Ensure environment variables are not set
      delete process.env.AMBIENT_API_KEY;
      delete process.env.AMBIENT_APP_KEY;

      const response = await request(app)
        .get('/api/weather')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Weather API keys not configured');
    });
  });
});
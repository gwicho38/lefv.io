import { describe, it, expect, vi } from 'vitest';
import app from '../index';

// The shell and static files come from the assets binding; stub it so these
// tests cover only the Worker's own routing decisions.
const env = {
  ASSETS: {
    fetch: vi.fn(async (req: Request) => {
      const path = new URL(req.url).pathname;
      if (path === '/index.html' || path.startsWith('/assets/')) {
        return new Response('<!doctype html>', { status: 200 });
      }
      return new Response('missing', { status: 404 });
    }),
  },
} as any;

const get = (path: string) =>
  app.fetch(new Request(`https://lefv.io${path}`), env);

describe('feed', () => {
  it('serves the feed as RSS', async () => {
    const res = await get('/feed.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/rss+xml');
  });

  it.each(['/rss', '/rss.xml', '/feed', '/feed.rss', '/atom.xml', '/index.xml'])(
    'redirects %s to the feed, because readers guess these',
    async path => {
      const res = await get(path);
      expect(res.status).toBe(301);
      expect(res.headers.get('location')).toBe('/feed.xml');
    },
  );
});

describe('status codes', () => {
  it.each(['/', '/about', '/blog'])('serves %s as a real page', async path => {
    expect((await get(path)).status).toBe(200);
  });

  it('serves an existing post', async () => {
    expect((await get('/blog/hello-world')).status).toBe(200);
  });

  it('returns 404 for an unknown page rather than a 200 shell', async () => {
    const res = await get('/nonsense');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('text/html');
  });

  it('returns 404 for a post that does not exist', async () => {
    expect((await get('/blog/no-such-post')).status).toBe(404);
  });

  it('returns JSON 404 for unknown API paths', async () => {
    const res = await get('/api/bogus');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('still serves static assets', async () => {
    expect((await get('/assets/index-abc.js')).status).toBe(200);
  });
});

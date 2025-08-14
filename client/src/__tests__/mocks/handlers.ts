import { http, HttpResponse } from 'msw';
import { mockBlogPosts, mockTags, mockWeatherData, mockGalleryImages, mockHealthStatus } from '../fixtures/mockData';

// MSW handlers for mocking API responses
export const handlers = [
  // Health check endpoint
  http.get('/api/health', () => {
    return HttpResponse.json(mockHealthStatus.healthy);
  }),

  // Blog posts endpoints
  http.get('/api/posts', ({ request }) => {
    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');

    if (tag) {
      const filteredPosts = mockBlogPosts.filter(post => 
        post.tags.includes(tag)
      );
      return HttpResponse.json(filteredPosts);
    }

    return HttpResponse.json(mockBlogPosts);
  }),

  http.get('/api/posts/:slug', ({ params }) => {
    const { slug } = params;
    const post = mockBlogPosts.find(p => p.slug === slug);

    if (!post) {
      return new HttpResponse(null, { 
        status: 404,
        statusText: 'Post not found' 
      });
    }

    return HttpResponse.json(post);
  }),

  // Tags endpoint
  http.get('/api/tags', () => {
    return HttpResponse.json(mockTags);
  }),

  // Weather endpoints
  http.get('/api/weather', () => {
    return HttpResponse.json(mockWeatherData.current);
  }),

  http.get('/api/weather/history/:type', ({ params }) => {
    const { type } = params;

    if (type === 'temperature') {
      return HttpResponse.json(mockWeatherData.history.temperature);
    } else if (type === 'precipitation') {
      return HttpResponse.json(mockWeatherData.history.precipitation);
    } else {
      return new HttpResponse(null, {
        status: 400,
        statusText: 'Invalid type parameter'
      });
    }
  }),

  // Gallery endpoint
  http.get('/api/galleries', () => {
    return HttpResponse.json(mockGalleryImages);
  }),

  // Error simulation handlers
  http.get('/api/posts/error', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error'
    });
  }),

  http.get('/api/weather/error', () => {
    return HttpResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }),

  // Rate limiting simulation
  http.get('/api/rate-limit-test', () => {
    return HttpResponse.json(
      { error: 'Too Many Requests' },
      { status: 429 }
    );
  }),

  // Network error simulation
  http.get('/api/network-error', () => {
    return HttpResponse.error();
  }),
];

// Handlers for error scenarios
export const errorHandlers = [
  // Database error
  http.get('/api/posts', () => {
    return HttpResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }),

  // Weather service unavailable
  http.get('/api/weather', () => {
    return HttpResponse.json(
      { error: 'Weather service temporarily unavailable' },
      { status: 503 }
    );
  }),

  // Unhealthy status
  http.get('/api/health', () => {
    return HttpResponse.json(mockHealthStatus.unhealthy);
  }),
];
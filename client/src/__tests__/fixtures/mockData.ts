// Mock data for testing
export const mockBlogPosts = [
  {
    id: '1',
    slug: 'first-blog-post',
    title: 'My First Blog Post',
    description: 'This is the description of my first blog post',
    content: '# My First Blog Post\n\nThis is the content of my first blog post.\n\n## Section 1\n\nLorem ipsum dolor sit amet.',
    date: '2024-01-15',
    readingTime: 3,
    tags: ['technology', 'web-development'],
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: '2',
    slug: 'second-blog-post',
    title: 'Learning React Testing',
    description: 'A comprehensive guide to testing React applications',
    content: '# Learning React Testing\n\nTesting is crucial for React apps.\n\n## Why Test?\n\nBecause bugs are bad.',
    date: '2024-01-20',
    readingTime: 5,
    tags: ['react', 'testing', 'javascript'],
    createdAt: new Date('2024-01-20T14:00:00Z'),
    updatedAt: new Date('2024-01-20T14:00:00Z')
  },
  {
    id: '3',
    slug: 'weather-api-integration',
    title: 'Building a Weather API Integration',
    description: 'How to integrate multiple weather APIs for better reliability',
    content: '# Weather API Integration\n\nReliability through redundancy.\n\n## Multiple Sources\n\nUse Ambient Weather and OpenWeatherMap.',
    date: '2024-01-25',
    readingTime: 7,
    tags: ['api', 'weather', 'integration'],
    createdAt: new Date('2024-01-25T09:00:00Z'),
    updatedAt: new Date('2024-01-25T09:00:00Z')
  }
];

export const mockTags = [
  {
    id: '1',
    name: 'technology',
    slug: 'technology',
    postCount: 2
  },
  {
    id: '2',
    name: 'web-development',
    slug: 'web-development',
    postCount: 1
  },
  {
    id: '3',
    name: 'react',
    slug: 'react',
    postCount: 1
  },
  {
    id: '4',
    name: 'testing',
    slug: 'testing',
    postCount: 1
  },
  {
    id: '5',
    name: 'javascript',
    slug: 'javascript',
    postCount: 1
  },
  {
    id: '6',
    name: 'api',
    slug: 'api',
    postCount: 1
  },
  {
    id: '7',
    name: 'weather',
    slug: 'weather',
    postCount: 1
  },
  {
    id: '8',
    name: 'integration',
    slug: 'integration',
    postCount: 1
  }
];

export const mockWeatherData = {
  current: {
    temperature: 72.5,
    humidity: 65,
    windSpeed: 5.2,
    pressure: 29.92,
    windDir: 180,
    hourlyrainin: 0.05,
    dailyrainin: 0.15,
    weeklyrainin: 1.2,
    monthlyrainin: 3.5,
    feelsLike: 71.0,
    dewPoint: 58.0,
    lastRain: '2024-01-01T10:00:00Z',
    description: 'partly cloudy',
    city: 'Paris',
    country: 'FR',
    source: 'openweather' as const
  },
  history: {
    temperature: [
      { time: '2024-01-01T00:00:00Z', value: 68.0 },
      { time: '2024-01-01T01:00:00Z', value: 67.5 },
      { time: '2024-01-01T02:00:00Z', value: 67.0 },
      { time: '2024-01-01T03:00:00Z', value: 66.5 },
      { time: '2024-01-01T04:00:00Z', value: 66.0 },
      { time: '2024-01-01T05:00:00Z', value: 65.5 },
      { time: '2024-01-01T06:00:00Z', value: 66.0 },
      { time: '2024-01-01T07:00:00Z', value: 67.0 },
      { time: '2024-01-01T08:00:00Z', value: 68.5 },
      { time: '2024-01-01T09:00:00Z', value: 70.0 },
      { time: '2024-01-01T10:00:00Z', value: 71.5 },
      { time: '2024-01-01T11:00:00Z', value: 73.0 },
      { time: '2024-01-01T12:00:00Z', value: 74.5 },
      { time: '2024-01-01T13:00:00Z', value: 75.0 },
      { time: '2024-01-01T14:00:00Z', value: 74.8 },
      { time: '2024-01-01T15:00:00Z', value: 74.2 },
      { time: '2024-01-01T16:00:00Z', value: 73.5 },
      { time: '2024-01-01T17:00:00Z', value: 72.8 },
      { time: '2024-01-01T18:00:00Z', value: 72.0 },
      { time: '2024-01-01T19:00:00Z', value: 71.2 },
      { time: '2024-01-01T20:00:00Z', value: 70.5 },
      { time: '2024-01-01T21:00:00Z', value: 69.8 },
      { time: '2024-01-01T22:00:00Z', value: 69.2 },
      { time: '2024-01-01T23:00:00Z', value: 68.8 }
    ],
    precipitation: [
      { time: '2024-01-01T00:00:00Z', hourly: 0.0, daily: 0.0 },
      { time: '2024-01-01T01:00:00Z', hourly: 0.0, daily: 0.0 },
      { time: '2024-01-01T02:00:00Z', hourly: 0.1, daily: 0.1 },
      { time: '2024-01-01T03:00:00Z', hourly: 0.2, daily: 0.3 },
      { time: '2024-01-01T04:00:00Z', hourly: 0.1, daily: 0.4 },
      { time: '2024-01-01T05:00:00Z', hourly: 0.0, daily: 0.4 },
      { time: '2024-01-01T06:00:00Z', hourly: 0.0, daily: 0.4 },
      { time: '2024-01-01T07:00:00Z', hourly: 0.0, daily: 0.4 },
      { time: '2024-01-01T08:00:00Z', hourly: 0.0, daily: 0.4 },
      { time: '2024-01-01T09:00:00Z', hourly: 0.05, daily: 0.45 },
      { time: '2024-01-01T10:00:00Z', hourly: 0.1, daily: 0.55 },
      { time: '2024-01-01T11:00:00Z', hourly: 0.0, daily: 0.55 }
    ]
  }
};

export const mockGalleryImages = [
  {
    id: '1',
    imageUrl: 'https://example.com/image1.jpg',
    title: 'Beautiful Sunset',
    description: 'A stunning sunset over the mountains',
    category: 'nature',
    order: 1,
    createdAt: new Date('2024-01-10T15:30:00Z')
  },
  {
    id: '2',
    imageUrl: 'https://example.com/image2.jpg',
    title: 'City Lights',
    description: 'Night view of the city skyline',
    category: 'urban',
    order: 2,
    createdAt: new Date('2024-01-12T20:45:00Z')
  },
  {
    id: '3',
    imageUrl: 'https://example.com/image3.jpg',
    title: 'Ocean Wave',
    description: 'Powerful waves crashing on the shore',
    category: 'nature',
    order: 3,
    createdAt: new Date('2024-01-15T08:15:00Z')
  }
];

export const mockHealthStatus = {
  healthy: {
    status: 'healthy',
    timestamp: '2024-01-01T12:00:00Z',
    database: {
      connected: true,
      errors: []
    },
    environment: 'test'
  },
  unhealthy: {
    status: 'unhealthy',
    timestamp: '2024-01-01T12:00:00Z',
    database: {
      connected: false,
      errors: ['Connection timeout', 'Invalid credentials']
    },
    environment: 'test'
  }
};

// Mock user data (for future authentication features)
export const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    lastLogin: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    username: 'viewer',
    email: 'viewer@example.com',
    role: 'viewer',
    createdAt: new Date('2024-01-05T12:00:00Z'),
    lastLogin: new Date('2024-01-14T14:20:00Z')
  }
];
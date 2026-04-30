# API Documentation

## Base URL

- Development: `http://localhost:5001`
- Production: `https://lefv.io`

## Authentication

Currently, the API does not require authentication for public endpoints. Session-based authentication is available for future admin endpoints.

## Rate Limiting

Different endpoints have different rate limits:

- **General endpoints**: 100 requests per minute
- **Moderate endpoints**: 30 requests per minute  
- **Strict endpoints** (weather): 10 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when the limit resets

## Endpoints

### Health Check

#### `GET /api/health`

Check the health status of the application and its dependencies.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "database": {
    "connected": true,
    "errors": []
  }
}
```

### Blog Posts

#### `GET /api/posts`

Retrieve all blog posts.

**Query Parameters:**
- `tag` (optional): Filter posts by tag

**Response:**
```json
[
  {
    "id": "1",
    "slug": "my-first-post",
    "title": "My First Post",
    "description": "Post description",
    "content": "Full markdown content",
    "date": "2024-01-01",
    "readingTime": 5,
    "tags": ["technology", "web"],
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
]
```

#### `GET /api/posts/:slug`

Retrieve a single blog post by slug.

**Response:**
```json
{
  "id": "1",
  "slug": "my-first-post",
  "title": "My First Post",
  "description": "Post description",
  "content": "Full markdown content",
  "date": "2024-01-01",
  "readingTime": 5,
  "tags": ["technology", "web"],
  "createdAt": "2024-01-01T12:00:00Z",
  "updatedAt": "2024-01-01T12:00:00Z"
}
```

#### `GET /api/tags`

Retrieve all available tags with post counts.

**Response:**
```json
[
  {
    "id": "1",
    "name": "technology",
    "slug": "technology",
    "postCount": 5
  },
  {
    "id": "2",
    "name": "web",
    "slug": "web",
    "postCount": 3
  }
]
```

### Weather

#### `GET /api/weather`

Get current weather data. Falls back to OpenWeatherMap if Ambient Weather station is unavailable.

**Response:**
```json
{
  "temperature": 72.5,
  "humidity": 65,
  "windSpeed": 5.2,
  "pressure": 29.92,
  "windDir": 180,
  "hourlyrainin": 0.05,
  "dailyrainin": 0.15,
  "weeklyrainin": 1.2,
  "monthlyrainin": 3.5,
  "feelsLike": 71.0,
  "dewPoint": 58.0,
  "lastRain": "2024-01-01T10:00:00Z",
  "description": "partly cloudy",
  "city": "Paris",
  "country": "FR",
  "source": "openweather"
}
```

**Source Values:**
- `ambient`: Data from Ambient Weather station
- `openweather`: Data from OpenWeatherMap API

#### `GET /api/weather/history/:type`

Get historical weather data (only available with Ambient Weather station).

**Parameters:**
- `type`: Either `temperature` or `precipitation`

**Response for temperature:**
```json
[
  {
    "time": "2024-01-01T12:00:00Z",
    "value": 72.5
  }
]
```

**Response for precipitation:**
```json
[
  {
    "time": "2024-01-01T12:00:00Z",
    "hourly": 0.05,
    "daily": 0.15
  }
]
```

### Gallery

#### `GET /api/galleries`

Retrieve gallery images.

**Response:**
```json
[
  {
    "id": "1",
    "imageUrl": "https://example.com/image.jpg",
    "title": "Image Title",
    "description": "Image description",
    "category": "photography",
    "order": 1,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service temporarily unavailable

## CORS

CORS is enabled for production domains specified in the `ALLOWED_ORIGINS` environment variable. In development, all origins are allowed.

## WebSocket Support

WebSocket connections are supported at the same base URL for real-time features (future implementation).

## Versioning

The API currently does not use versioning. Breaking changes will be communicated in advance and a migration period will be provided.

## Environment Configuration

See `.env.example` for all available configuration options including:
- Database connections
- Weather API keys
- Session secrets
- CORS origins
- Logging levels
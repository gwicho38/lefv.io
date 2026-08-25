import type { Express } from "express";
import { createServer, type Server } from "http";
import { logError } from "./utils/logger";
import { asyncHandler, errorResponse, validateEnvVars } from "./utils/validation";
import { rateLimiters } from "./utils/rateLimiter";
import { weatherService } from "./services/weatherService";
import {
  loadAllPosts,
  loadPostBySlug,
  sortPosts,
  parseSortOrder,
  collectTags,
  renderFeed,
} from "./utils/blogPosts";

export function registerRoutes(app: Express): Server {
  // Health check endpoint
  app.get("/api/health", asyncHandler(async (_req, res) => {
    const posts = await loadAllPosts();
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      posts: posts.length,
      environment: process.env.NODE_ENV || "development",
    });
  }));

  // Apply rate limiting to all API routes
  app.use("/api", rateLimiters.api);

  // Blog routes
  app.get("/api/posts", asyncHandler(async (req, res) => {
    try {
      const order = parseSortOrder(req.query.sort);
      const posts = sortPosts(await loadAllPosts(), order);
      res.status(200).json(posts);
    } catch (error) {
      logError("Error loading blog posts", error);
      return errorResponse(res, 500, "Failed to load posts");
    }
  }));

  app.get("/api/posts/:slug", asyncHandler(async (req, res) => {
    try {
      const post = await loadPostBySlug(req.params.slug);
      if (!post || post.draft) {
        return errorResponse(res, 404, "Post not found");
      }
      res.status(200).json(post);
    } catch (error) {
      logError("Error loading blog post", error);
      return errorResponse(res, 500, "Failed to load post");
    }
  }));

  app.get("/feed.xml", asyncHandler(async (_req, res) => {
    try {
      const posts = sortPosts(await loadAllPosts(), "newest").slice(0, 50);
      const site = process.env.SITE_URL || "https://lefv.info";
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.status(200).send(renderFeed(posts, site));
    } catch (error) {
      logError("Error generating RSS feed", error);
      return errorResponse(res, 500, "Failed to generate feed");
    }
  }));

  app.get("/api/tags", asyncHandler(async (_req, res) => {
    try {
      res.json(collectTags(await loadAllPosts()));
    } catch (error) {
      logError("Error fetching tags", error);
      return errorResponse(res, 500, "Failed to fetch tags");
    }
  }));

  // Enhanced weather route with fallback to OpenWeatherMap
  app.get("/api/weather", rateLimiters.strict, asyncHandler(async (req, res) => {
    try {
      const weatherData = await weatherService.getCurrentWeather();
      res.json(weatherData);
    } catch (error) {
      logError("Weather API error", error);
      return errorResponse(res, 500, "Failed to fetch weather data");
    }
  }));

  app.get("/api/weather/history/:type", rateLimiters.strict, asyncHandler(async (req, res) => {
    const { type } = req.params;

    // Validate request shape before checking server-side configuration so
    // bad input always surfaces as 400, regardless of env state.
    if (!['temperature', 'precipitation'].includes(type)) {
      return errorResponse(res, 400, "Invalid type parameter. Must be 'temperature' or 'precipitation'");
    }

    try {
      validateEnvVars(['AMBIENT_API_KEY', 'AMBIENT_APP_KEY', 'AMBIENT_MAC_ADDRESS']);
    } catch (error) {
      return errorResponse(res, 500, "Weather API keys or MAC address not configured");
    }

    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

      // Note: Ambient Weather API requires API keys in query params
      const params = new URLSearchParams({
        apiKey: process.env.AMBIENT_API_KEY!,
        applicationKey: process.env.AMBIENT_APP_KEY!,
        endDate: endDate.toISOString(),
        startDate: startDate.toISOString()
      });
      
      const response = await fetch(
        `https://api.ambientweather.net/v1/devices/${process.env.AMBIENT_MAC_ADDRESS}/data?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Weather history API request failed');
      }

      const data = await response.json() as any;
      
      if (type === 'temperature') {
        const formattedData = data.map((item: any) => ({
          time: item.date || item.dateutc,
          value: item.tempf || 0
        }));
        res.json(formattedData);
      } else {
        const formattedData = data.map((item: any) => ({
          time: item.date || item.dateutc,
          hourly: item.hourlyrainin || 0,
          daily: item.dailyrainin || 0
        }));
        res.json(formattedData);
      }
    } catch (error) {
      logError("Weather history API error", error);
      return errorResponse(res, 500, "Failed to fetch historical weather data");
    }
  }));

  const httpServer = createServer(app);
  return httpServer;
}
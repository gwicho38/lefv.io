import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { posts, tags, postTags, galleries } from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chokidar from "chokidar";
import { logError, logInfo, logWarn, logDebug } from "./utils/logger";
import { asyncHandler, errorResponse, validateEnvVars } from "./utils/validation";
import { checkDatabaseHealth, validateDatabaseConfig } from "./utils/database";
import { rateLimiters } from "./utils/rateLimiter";
import { weatherService } from "./services/weatherService";
import { z } from "zod";
import { loadAllPosts, loadPostBySlug, sortPosts, parseSortOrder } from "./utils/blogPosts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSTS_DIRECTORY = path.join(__dirname, "../content/blog");

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIRECTORY)) {
  fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
}

// The /api/posts route reads markdown directly from disk, so the DB mirror is
// only useful when something downstream (e.g. analytics) queries the posts
// table. Default: skip the watcher — it just generates noise when the DB is
// unreachable. Opt in by setting BLOG_DB_SYNC=1.
const BLOG_DB_SYNC_ENABLED = process.env.BLOG_DB_SYNC === "1";

// Watch for file changes in the posts directory
const watcher = chokidar.watch(POSTS_DIRECTORY, {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

// Function to process markdown files and update database
async function processMarkdownFile(filePath: string) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const html = await marked(content);

    // Insert or update post in database
    const [post] = await db.insert(posts)
      .values({
        title: data.title || path.basename(filePath, '.md'),
        content: html,
        createdAt: data.date ? new Date(data.date) : new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: posts.title, // Use the column reference instead of string
        set: {
          content: html,
          updatedAt: new Date()
        }
      }).returning();

    // Process tags if present
    if (data.tags && Array.isArray(data.tags)) {
      // First remove existing tags for this post
      await db.delete(postTags).where(eq(postTags.postId, post.id));

      // Add new tags
      for (const tagName of data.tags) {
        const [tag] = await db.insert(tags)
          .values({ name: tagName })
          .onConflictDoUpdate({
            target: tags.name, // Use the column reference here too
            set: { name: tagName }
          })
          .returning();

        await db.insert(postTags)
          .values({ postId: post.id, tagId: tag.id });
      }
    }
  } catch (error) {
    logError(`Error processing markdown file: ${filePath}`, error);
  }
}

// Watch for changes in markdown files (DB mirror; opt-in via BLOG_DB_SYNC=1)
if (BLOG_DB_SYNC_ENABLED) {
  watcher
    .on('add', processMarkdownFile)
    .on('change', processMarkdownFile)
    .on('unlink', async (filePath) => {
      try {
        const fileName = path.basename(filePath, '.md');
        await db.delete(posts).where(eq(posts.title, fileName));
      } catch (error) {
        logError(`Error removing post for unlinked file: ${filePath}`, error);
      }
    });
} else {
  logInfo("Blog DB sync disabled (set BLOG_DB_SYNC=1 to enable)");
}

export function registerRoutes(app: Express): Server {
  // Health check endpoint
  app.get("/api/health", asyncHandler(async (req, res) => {
    const dbConfig = validateDatabaseConfig();
    const dbHealth = dbConfig.isValid ? await checkDatabaseHealth() : false;
    
    const health = {
      status: dbHealth ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealth,
        configValid: dbConfig.isValid,
        errors: dbConfig.errors
      },
      environment: process.env.NODE_ENV || 'development'
    };
    
    const statusCode = dbHealth ? 200 : 503;
    res.status(statusCode).json(health);
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
      const escape = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
      const items = posts.map(p => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${site}/blog/${p.slug}</link>
      <guid isPermaLink="true">${site}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
      <description>${escape(p.excerpt)}</description>
      ${p.tags.map(t => `<category>${escape(t.name)}</category>`).join("")}
    </item>`).join("");
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>lefv.info</title>
    <link>${site}</link>
    <description>Blog posts from lefv.info</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;
      res.set("Content-Type", "application/rss+xml; charset=utf-8");
      res.status(200).send(xml);
    } catch (error) {
      logError("Error generating RSS feed", error);
      return errorResponse(res, 500, "Failed to generate feed");
    }
  }));


  app.get("/api/tags", asyncHandler(async (_req, res) => {
    try {
      const posts = await loadAllPosts();
      const allTags = new Set<string>();
      for (const post of posts) {
        for (const tag of post.tags) {
          allTags.add(tag.name);
        }
      }
      const tagsArray = Array.from(allTags).map((tag, index) => ({
        id: index + 1,
        name: tag,
      }));
      res.json(tagsArray);
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

      const data = await response.json();
      
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
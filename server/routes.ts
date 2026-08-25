import type { Express } from "express";
import { createServer, type Server } from "http";
import { logError } from "./utils/logger";
import { asyncHandler, errorResponse } from "./utils/validation";
import { rateLimiters } from "./utils/rateLimiter";
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

  const httpServer = createServer(app);
  return httpServer;
}
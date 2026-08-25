import { Hono } from "hono";
import { cors } from "hono/cors";
import bakedPosts from "./posts.generated.json";
import type { BlogPost } from "../lib/blogSort";
import { collectTags, parseSortOrder, renderFeed, sortPosts } from "../lib/blogSort";

type Env = {
  ASSETS: Fetcher;
  SITE_URL?: string;
};

const allPosts = bakedPosts as BlogPost[];
const published = allPosts.filter(p => !p.draft);

const app = new Hono<{ Bindings: Env }>();

// Credentials stay off: these endpoints are public and unauthenticated, so a
// credentialed cross-origin read has nothing to steal. Adding auth means revisiting this.
app.use("/api/*", cors({ origin: "*", credentials: false }));

app.get("/api/health", c => c.json({
  status: "healthy",
  timestamp: new Date().toISOString(),
  posts: published.length,
  environment: "production",
}));

app.get("/api/posts", c =>
  c.json(sortPosts(published, parseSortOrder(c.req.query("sort")))));

app.get("/api/posts/:slug", c => {
  const post = allPosts.find(p => p.slug === c.req.param("slug"));
  return post && !post.draft
    ? c.json(post)
    : c.json({ message: "Post not found" }, 404);
});

app.get("/api/tags", c => c.json(collectTags(published)));

app.get("/feed.xml", c => {
  const site = c.env.SITE_URL || "https://lefv.io";
  const xml = renderFeed(sortPosts(published, "newest").slice(0, 50), site);
  return c.body(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8" });
});

// Unknown API paths must not fall through to the SPA shell.
app.all("/api/*", c => c.json({ message: "Not found" }, 404));

app.all("*", c => c.env.ASSETS.fetch(c.req.raw));

export default app;

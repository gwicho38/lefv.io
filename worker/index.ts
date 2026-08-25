import { Hono } from "hono";
import { cors } from "hono/cors";
import bakedPosts from "./posts.generated.json";
import type { BlogPost } from "../lib/blogSort";
import { collectTags, parseSortOrder, renderFeed, sortPosts } from "../lib/blogSort";
import { WeatherService } from "../lib/weather";

type Env = {
  ASSETS: Fetcher;
  SITE_URL?: string;
  ALLOWED_ORIGINS?: string;
  AMBIENT_API_KEY?: string;
  AMBIENT_APP_KEY?: string;
  AMBIENT_MAC_ADDRESS?: string;
  OPENWEATHER_API_KEY?: string;
  OPENWEATHER_CITY?: string;
  OPENWEATHER_COUNTRY?: string;
};

const allPosts = bakedPosts as BlogPost[];
const published = allPosts.filter(p => !p.draft);

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors({
  origin: (origin, c) => {
    const allowed = c.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim());
    return !allowed || allowed.includes(origin) ? origin : null;
  },
  credentials: true,
}));

const weatherFor = (env: Env) => new WeatherService(() => ({
  ambientApiKey: env.AMBIENT_API_KEY,
  ambientAppKey: env.AMBIENT_APP_KEY,
  ambientMacAddress: env.AMBIENT_MAC_ADDRESS,
  openWeatherApiKey: env.OPENWEATHER_API_KEY,
  openWeatherCity: env.OPENWEATHER_CITY,
  openWeatherCountry: env.OPENWEATHER_COUNTRY,
}));

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
  const site = c.env.SITE_URL || "https://lefv.info";
  const xml = renderFeed(sortPosts(published, "newest").slice(0, 50), site);
  return c.body(xml, 200, { "Content-Type": "application/rss+xml; charset=utf-8" });
});

app.get("/api/weather", async c => {
  try {
    return c.json(await weatherFor(c.env).getCurrentWeather());
  } catch {
    return c.json({ message: "Failed to fetch weather data" }, 500);
  }
});

app.get("/api/weather/history/:type", async c => {
  const type = c.req.param("type");
  if (type !== "temperature" && type !== "precipitation") {
    return c.json({ message: "Invalid type parameter. Must be 'temperature' or 'precipitation'" }, 400);
  }
  try {
    return c.json(await weatherFor(c.env).getWeatherHistory(type));
  } catch {
    return c.json({ message: "Weather API keys or MAC address not configured" }, 500);
  }
});

app.all("*", c => c.env.ASSETS.fetch(c.req.raw));

export default app;

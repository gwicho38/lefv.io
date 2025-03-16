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
import { log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const POSTS_DIRECTORY = path.join(__dirname, "../content/blog");

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIRECTORY)) {
  fs.mkdirSync(POSTS_DIRECTORY, { recursive: true });
}

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
    console.error(`Error processing markdown file: ${filePath}`, error);
  }
}

// Watch for changes in markdown files
watcher
  .on('add', processMarkdownFile)
  .on('change', processMarkdownFile)
  .on('unlink', async (filePath) => {
    const fileName = path.basename(filePath, '.md');
    await db.delete(posts).where(eq(posts.title, fileName));
  });

export function registerRoutes(app: Express): Server {
  // // Blog routes
  // app.get("/api/posts", async (req, res) => {
  //   console.log(process.env.DATABASE_URL)
  //   try {
  //     const allPosts = await db.query.posts.findMany({
  //       orderBy: [desc(posts.createdAt)],
  //       with: {
  //         postTags: {
  //           with: {
  //             tag: true
  //           }
  //         }
  //       }
  //     });

  //     // Transform the data to match the expected format
  //     const transformedPosts = allPosts.map(post => ({
  //       ...post,
  //       tags: post.postTags.map(pt => pt.tag)
  //     }));

  //     res.json(transformedPosts);
  //   } catch (error) {
  //     log(error);
  //     res.status(500).json({ error: "Failed to fetch posts" });
  //   }
  // });

  // Blog routes
  app.get("/api/posts", async (req, res) => {
    const BLOG_DIR = path.join(process.cwd(), "content/blog");
    try {
      const filenames = await fs.promises.readdir(BLOG_DIR);
      const posts = await Promise.all(
        filenames.map(async (filename, index) => {
          const filePath = path.join(BLOG_DIR, filename);
          const content = await fs.promises.readFile(filePath, "utf-8");
          const parsed = matter(content);
  
          return {
            id: index + 1,
            title: parsed.data.title || filename.replace(".md", "").replace(/-/g, " "),
            content: parsed.content.trim(),
            createdAt: parsed.data.date || new Date().toISOString(),
            tags: Array.isArray(parsed.data.tags)
              ? parsed.data.tags.map((tag, i) => ({ id: i + 1, name: tag })) // Ensure `{ id, name }`
              : [],
          };
        })
      );
  
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to load posts" });
    }
  });  

  app.get("/api/tags", async (req, res) => {
    const BLOG_DIR = path.join(process.cwd(), "content/blog");
    try {
      const filenames = await fs.promises.readdir(BLOG_DIR);
  
      const allTags = new Set<string>();
  
      await Promise.all(
        filenames.map(async (filename) => {
          const filePath = path.join(BLOG_DIR, filename);
          const fileContent = await fs.promises.readFile(filePath, "utf-8");
          const { data } = matter(fileContent);
          if (data.tags && Array.isArray(data.tags)) {
            data.tags.forEach((tag: string) => allTags.add(tag));
          }
        })
      );
  
      // ✅ Ensure tags have unique IDs
      const tagsArray = Array.from(allTags).map((tag, index) => ({
        id: index + 1,
        name: tag,
      }));
  
      res.json(tagsArray);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });  

  // Enhanced weather route with more data points
  app.get("/api/weather", async (req, res) => {
    try {
      if (!process.env.AMBIENT_API_KEY || !process.env.AMBIENT_APP_KEY) {
        return res.status(500).json({ error: "Weather API keys not configured" });
      }

      const response = await fetch(
        `https://api.ambientweather.net/v1/devices?apiKey=${process.env.AMBIENT_API_KEY}&applicationKey=${process.env.AMBIENT_APP_KEY}`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      const lastData = data[0]?.lastData;

      if (!lastData) {
        return res.status(404).json({ error: "No weather data available" });
      }

      res.json({
        temperature: lastData.tempf || 0,
        humidity: lastData.humidity || 0,
        windSpeed: lastData.windspeedmph || 0,
        pressure: lastData.baromrelin || 0,
        windDir: lastData.winddir || 0,
        hourlyrainin: lastData.hourlyrainin || 0,
        dailyrainin: lastData.dailyrainin || 0,
        weeklyrainin: lastData.weeklyrainin || 0,
        monthlyrainin: lastData.monthlyrainin || 0,
        feelsLike: lastData.feelsLike || lastData.tempf || 0,
        dewPoint: lastData.dewPoint || 0,
        lastRain: lastData.lastRain || null
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  app.get("/api/weather/history/:type", async (req, res) => {
    try {
      if (!process.env.AMBIENT_API_KEY || !process.env.AMBIENT_APP_KEY || !process.env.AMBIENT_MAC_ADDRESS) {
        return res.status(500).json({ error: "Weather API keys or MAC address not configured" });
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

      const response = await fetch(
        `https://api.ambientweather.net/v1/devices/${process.env.AMBIENT_MAC_ADDRESS}/data?` +
        `apiKey=${process.env.AMBIENT_API_KEY}&` +
        `applicationKey=${process.env.AMBIENT_APP_KEY}&` +
        `endDate=${endDate.toISOString()}&` +
        `startDate=${startDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Weather history API request failed');
      }

      const data = await response.json();
      const transformedData = data.map((point: any) => ({
        timestamp: new Date(point.dateutc).getTime(),
        [req.params.type === 'temperature' ? 'temperature' : 'precipitation']:
          req.params.type === 'temperature' ? point.tempf : point.hourlyrainin
      }));

      res.json(transformedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch historical weather data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
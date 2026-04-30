import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogTag = { id: number; name: string };

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  readingTime: number;
  createdAt: string;
  draft: boolean;
  tags: BlogTag[];
};

export type SortOrder = "newest" | "oldest" | "title";

const WORDS_PER_MINUTE = 200;
const EXCERPT_CHARS = 220;

function slugify(filename: string): string {
  return filename
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(frontmatterExcerpt: unknown, body: string): string {
  if (typeof frontmatterExcerpt === "string" && frontmatterExcerpt.trim()) {
    return frontmatterExcerpt.trim();
  }
  const plain = stripMarkdown(body);
  if (plain.length <= EXCERPT_CHARS) return plain;
  const cut = plain.slice(0, EXCERPT_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function readingTimeMinutes(body: string): number {
  const words = stripMarkdown(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export async function loadAllPosts(opts: { includeDrafts?: boolean } = {}): Promise<BlogPost[]> {
  const filenames = (await fs.promises.readdir(BLOG_DIR)).filter(f => f.endsWith(".md"));
  const posts = await Promise.all(
    filenames.map(async (filename, index) => {
      const filePath = path.join(BLOG_DIR, filename);
      const raw = await fs.promises.readFile(filePath, "utf-8");
      const { data, content } = matter(raw);
      const body = content.trim();
      const slug = slugify(filename);

      return {
        id: index + 1,
        slug,
        title: data.title || filename.replace(/\.md$/i, "").replace(/-/g, " "),
        content: body,
        excerpt: buildExcerpt(data.excerpt, body),
        readingTime: readingTimeMinutes(body),
        createdAt: data.date
          ? new Date(data.date).toISOString()
          : new Date().toISOString(),
        draft: data.draft === true,
        tags: Array.isArray(data.tags)
          ? data.tags.map((tag: string, i: number) => ({ id: i + 1, name: String(tag) }))
          : [],
      } satisfies BlogPost;
    })
  );

  return opts.includeDrafts ? posts : posts.filter(p => !p.draft);
}

export function sortPosts(posts: BlogPost[], order: SortOrder): BlogPost[] {
  const out = [...posts];
  if (order === "oldest") {
    out.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else if (order === "title") {
    out.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return out;
}

export function parseSortOrder(value: unknown): SortOrder {
  return value === "oldest" || value === "title" ? value : "newest";
}

export async function loadPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await loadAllPosts({ includeDrafts: true });
  return all.find(p => p.slug === slug) ?? null;
}

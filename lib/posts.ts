import fs from "fs";
import path from "path";
import matter from "gray-matter";

import type { BlogPost } from "./blogSort";

export type { BlogPost, BlogTag, SortOrder } from "./blogSort";
export { sortPosts, parseSortOrder, collectTags, renderFeed } from "./blogSort";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

const WORDS_PER_MINUTE = 200;
const EXCERPT_CHARS = 220;

export const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})[-_]/;

export function slugify(filename: string): string {
  return filename
    .replace(/\.md$/i, "")
    .replace(DATE_PREFIX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function titleFromFilename(filename: string): string {
  return filename
    .replace(/\.md$/i, "")
    .replace(DATE_PREFIX, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, ch => ch.toUpperCase());
}

// A post may open with its own H1. Use it as the title so the body does not
// repeat the heading the page already renders.
export function splitLeadingHeading(body: string): { heading?: string; rest: string } {
  const match = body.match(/^#\s+(.+?)\s*$/m);
  if (!match || body.slice(0, match.index).trim()) return { rest: body };
  return { heading: match[1].trim(), rest: body.slice(match.index! + match[0].length).trim() };
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

export function readingTimeMinutes(body: string): number {
  const words = stripMarkdown(body).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// Dates come from frontmatter, then a YYYY-MM-DD filename prefix, then the
// file's own mtime — never "now", which would float the post to the top.
export function resolveDate(frontmatter: unknown, filename: string, mtime: Date): Date {
  if (frontmatter) {
    const parsed = new Date(frontmatter as string);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const prefixed = filename.match(DATE_PREFIX);
  if (prefixed) {
    const parsed = new Date(prefixed[1]);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return mtime;
}

export async function loadAllPosts(opts: { includeDrafts?: boolean } = {}): Promise<BlogPost[]> {
  const filenames = (await fs.promises.readdir(BLOG_DIR)).filter(f => f.endsWith(".md"));
  const posts = await Promise.all(
    filenames.map(async (filename, index) => {
      const filePath = path.join(BLOG_DIR, filename);
      const raw = await fs.promises.readFile(filePath, "utf-8");
      const { data, content } = matter(raw);
      const { heading, rest } = splitLeadingHeading(content.trim());
      const title = data.title || heading || titleFromFilename(filename);
      // Keep the H1 in the body only when it is not doing duty as the title.
      const body = data.title && heading ? content.trim() : rest;
      const slug = slugify(filename);
      const stat = await fs.promises.stat(filePath);

      return {
        id: index + 1,
        slug,
        title,
        content: body,
        excerpt: buildExcerpt(data.excerpt, body),
        readingTime: readingTimeMinutes(body),
        createdAt: resolveDate(data.date, filename, stat.mtime).toISOString(),
        draft: data.draft === true,
        tags: Array.isArray(data.tags)
          ? data.tags.map((tag: string, i: number) => ({ id: i + 1, name: String(tag) }))
          : [],
      } satisfies BlogPost;
    })
  );

  return opts.includeDrafts ? posts : posts.filter(p => !p.draft);
}

export async function loadPostBySlug(slug: string): Promise<BlogPost | null> {
  const all = await loadAllPosts({ includeDrafts: true });
  return all.find(p => p.slug === slug) ?? null;
}

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

export function collectTags(posts: BlogPost[]): BlogTag[] {
  const names = new Set<string>();
  for (const post of posts) for (const tag of post.tags) names.add(tag.name);
  return Array.from(names).map((name, index) => ({ id: index + 1, name }));
}

export function renderFeed(posts: BlogPost[], site: string): string {
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
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>lefv</title>
    <link>${site}</link>
    <description>Writing by Luis E. Fernández de la Vara</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;
}

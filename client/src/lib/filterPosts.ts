import type { Post } from "@/components/blog/PostIndex";

// Search covers what the index endpoint carries: title, excerpt and tags.
// Post bodies are deliberately not in that payload.
export function filterPosts(posts: Post[], query: string, tag: string | null): Post[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return posts.filter(post => {
    if (tag && !post.tags.some(t => t.name === tag)) return false;
    if (terms.length === 0) return true;

    const haystack = [
      post.title,
      post.excerpt,
      ...post.tags.map(t => t.name),
    ].join(" ").toLowerCase();

    return terms.every(term => haystack.includes(term));
  });
}

export function collectTagNames(posts: Post[]): string[] {
  const seen = new Set<string>();
  for (const post of posts) for (const tag of post.tags) seen.add(tag.name);
  return [...seen].sort();
}

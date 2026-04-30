import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogPost } from "@/components/blog/BlogPost";
import { TagSelector } from "@/components/blog/TagSelector";
import { Search, Rss } from "lucide-react";

type Tag = { id: number; name: string };

type Post = {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  readingTime: number;
  createdAt: string;
  tags: Tag[];
};

type SortOrder = "newest" | "oldest" | "title";

async function fetchPosts(sort: SortOrder): Promise<Post[]> {
  const response = await fetch(`/api/posts?sort=${sort}`);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
}

function groupByYear(posts: Post[]): { year: number; posts: Post[] }[] {
  const map = new Map<number, Post[]>();
  for (const post of posts) {
    const year = new Date(post.createdAt).getFullYear();
    const bucket = map.get(year) ?? [];
    bucket.push(post);
    map.set(year, bucket);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, posts]) => ({ year, posts }));
}

export default function Blog() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortOrder>("newest");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", sort],
    queryFn: () => fetchPosts(sort),
  });

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const filteredPosts = useMemo(() => {
    return posts?.filter(post => {
      const matchesTags =
        selectedTags.length === 0 ||
        post.tags?.some(tag => selectedTags.includes(tag.name));

      if (!searchQuery.trim()) return matchesTags;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.name.toLowerCase().includes(query));

      return matchesTags && matchesSearch;
    }) ?? [];
  }, [posts, selectedTags, searchQuery]);

  const grouped = useMemo(
    () => (sort === "title" ? null : groupByYear(filteredPosts)),
    [filteredPosts, sort]
  );

  if (isLoading) {
    return (
      <div className="h-screen p-6 overflow-hidden">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6">
      <div className="flex-none space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <div className="flex items-center gap-2">
            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              title="RSS feed"
            >
              <Rss className="h-4 w-4" /> RSS
            </a>
            <Select value={sort} onValueChange={(v) => setSort(v as SortOrder)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            className="pl-9"
          />
        </div>

        <TagSelector selectedTags={selectedTags} onTagClick={handleTagClick} />
      </div>

      <div className="flex-1 overflow-auto no-scrollbar mt-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery.trim()
              ? "No posts found matching your search and selected tags."
              : "No posts found for the selected tags."}
          </div>
        ) : grouped ? (
          <div className="space-y-8 pb-24">
            {grouped.map(({ year, posts }) => (
              <section key={year} className="space-y-4">
                <h2 className="text-xl font-semibold text-muted-foreground border-b pb-1">
                  {year}
                </h2>
                <div className="space-y-4">
                  {posts.map((post) => (
                    <BlogPost key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-4 pb-24">
            {filteredPosts.map((post) => (
              <BlogPost key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Column } from "@/components/layout/Layout";
import { PostFilters } from "@/components/blog/PostFilters";
import { PostIndex, type Post } from "@/components/blog/PostIndex";
import { filterPosts, collectTagNames } from "@/lib/filterPosts";

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export default function Writing() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: fetchPosts,
  });

  const all = posts ?? [];
  const visible = useMemo(() => filterPosts(all, query, tag), [all, query, tag]);
  const tagNames = useMemo(() => collectTagNames(all), [all]);

  return (
    <div>
      <Column>

      <header className="mb-12 max-w-measure">
        <h1 className="text-2xl font-bold tracking-tight">
          Luis E. Fernández de la Vara
        </h1>
        <p className="mt-2 text-muted-foreground">
          Attorney and software engineer.
        </p>
      </header>

      {isLoading && (
        <p className="font-mono text-sm text-muted-foreground">Loading…</p>
      )}
      {error && (
        <p className="font-mono text-sm text-muted-foreground">
          Posts are not loading right now. Try again in a moment.
        </p>
      )}

      {posts && posts.length > 0 && (
        <>
          <PostFilters
            query={query}
            onQuery={setQuery}
            tags={tagNames}
            activeTag={tag}
            onTag={setTag}
            matchCount={visible.length}
            totalCount={all.length}
          />
          {visible.length > 0 ? (
            <PostIndex posts={visible} />
          ) : (
            <p className="font-mono text-sm text-muted-foreground">
              Nothing matches that. Try fewer words, or clear the filters.
            </p>
          )}
        </>
      )}

      {posts && posts.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">
          Nothing published yet.
        </p>
      )}
      </Column>
    </div>
  );
}

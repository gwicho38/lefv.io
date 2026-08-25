import { useQuery } from "@tanstack/react-query";
import { PostIndex, type Post } from "@/components/blog/PostIndex";

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("/api/posts");
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export default function Home() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: fetchPosts,
  });

  return (
    <div>
      <header className="mb-14 max-w-measure">
        <h1 className="text-2xl font-bold tracking-tight">
          Luis E. Fernández de la Vara
        </h1>
        <p className="mt-2 text-muted-foreground">
          Attorney and software engineer. I write about criminal procedure,
          security, and the game theory underneath both.
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
      {posts && posts.length === 0 && (
        <p className="font-mono text-sm text-muted-foreground">
          Nothing published yet.
        </p>
      )}
      {posts && posts.length > 0 && <PostIndex posts={posts} />}
    </div>
  );
}

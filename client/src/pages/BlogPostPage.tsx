import { useQuery } from "@tanstack/react-query";
import { Column } from "@/components/layout/Layout";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import type { Post } from "@/components/blog/PostIndex";

async function fetchPost(slug: string): Promise<Post & { content: string }> {
  const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new Error("Post not found");
  if (!res.ok) throw new Error("Failed to load post");
  return res.json();
}

export default function BlogPostPage() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading, error } = useQuery({
    queryKey: [`/api/posts/${slug}`],
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return <Column><p className="font-mono text-sm text-muted-foreground">Loading…</p></Column>;
  }

  if (error || !post) {
    return (
      <Column>
      <div className="max-w-measure">
        <p className="mb-4">That post is not here.</p>
        <Link href="/writing" className="font-mono text-sm underline underline-offset-4">
          Back to writing
        </Link>
      </div>
      </Column>
    );
  }

  return (
    <Column>
    <article className="max-w-measure">
      <header className="mb-10">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          {post.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <time dateTime={post.createdAt}>
            {format(new Date(post.createdAt), "MMMM d, yyyy")}
          </time>
          <span>{post.readingTime} min</span>
          {post.tags.map(tag => (
            <span key={tag.id}>{tag.name}</span>
          ))}
        </div>
      </header>

      <div className="prose-post">
        {/* Posts are authored in this repo, so their HTML is trusted. */}
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{post.content}</ReactMarkdown>
      </div>

      <footer className="mt-16 border-t pt-6">
        <Link href="/writing" className="font-mono text-sm underline underline-offset-4">
          Back to writing
        </Link>
      </footer>
    </article>
    </Column>
  );
}

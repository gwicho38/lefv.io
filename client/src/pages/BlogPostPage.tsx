import { useQuery } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

async function fetchPost(slug: string): Promise<Post> {
  const res = await fetch(`/api/posts/${encodeURIComponent(slug)}`);
  if (res.status === 404) throw new Error("Post not found");
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export default function BlogPostPage() {
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug ?? "";

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: [`/api/posts/${slug}`],
    queryFn: () => fetchPost(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="h-screen p-6">
        <Card className="animate-pulse">
          <div className="h-40" />
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="h-screen flex flex-col p-6">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="self-start">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
          </Button>
        </Link>
        <div className="text-center text-muted-foreground py-16">
          Post not found.
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6">
      <div className="flex-none">
        <Link href="/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
          </Button>
        </Link>
      </div>
      <div className="flex-1 overflow-auto no-scrollbar mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{format(new Date(post.createdAt), "MMMM d, yyyy")}</span>
              <span>·</span>
              <span>{post.readingTime} min read</span>
              {post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

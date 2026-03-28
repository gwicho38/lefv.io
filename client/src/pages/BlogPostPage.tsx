import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

type Tag = {
  id: number;
  name: string;
};

type Post = {
  id: number;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  tags: Tag[];
};

async function fetchPost(slug: string): Promise<Post> {
  const response = await fetch(`/api/posts/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch post");
  }
  return response.json();
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug;

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: [`/api/posts/${slug}`],
    queryFn: () => fetchPost(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="h-screen p-6 overflow-hidden">
        <Card className="animate-pulse">
          <div className="h-96" />
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="h-screen p-6 overflow-hidden">
        <div className="space-y-4">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
          <div className="text-center text-muted-foreground py-8">
            Post not found.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6">
      <div className="flex-none">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        <Card className="w-full max-w-full">
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt), "MMMM d, yyyy")}
                </div>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="whitespace-nowrap">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="w-full">
            <div className="prose prose-sm dark:prose-invert max-w-none w-full overflow-x-auto">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

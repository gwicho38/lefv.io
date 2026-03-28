import { format } from "date-fns";
import { Link } from "wouter";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Tag = {
  id: number;
  name: string;
};

type BlogPostProps = {
  post: {
    id: number;
    slug: string;
    title: string;
    content: string;
    createdAt: string;
    tags?: Tag[];
  };
};

export function BlogPost({ post }: BlogPostProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col w-full max-w-full">
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
        <CardContent className="flex-1 overflow-hidden max-h-96 w-full">
          <div className="prose prose-sm dark:prose-invert max-w-none w-full overflow-x-auto">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

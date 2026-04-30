import { format } from "date-fns";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowRight } from "lucide-react";

type Tag = { id: number; name: string };

type BlogPostProps = {
  post: {
    id: number;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    readingTime?: number;
    createdAt: string;
    tags?: Tag[];
  };
};

export function BlogPost({ post }: BlogPostProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dateLabel = format(new Date(post.createdAt), "MMMM d, yyyy");
  const excerpt = post.excerpt ?? post.content.slice(0, 220);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <Card className="hover:shadow-lg transition-shadow flex flex-col">
        <CardHeader>
          <div className="flex items-baseline justify-between gap-4 flex-wrap">
            <Link href={`/blog/${post.slug}`}>
              <CardTitle className="text-2xl hover:underline cursor-pointer">
                {post.title}
              </CardTitle>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <time dateTime={post.createdAt}>{dateLabel}</time>
            {post.readingTime ? (
              <>
                <span aria-hidden>·</span>
                <span>{post.readingTime} min read</span>
              </>
            ) : null}
            {post.tags && post.tags.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground leading-relaxed">{excerpt}</p>
          <div className="flex items-center gap-4 text-sm">
            <AlertDialogTrigger asChild>
              <button
                onClick={() => setIsOpen(true)}
                className="text-primary hover:underline"
              >
                Quick read
              </button>
            </AlertDialogTrigger>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              Read full post <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <AlertDialogContent className="max-w-4xl h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>{post.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <div className="overflow-auto no-scrollbar max-h-[75vh] pr-2">
          <div className="text-sm text-muted-foreground mb-4">
            {dateLabel}
            {post.readingTime ? ` · ${post.readingTime} min read` : ""}
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

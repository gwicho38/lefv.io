import { format } from "date-fns";
import { useState } from "react";
import ReactMarkdown from "react-markdown"; // ✅ Import react-markdown
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Tag = {
  id: number;
  name: string;
};

type BlogPostProps = {
  post: {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    tags?: Tag[];
  };
};

export function BlogPost({ post }: BlogPostProps) {
  const [isOpen, setIsOpen] = useState(false);

  const PostContent = ({ isModal = false }: { isModal?: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow flex flex-col ${!isModal && 'cursor-pointer'} w-full`}>
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {format(new Date(post.createdAt), "MMMM d, yyyy")}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent
        className={`flex-1 ${isModal ? 'overflow-auto no-scrollbar max-h-[70vh]' : 'overflow-hidden max-h-96'} w-full`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none w-full">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );


  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          <PostContent />
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-4xl w-full h-[90vh] flex flex-col justify-start items-center">
        <AlertDialogHeader className="w-full">
          <AlertDialogTitle className="text-xl font-bold">{post.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <PostContent isModal={true} />
      </AlertDialogContent>

    </AlertDialog>
  );
}

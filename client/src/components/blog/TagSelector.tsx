import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Tag, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type TagType = {
  id: number;
  name: string;
};

interface TagSelectorProps {
  selectedTags: string[];
  onTagClick: (tagName: string) => void;
}

export function TagSelector({ selectedTags, onTagClick }: TagSelectorProps) {
  const { data: tags, isLoading } = useQuery<TagType[]>({
    queryKey: ["/api/tags"],
  });

  const handleClearAll = () => {
    selectedTags.forEach(tag => onTagClick(tag));
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="default">
          <Tag />
          Filter by Tags
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Select Tags</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="flex-1 overflow-auto no-scrollbar max-h-[60vh]">
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-20 animate-pulse rounded-full bg-muted"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/10",
                    selectedTags.includes(tag.name) &&
                      "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                  onClick={() => onTagClick(tag.name)}
                >
                  {tag.name}
                  {selectedTags.includes(tag.name) && (
                    <span className="ml-1 text-xs">×</span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedTags.length === 0}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit">
              <Check className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
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
} from "@/components/ui/alert-dialog";
import { Tag } from "lucide-react";
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

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Filter by Tags
                    {selectedTags.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                            {selectedTags.length}
                        </Badge>
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>Select Tags</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="flex-1 overflow-auto no-scrollbar">
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
                                    variant="outline"
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
                <AlertDialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => selectedTags.forEach(onTagClick)}
                        disabled={selectedTags.length === 0}
                    >
                        Clear All
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
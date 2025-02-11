import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BlogPost } from "@/components/blog/BlogPost";
import { TagSelector } from "@/components/blog/TagSelector";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Tag = {
  id: number;
  name: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  tags: Tag[];
};

export default function Blog() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const filteredPosts = posts?.filter(post => {
    // First check if post matches selected tags
    const matchesTags = selectedTags.length === 0 || 
      post.tags?.some(tag => selectedTags.includes(tag.name));

    // If no search query, just return tag match result
    if (!searchQuery.trim()) {
      return matchesTags;
    }

    // If there is a search query, check both tags and content match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.name.toLowerCase().includes(query));

    return matchesTags && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="h-screen p-6 overflow-hidden">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden p-6">
      {/* Header section - fixed height */}
      <div className="flex-none space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Blog Posts</h1>
        </div>

        <div className="flex gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search posts by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10",
                "w-full"
              )}
            />
          </div>

          {/* Tag selector */}
          <TagSelector
            selectedTags={selectedTags}
            onTagClick={handleTagClick}
          />
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto no-scrollbar mt-8">
        <div className="space-y-6 pb-6">
          {filteredPosts?.map((post) => (
            <BlogPost 
              key={post.id} 
              post={post}
            />
          ))}

          {filteredPosts?.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery.trim() 
                ? "No posts found matching your search and selected tags."
                : "No posts found for the selected tags."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
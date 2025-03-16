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

async function fetchPosts(): Promise<Post[]> {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export default function Blog() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: fetchPosts,
  });

  const handleTagClick = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const filteredPosts = posts?.filter(post => {
    const matchesTags =
      selectedTags.length === 0 ||
      post.tags?.some(tag => selectedTags.includes(tag.name));

    if (!searchQuery.trim()) {
      return matchesTags;
    }

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
      {/* Header Section */}
      <div className="flex-none space-y-8">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <TagSelector selectedTags={selectedTags} onTagClick={handleTagClick} />
      </div>

      {/* Scrollable Content Section */}
      <div className="flex-1 overflow-auto no-scrollbar mt-8">
        <div className="space-y-6 pb-6">
          {filteredPosts?.map((post) => (
            <BlogPost key={post.id} post={post} />
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

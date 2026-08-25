import { Link } from "wouter";
import { format } from "date-fns";

export type Tag = { id: number; name: string };
export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  readingTime: number;
  createdAt: string;
  tags: Tag[];
};

// The archive spans one-minute notes to hour-long papers, so the rule is scaled
// against the longest post rather than a fixed ceiling.
function DurationRule({ minutes, longest }: { minutes: number; longest: number }) {
  const width = Math.max(4, Math.round((minutes / longest) * 100));
  return (
    <span
      aria-hidden
      className="hidden h-px shrink-0 bg-foreground/25 sm:block"
      style={{ width: `${width}px` }}
    />
  );
}

function byYear(posts: Post[]): [string, Post[]][] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = new Date(post.createdAt).getFullYear().toString();
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()];
}

export function PostIndex({ posts }: { posts: Post[] }) {
  const longest = Math.max(...posts.map(p => p.readingTime), 1);

  return (
    <div className="space-y-12">
      {byYear(posts).map(([year, yearPosts]) => (
        <section key={year}>
          <h2 className="mb-5 font-mono text-xs text-muted-foreground">{year}</h2>
          <ul className="space-y-7">
            {yearPosts.map(post => (
              <li key={post.id}>
                <Link href={`/blog/${post.slug}`} className="group block">
                  <h3 className="text-lg font-semibold leading-snug decoration-foreground/30 underline-offset-4 group-hover:underline">
                    {post.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                    <time dateTime={post.createdAt}>
                      {format(new Date(post.createdAt), "MMM d")}
                    </time>
                    <span>{post.readingTime} min</span>
                    <DurationRule minutes={post.readingTime} longest={longest} />
                    {post.tags.map(tag => (
                      <span key={tag.id}>{tag.name}</span>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

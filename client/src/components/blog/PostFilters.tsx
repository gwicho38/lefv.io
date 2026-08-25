type Props = {
  query: string;
  onQuery: (value: string) => void;
  tags: string[];
  activeTag: string | null;
  onTag: (tag: string | null) => void;
  matchCount: number;
  totalCount: number;
};

export function PostFilters({
  query, onQuery, tags, activeTag, onTag, matchCount, totalCount,
}: Props) {
  const filtering = query.trim() !== "" || activeTag !== null;

  return (
    <div className="mb-10 space-y-3">
      <input
        type="search"
        value={query}
        onChange={e => onQuery(e.target.value)}
        placeholder="Search writing"
        aria-label="Search writing"
        className="w-full border-b bg-transparent pb-2 font-mono text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
        {tags.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => onTag(activeTag === tag ? null : tag)}
            aria-pressed={activeTag === tag}
            className={
              activeTag === tag
                ? "text-foreground underline underline-offset-4"
                : "text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {tag}
          </button>
        ))}
      </div>

      {filtering && (
        <p className="font-mono text-xs text-muted-foreground">
          {matchCount} of {totalCount}
          {" · "}
          <button
            type="button"
            onClick={() => { onQuery(""); onTag(null); }}
            className="underline underline-offset-4 hover:text-foreground"
          >
            clear
          </button>
        </p>
      )}
    </div>
  );
}

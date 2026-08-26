import { Link } from "wouter";
import { Column } from "@/components/layout/Layout";

export default function NotFound() {
  return (
    <Column>
    <div className="max-w-measure">
      <h1 className="text-2xl font-bold tracking-tight">Not found</h1>
      <p className="mt-3 text-muted-foreground">
        That page is not here. It may have moved, or the link may be wrong.
      </p>
      <div className="mt-6 flex gap-5 font-mono text-sm">
        <Link href="/writing" className="underline underline-offset-4">
          Writing
        </Link>
        <Link href="/about" className="underline underline-offset-4">
          About
        </Link>
        <a href="/feed.xml" className="underline underline-offset-4">
          RSS
        </a>
      </div>
    </div>
    </Column>
  );
}

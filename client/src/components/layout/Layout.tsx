import { Navigation } from "./Navigation";

// main is full width so a page can go edge to edge; pages apply Column
// themselves for anything that belongs in the reading measure.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pb-24">{children}</main>
    </div>
  );
}

export function Column({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-shell px-5">{children}</div>;
}

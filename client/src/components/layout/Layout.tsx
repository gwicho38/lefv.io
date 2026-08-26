import { Navigation } from "./Navigation";

// A flex column lets a page fill exactly the space left by the nav, with no
// magic numbers and nothing to overflow.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-background">
      <Navigation />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

// Bottom padding lives here rather than on main, so a full-height page like
// the landing screen adds nothing below itself.
export function Column({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-shell px-5 pb-24">{children}</div>;
}

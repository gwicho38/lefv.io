import { Navigation } from "./Navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="mx-auto max-w-shell px-5 pb-24">{children}</main>
    </div>
  );
}

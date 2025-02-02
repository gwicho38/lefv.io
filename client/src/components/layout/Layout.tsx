import { Navigation } from "./Navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto bg-background">
      <Navigation />
      <main className="mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

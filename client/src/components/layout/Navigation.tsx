import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const links = [
  { href: "/writing", label: "Writing" },
  { href: "/about", label: "About" },
];

export function Navigation() {
  const [location] = useLocation();
  const isActive = (href: string) =>
    href === "/writing"
      ? location === "/writing" || location.startsWith("/blog")
      : location === href;

  return (
    <nav className="mx-auto flex max-w-shell items-baseline gap-6 px-5 py-8">
      <Link href="/" className="font-mono text-sm font-medium tracking-tight">
        lefv
      </Link>
      <div className="flex flex-1 gap-5">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "font-mono text-sm transition-colors hover:text-foreground",
              isActive(href) ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
      <a
        href="/feed.xml"
        className="font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        RSS
      </a>
    </nav>
  );
}

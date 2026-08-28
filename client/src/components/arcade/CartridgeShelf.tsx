import type { Cartridge } from "@/lib/cartridges";

interface Props {
  cartridges: Cartridge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CartridgeShelf({ cartridges, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {cartridges.map(c => (
        <button
          key={c.id}
          type="button"
          aria-pressed={c.id === selectedId}
          onClick={() => onSelect(c.id)}
          title={`${c.title} · ${c.system.toUpperCase()}`}
          aria-label={`${c.title}, ${c.system.toUpperCase()}`}
          className={`flex w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left transition-colors ${
            c.id === selectedId
              ? "border-foreground/40 bg-foreground/5 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <span
            aria-hidden
            className="h-2.5 w-2.5 flex-none rounded-full"
            style={{ backgroundColor: c.colour }}
          />
          <span className="truncate font-mono text-[11px]">{c.title}</span>
          <span className="ml-auto flex-none font-mono text-[9px] uppercase text-muted-foreground">
            {c.system}
          </span>
        </button>
      ))}
    </div>
  );
}

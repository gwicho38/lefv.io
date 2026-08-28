import type { DragEvent } from "react";
import type { Cartridge } from "@/lib/cartridges";

interface Props {
  cartridges: Cartridge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDrop: (file: File) => void;
}

export function CartridgeShelf({ cartridges, selectedId, onSelect, onDrop }: Props) {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) onDrop(file);
  };

  return (
    <div className="grid flex-1 grid-cols-3 grid-rows-3 gap-2">
      {cartridges.map(c => (
        <button
          key={c.id}
          type="button"
          aria-pressed={c.id === selectedId}
          onClick={() => onSelect(c.id)}
          style={{ backgroundColor: c.colour }}
          className={`flex flex-col justify-between rounded-sm rounded-b p-1.5 text-left ${
            c.id === selectedId ? "outline outline-2 outline-offset-2 outline-primary" : ""
          }`}
        >
          <span className="rounded-sm bg-[#f6f2e8] p-1 font-mono text-[6px] leading-tight text-[#2a2118]">
            {c.title}
          </span>
          <span className="h-1 rounded-sm bg-black/25" />
        </button>
      ))}
      <div
        data-testid="drop-slot"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        className="flex items-center justify-center rounded-sm rounded-b border border-dashed border-primary/40 p-1 text-center font-mono text-[6px] leading-tight text-muted-foreground"
      >
        DROP YOURS
      </div>
    </div>
  );
}

import type { Cartridge } from "@/lib/cartridges";

interface Props {
  cartridges: Cartridge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CartridgeShelf({ cartridges, selectedId, onSelect }: Props) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-3">
      {cartridges.map(c => (
        <button
          key={c.id}
          type="button"
          aria-pressed={c.id === selectedId}
          onClick={() => onSelect(c.id)}
          style={{ backgroundColor: c.colour }}
          className={`flex aspect-[5/6] flex-col justify-between rounded-sm rounded-b p-2 text-left ${
            c.id === selectedId ? "outline outline-2 outline-offset-2 outline-primary" : ""
          }`}
        >
          <span className="rounded-sm bg-[#f6f2e8] px-1.5 py-1 font-mono text-[10px] leading-tight text-[#2a2118]">
            {c.title}
          </span>
          <span className="h-2 rounded-sm bg-black/25" />
        </button>
      ))}
    </div>
  );
}

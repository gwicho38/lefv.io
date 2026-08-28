import {
  BOOMBOX_DISPLAY, BOOMBOX_KEYS, BOOMBOX_KEY_ROW, BOOMBOX_MAP, BOOMBOX_PALETTE, KEY_MAPS,
  type TransportKey,
} from "@/data/boomboxMap";
import { mapSize, toRects } from "@/lib/pixels";
import type { Transport } from "./useRadio";

const { width, height } = mapSize(BOOMBOX_MAP);
const body = toRects(BOOMBOX_MAP, BOOMBOX_PALETTE);
const pct = (part: number, whole: number) => `${(part / whole) * 100}%`;

// A pressed key sinks a pixel and swaps two palette entries, so there is no
// second sprite to keep in step with the first.
const PRESSED = { c: "g", g: "o" } as const;

interface Props {
  transport: Transport;
  levels: number[];
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  children?: React.ReactNode;
}

export function Boombox({ transport, levels, onPlay, onPause, onStop, children }: Props) {
  const handlers: Record<TransportKey, () => void> = { play: onPlay, pause: onPause, stop: onStop };
  const held: Record<TransportKey, boolean> = {
    play: transport === "playing" || transport === "loading",
    pause: transport === "paused",
    stop: transport === "stopped",
  };

  return (
    <div className="relative w-full">
      <div
        className="absolute flex items-center gap-[2%] overflow-hidden bg-[#150c08] px-[1.5%]"
        style={{
          left: pct(BOOMBOX_DISPLAY.x, width),
          top: pct(BOOMBOX_DISPLAY.y, height),
          width: pct(BOOMBOX_DISPLAY.w, width),
          height: pct(BOOMBOX_DISPLAY.h, height),
        }}
      >
        <div className="min-w-0 flex-1 truncate font-mono text-[8px] leading-none text-[#f08a3c]">
          {children}
        </div>
        <div aria-hidden className="flex h-full flex-none items-end gap-[1px] py-[12%]">
          {levels.map((level, i) => (
            <span
              key={i}
              className="w-[2px] bg-[#f08a3c]"
              style={{ height: `${Math.max(6, level * 100)}%` }}
            />
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        shapeRendering="crispEdges"
        className="relative block w-full"
      >
        {body.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
        ))}

        {(Object.keys(KEY_MAPS) as TransportKey[]).map(name => {
          const x = BOOMBOX_KEYS[name];
          const down = held[name];
          const rects = toRects(KEY_MAPS[name], BOOMBOX_PALETTE, {
            ox: x,
            oy: BOOMBOX_KEY_ROW + (down ? 1 : 0),
            swap: down ? PRESSED : undefined,
          });
          return (
            <g
              key={name}
              role="button"
              tabIndex={0}
              aria-label={name}
              aria-pressed={down}
              className="cursor-pointer"
              onClick={handlers[name]}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlers[name]();
                }
              }}
            >
              <rect x={x} y={BOOMBOX_KEY_ROW} width={6} height={8} fill="#150c08" />
              {rects.map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

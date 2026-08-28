import { CONSOLE_MAP, CONSOLE_PALETTE, CONSOLE_SCREEN } from "@/data/consoleMap";
import { mapSize, toRects } from "@/lib/pixels";

const { width, height } = mapSize(CONSOLE_MAP);
const rects = toRects(CONSOLE_MAP, CONSOLE_PALETTE);

const pct = (part: number, whole: number) => `${(part / whole) * 100}%`;

export function Console({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full">
      <div
        className="absolute flex items-center justify-center overflow-hidden bg-black"
        style={{
          left: pct(CONSOLE_SCREEN.x, width),
          top: pct(CONSOLE_SCREEN.y, height),
          width: pct(CONSOLE_SCREEN.w, width),
          height: pct(CONSOLE_SCREEN.h, height),
        }}
      >
        {children}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        shapeRendering="crispEdges"
        className="pointer-events-none relative block w-full"
        role="presentation"
      >
        {rects.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
        ))}
      </svg>
    </div>
  );
}

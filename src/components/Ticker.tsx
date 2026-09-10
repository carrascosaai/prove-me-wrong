import Link from "next/link";
import type { Prediction } from "@/lib/types";

/**
 * Auto-scrolling marquee of recent predictions. Pure CSS animation
 * (see .ticker-track in globals.css), pauses on hover, respects
 * prefers-reduced-motion.
 */
export function Ticker({ items }: { items: Prediction[] }) {
  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="relative overflow-hidden border-y border-line bg-surface/30 py-2.5">
      <div className="ticker-track gap-8">
        {loop.map((p, i) => (
          <Link
            key={`${p.id}-${i}`}
            href={`/p/${p.slug}`}
            className="mono flex shrink-0 items-center gap-2 text-xs text-muted hover:text-ink"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                p.status === "correct"
                  ? "bg-correct"
                  : p.status === "wrong"
                    ? "bg-wrong"
                    : "bg-accent"
              }`}
            />
            <span className="text-faint">@{p.username}</span>
            <span className="text-ink/90">{p.prediction}</span>
          </Link>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg to-transparent" />
    </div>
  );
}

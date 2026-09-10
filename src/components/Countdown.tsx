"use client";

import { useEffect, useState } from "react";
import { countdown } from "@/lib/format";

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="mono display text-3xl sm:text-4xl tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mono text-[10px] uppercase tracking-[0.2em] text-faint mt-1.5">
        {label}
      </span>
    </div>
  );
}

export function Countdown({
  target,
  compact = false,
}: {
  target: string;
  compact?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Avoid hydration mismatch: render nothing until mounted.
  if (now === null) {
    return <div className={compact ? "h-5" : "h-16"} aria-hidden />;
  }

  const c = countdown(target, now);

  if (c.done) {
    return (
      <span className="mono text-sm font-medium text-muted">
        resolution date reached
      </span>
    );
  }

  if (compact) {
    const parts =
      c.days > 0 ? `${c.days}d ${c.hours}h` : `${c.hours}h ${c.minutes}m`;
    return <span className="mono tabular-nums font-medium">{parts} left</span>;
  }

  return (
    <div className="flex items-end gap-3 sm:gap-5">
      <Unit value={c.days} label="days" />
      <span className="display text-3xl sm:text-4xl text-accent pb-5">:</span>
      <Unit value={c.hours} label="hrs" />
      <span className="display text-3xl sm:text-4xl text-accent pb-5">:</span>
      <Unit value={c.minutes} label="min" />
      <span className="display text-3xl sm:text-4xl text-accent pb-5">:</span>
      <Unit value={c.seconds} label="sec" />
    </div>
  );
}

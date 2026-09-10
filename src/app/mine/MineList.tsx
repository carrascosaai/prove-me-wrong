"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { forgetMine, readMine, type MineEntry } from "@/lib/mine";
import { formatDateShort } from "@/lib/format";

export function MineList() {
  const [entries, setEntries] = useState<MineEntry[] | null>(null);

  useEffect(() => {
    setEntries(readMine());
  }, []);

  if (entries === null) return null;

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nothing yet.{" "}
        <Link href="/create" className="text-accent hover:underline">
          Make a prediction →
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((e) => (
        <li
          key={e.slug}
          className="rounded-xl border border-line bg-surface/40 p-4"
        >
          <Link
            href={`/p/${e.slug}`}
            className="font-semibold leading-snug hover:underline"
          >
            {e.prediction}
          </Link>
          <div className="mono mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
            <span>{formatDateShort(new Date(e.ts).toISOString())}</span>
            <Link
              href={`/p/${e.slug}/manage?token=${encodeURIComponent(e.token)}`}
              className="text-accent hover:underline"
            >
              mark verdict →
            </Link>
            <button
              type="button"
              onClick={() => {
                forgetMine(e.slug);
                setEntries(readMine());
              }}
              className="text-faint hover:text-wrong"
            >
              remove from list
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

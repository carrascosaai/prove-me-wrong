import Link from "next/link";
import type { Prediction } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { Countdown } from "./Countdown";
import { formatDateShort } from "@/lib/format";

export function PredictionCard({ p }: { p: Prediction }) {
  const total = p.agree_count + p.doubt_count;
  const doubtPct = total > 0 ? Math.round((p.doubt_count / total) * 100) : 0;

  return (
    <Link
      href={`/p/${p.slug}`}
      className="group block rounded-xl border border-line p-4 sm:p-5 transition-colors bg-surface/40 hover:bg-surface hover:border-line-strong"
    >
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={p.status} resolutionDate={p.resolution_date} />
        <span className="mono text-[11px] uppercase tracking-wide text-faint">
          {p.category}
        </span>
      </div>

      <p className="text-[15px] sm:text-base font-semibold leading-snug tracking-tight text-ink group-hover:text-white">
        {p.prediction}
      </p>

      <div className="mt-3 flex items-center justify-between text-sm text-muted">
        <span className="mono text-xs">
          @{p.username} · {formatDateShort(p.created_at)}
        </span>
        {p.status === "active" ? (
          <span className="text-xs text-accent">
            <Countdown target={p.resolution_date} compact />
          </span>
        ) : null}
      </div>

      {total > 0 ? (
        <div className="mt-3">
          <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-wrong/80"
              style={{ width: `${doubtPct}%` }}
            />
          </div>
          <div className="mono mt-1.5 text-[11px] text-faint">
            {doubtPct}% doubt it · {total} votes
          </div>
        </div>
      ) : null}
    </Link>
  );
}

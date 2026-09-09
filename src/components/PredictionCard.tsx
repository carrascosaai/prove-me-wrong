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
      className={`group block rounded-xl border p-4 sm:p-5 transition-colors hover:border-ink ${
        p.is_sponsored
          ? "border-pro/50 bg-pro/[0.04]"
          : p.is_pro
            ? "border-pro/40"
            : "border-line"
      }`}
    >
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <StatusBadge status={p.status} resolutionDate={p.resolution_date} />
        <span className="text-xs text-muted">{p.category}</span>
        {p.is_pro && !p.is_sponsored ? (
          <span className="text-xs font-semibold text-[#8a6a00]">PRO</span>
        ) : null}
        {p.is_sponsored ? (
          <span className="text-xs font-semibold text-[#8a6a00]">
            SPONSORED{p.sponsor_name ? ` · ${p.sponsor_name}` : ""}
          </span>
        ) : null}
      </div>

      <p className="text-lg font-semibold leading-snug tracking-tight group-hover:underline decoration-1 underline-offset-2">
        {p.prediction}
      </p>

      <div className="mt-3 flex items-center justify-between text-sm text-muted">
        <span>
          @{p.username} · {formatDateShort(p.created_at)}
        </span>
        {p.status === "active" ? (
          <Countdown target={p.resolution_date} compact />
        ) : null}
      </div>

      {total > 0 ? (
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
            <div
              className="h-full bg-wrong/70"
              style={{ width: `${doubtPct}%` }}
            />
          </div>
          <div className="mt-1 text-[11px] text-muted">
            {doubtPct}% doubt it · {total} votes
          </div>
        </div>
      ) : null}
    </Link>
  );
}

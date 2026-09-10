import type { Metadata } from "next";
import Link from "next/link";
import { RANKINGS } from "@/lib/rankings";
import { getPredictionRanking, getUserRanking } from "@/lib/db";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "Most popular, most controversial, most confident, most accurate and most wrong.",
};

export default async function RankingsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="display text-3xl sm:text-4xl">Rankings</h1>
      <p className="mt-2 text-muted">The leaderboards that make this fun.</p>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RANKINGS} className="mt-8" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {RANKINGS.map((r) => (
          <RankingPreview key={r.type} type={r.type} />
        ))}
      </div>
    </div>
  );
}

async function RankingPreview({ type }: { type: (typeof RANKINGS)[number]["type"] }) {
  const meta = RANKINGS.find((r) => r.type === type)!;
  let rows: { label: string; sub: string; href?: string }[] = [];

  if (meta.kind === "prediction") {
    const items = await getPredictionRanking(
      type as "confident" | "controversial" | "popular",
    );
    rows = items.slice(0, 5).map((p) => ({
      label: p.prediction,
      sub:
        type === "popular"
          ? `${p.views.toLocaleString()} views`
          : type === "confident"
            ? `${p.confidence}% confident · @${p.username}`
            : `${p.agree_count + p.doubt_count} votes · @${p.username}`,
      href: `/p/${p.slug}`,
    }));
  } else {
    const items = await getUserRanking(type as "accurate" | "wrong");
    rows = items.slice(0, 5).map((s) => ({
      label: `@${s.username}`,
      sub:
        type === "accurate"
          ? `${Math.round(s.accuracy * 100)}% · ${s.correct}/${s.resolved} resolved`
          : `${s.wrong} wrong · ${s.total} total`,
    }));
  }

  return (
    <div className="rounded-xl border border-line bg-surface/40 p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="display text-xl">{meta.title}</h2>
        <Link
          href={`/rankings/${type}`}
          className="mono text-xs text-accent hover:underline"
        >
          full list →
        </Link>
      </div>
      <p className="mono text-[11px] text-muted mt-1.5">{meta.blurb}</p>
      <ol className="mt-4 space-y-2.5">
        {rows.length === 0 ? (
          <li className="mono text-xs text-muted">not enough data yet.</li>
        ) : (
          rows.map((row, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="mono text-accent tabular-nums w-5 shrink-0 text-xs pt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                {row.href ? (
                  <Link href={row.href} className="hover:underline line-clamp-1">
                    {row.label}
                  </Link>
                ) : (
                  <span className="line-clamp-1">{row.label}</span>
                )}
                <span className="mono block text-[11px] text-faint mt-0.5">
                  {row.sub}
                </span>
              </span>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

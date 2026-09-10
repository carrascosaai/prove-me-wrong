import type { Metadata } from "next";
import { getStats } from "@/lib/db";
import { ADMIN_SECRET, HAS_DB_WRITE } from "@/lib/env";

export const metadata: Metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (ADMIN_SECRET && key !== ADMIN_SECRET) {
    return (
      <Shell>
        <p className="text-sm text-muted">
          Add <code className="text-ink">?key=YOUR_ADMIN_SECRET</code> to the URL.
        </p>
      </Shell>
    );
  }

  if (!HAS_DB_WRITE) {
    return (
      <Shell>
        <p className="text-sm text-muted">
          Analytics needs Supabase configured (it isn&apos;t here).
        </p>
      </Shell>
    );
  }

  const s = await getStats();
  if (!s) {
    return (
      <Shell>
        <p className="text-sm text-muted">
          No data yet — did you run <code className="text-ink">supabase/analytics.sql</code>?
        </p>
      </Shell>
    );
  }

  const maxDay = Math.max(1, ...s.byDay.map((d) => d.hits));

  return (
    <Shell>
      {!ADMIN_SECRET ? (
        <p className="mb-6 rounded-md bg-pro/10 text-pro text-xs px-3 py-2">
          This page is public. Set <code>ADMIN_SECRET</code> in Vercel to lock it
          behind <code>?key=</code>.
        </p>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Pageviews (30d)" value={s.totalHits} />
        <Stat label="Pageviews today" value={s.hitsToday} accent />
        <Stat label="Predictions" value={s.predictionsTotal} />
        <Stat label="Predictions (24h)" value={s.predictions24h} accent />
        <Stat label="Votes" value={s.votes} />
        <Stat label="Comments" value={s.comments} />
      </div>

      <Section title="Pageviews by day">
        <div className="space-y-1.5">
          {s.byDay.length === 0 ? (
            <Empty />
          ) : (
            s.byDay.map((d) => (
              <div key={d.day} className="flex items-center gap-3 text-xs">
                <span className="mono text-faint w-20 shrink-0">{d.day}</span>
                <div className="flex-1 h-4 rounded bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full bg-accent/70"
                    style={{ width: `${(d.hits / maxDay) * 100}%` }}
                  />
                </div>
                <span className="mono w-12 text-right">{d.hits}</span>
              </div>
            ))
          )}
        </div>
      </Section>

      <div className="grid sm:grid-cols-2 gap-8">
        <Section title="Top referrers">
          <Table
            rows={s.topReferrers.map((r) => [r.referrer, r.hits])}
            empty="only direct traffic so far"
          />
        </Section>
        <Section title="Top pages">
          <Table
            rows={s.topPaths.map((p) => [p.path, p.hits])}
            empty="no pages yet"
          />
        </Section>
      </div>

      <p className="mt-10 text-xs text-faint">
        Aggregated, cookie-free. No per-visitor data is stored.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl">Stats</h1>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface/40 p-4">
      <div className="mono text-[10px] uppercase tracking-[0.15em] text-faint">
        {label}
      </div>
      <div
        className={`display text-2xl mt-1 ${accent ? "text-accent" : ""}`}
      >
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="mono text-[11px] uppercase tracking-[0.2em] text-faint mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Table({
  rows,
  empty,
}: {
  rows: [string, number][];
  empty: string;
}) {
  if (rows.length === 0) return <Empty text={empty} />;
  return (
    <ul className="divide-y divide-line border border-line rounded-xl overflow-hidden">
      {rows.map(([k, v]) => (
        <li
          key={k}
          className="flex items-center justify-between px-3 py-2 text-sm"
        >
          <span className="mono text-xs truncate">{k}</span>
          <span className="mono text-xs shrink-0 ml-3">{v}</span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ text = "no data yet" }: { text?: string }) {
  return <p className="mono text-xs text-faint">{text}</p>;
}

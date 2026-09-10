import Link from "next/link";
import { listPredictions } from "@/lib/db";
import { PredictionCard } from "@/components/PredictionCard";
import { AdSlot } from "@/components/AdSlot";
import { Ticker } from "@/components/Ticker";

export const revalidate = 60;

export default async function HomePage() {
  const [popular, soon, fresh, recent] = await Promise.all([
    listPredictions({ sort: "popular", limit: 6 }),
    listPredictions({ sort: "soon", limit: 6 }),
    listPredictions({ sort: "new", limit: 4 }),
    listPredictions({ sort: "new", limit: 14 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-glow absolute inset-0 -z-10" />
        <div className="dot-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-5xl px-4 pt-20 pb-14 sm:pt-28 sm:pb-20 text-center">
          <div className="mono inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3 py-1 text-[11px] text-muted mb-8">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
            public · timestamped · uneditable
          </div>
          <h1 className="display text-5xl sm:text-7xl md:text-8xl">
            PROVE ME WRONG<span className="text-accent">.</span>
          </h1>
          <p className="mono mt-6 text-base sm:text-lg text-muted">
            Say it now. Prove it later.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <Link
              href="/create"
              className="rounded-md bg-accent text-accent-ink px-6 py-3.5 text-base font-semibold hover:bg-accent/90 transition-colors"
            >
              Make a prediction
            </Link>
            <Link
              href="/feed"
              className="rounded-md border border-line-strong px-6 py-3.5 text-base font-medium hover:bg-white/5 transition-colors"
            >
              Browse the feed
            </Link>
          </div>
        </div>
      </section>

      <Ticker items={recent} />

      <div className="mx-auto max-w-5xl px-4">
        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME}
          className="mt-14"
        />
      </div>

      <Section
        title="Closing soon"
        subtitle="These get settled first."
        href="/feed?sort=soon"
        items={soon}
      />

      <Section
        title="Most talked about"
        subtitle="The predictions people can't stop arguing over."
        href="/rankings/popular"
        items={popular}
      />

      <Section title="Just posted" href="/feed" items={fresh} />

      {/* CTA band */}
      <section className="mx-auto max-w-5xl px-4 my-20">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/50 p-8 sm:p-12 text-center">
          <div className="hero-glow absolute inset-0" />
          <div className="relative">
            <h2 className="display text-3xl sm:text-4xl">
              Got a hot take about the future?
            </h2>
            <p className="mono mt-3 text-sm text-muted">
              Post it. Get a shareable page and a countdown. Come back when it&apos;s
              settled.
            </p>
            <Link
              href="/create"
              className="mt-6 inline-block rounded-md bg-accent text-accent-ink px-6 py-3.5 font-semibold hover:bg-accent/90 transition-colors"
            >
              Make a prediction
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  href,
  items,
}: {
  title: string;
  subtitle?: string;
  href: string;
  items: Awaited<ReturnType<typeof listPredictions>>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-4 my-14">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="display text-2xl sm:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mono text-xs text-muted mt-1.5">{subtitle}</p>
          ) : null}
        </div>
        <Link
          href={href}
          className="mono text-xs text-accent hover:underline shrink-0"
        >
          see all →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <PredictionCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}

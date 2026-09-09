import Link from "next/link";
import { listPredictions } from "@/lib/db";
import { PredictionCard } from "@/components/PredictionCard";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 60;

export default async function HomePage() {
  const [popular, soon, fresh] = await Promise.all([
    listPredictions({ sort: "popular", limit: 6 }),
    listPredictions({ sort: "soon", limit: 6 }),
    listPredictions({ sort: "new", limit: 4 }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-14 sm:pt-24 sm:pb-20 text-center">
        <h1 className="display text-5xl sm:text-7xl md:text-8xl">
          PROVE ME WRONG<span className="text-accent">.</span>
        </h1>
        <p className="mt-5 text-lg sm:text-xl text-muted">
          Say it now. Prove it later.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link
            href="/create"
            className="rounded-md bg-ink text-paper px-6 py-3.5 text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Make a prediction
          </Link>
          <Link
            href="/feed"
            className="rounded-md border border-line px-6 py-3.5 text-base font-medium hover:bg-black/[0.04] transition-colors"
          >
            Browse the feed
          </Link>
        </div>
        <p className="mt-6 text-sm text-muted">
          Public. Timestamped. Impossible to edit after the fact.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME} className="mb-14" />
      </div>

      {/* Closing soon */}
      <Section
        title="Closing soon"
        subtitle="These get settled first."
        href="/feed?sort=soon"
        items={soon}
      />

      {/* Most popular */}
      <Section
        title="Most talked about"
        subtitle="The predictions people can't stop arguing over."
        href="/rankings/popular"
        items={popular}
      />

      {/* Fresh */}
      <Section
        title="Just posted"
        href="/feed"
        items={fresh}
      />

      {/* CTA band */}
      <section className="mx-auto max-w-5xl px-4 my-20">
        <div className="rounded-2xl border border-line p-8 sm:p-12 text-center">
          <h2 className="display text-3xl sm:text-4xl">
            Got a hot take about the future?
          </h2>
          <p className="mt-3 text-muted">
            Post it. Get a shareable page and a countdown. Come back when it&apos;s
            settled.
          </p>
          <Link
            href="/create"
            className="mt-6 inline-block rounded-md bg-ink text-paper px-6 py-3.5 font-semibold hover:opacity-90 transition-opacity"
          >
            Make a prediction
          </Link>
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
            <p className="text-sm text-muted mt-1">{subtitle}</p>
          ) : null}
        </div>
        <Link href={href} className="text-sm text-accent hover:underline shrink-0">
          See all →
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

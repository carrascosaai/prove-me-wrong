import type { Metadata } from "next";
import Link from "next/link";
import { listPredictions } from "@/lib/db";
import { PredictionCard } from "@/components/PredictionCard";
import { AdSlot } from "@/components/AdSlot";
import { CATEGORIES } from "@/lib/categories";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Feed",
  description: "Every public prediction, newest first.",
};

const SORTS = [
  { key: "new", label: "Newest" },
  { key: "soon", label: "Closing soon" },
  { key: "popular", label: "Most viewed" },
  { key: "confident", label: "Most confident" },
] as const;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const sort = (SORTS.find((s) => s.key === sp.sort)?.key ??
    "new") as (typeof SORTS)[number]["key"];
  const category = sp.category && CATEGORIES.includes(sp.category as never)
    ? sp.category
    : null;

  const items = await listPredictions({ sort, category, limit: 60 });

  const qs = (next: Record<string, string | null>) => {
    const params = new URLSearchParams();
    const merged = { sort, category, ...next };
    if (merged.sort && merged.sort !== "new") params.set("sort", merged.sort);
    if (merged.category) params.set("category", merged.category);
    const s = params.toString();
    return s ? `/feed?${s}` : "/feed";
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="display text-3xl sm:text-4xl">The feed</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={qs({ sort: s.key })}
            className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
              sort === s.key
                ? "border-ink bg-ink text-paper"
                : "border-line hover:border-ink"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={qs({ category: null })}
          className={`rounded-full px-3 py-1 text-xs border transition-colors ${
            !category ? "border-ink" : "border-line text-muted hover:border-ink"
          }`}
        >
          All categories
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={qs({ category: c })}
            className={`rounded-full px-3 py-1 text-xs border transition-colors ${
              category === c
                ? "border-ink"
                : "border-line text-muted hover:border-ink"
            }`}
          >
            {c}
          </Link>
        ))}
      </div>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED} className="mt-8" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <PredictionCard key={p.id} p={p} />
        ))}
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-muted">
          Nothing here yet.{" "}
          <Link href="/create" className="text-accent hover:underline">
            Make the first prediction →
          </Link>
        </p>
      ) : null}
    </div>
  );
}

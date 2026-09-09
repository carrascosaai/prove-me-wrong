import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RANKINGS, rankingMeta } from "@/lib/rankings";
import { getPredictionRanking, getUserRanking } from "@/lib/db";
import { PredictionCard } from "@/components/PredictionCard";
import { AdSlot } from "@/components/AdSlot";

export const revalidate = 120;

export function generateStaticParams() {
  return RANKINGS.map((r) => ({ type: r.type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const meta = rankingMeta(type);
  if (!meta) return { title: "Rankings" };
  return { title: `${meta.title} predictions`, description: meta.blurb };
}

export default async function RankingDetail({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const meta = rankingMeta(type);
  if (!meta) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/rankings" className="text-sm text-accent hover:underline">
        ← All rankings
      </Link>
      <h1 className="display text-3xl sm:text-4xl mt-2">{meta.title}</h1>
      <p className="mt-2 text-muted">{meta.blurb}</p>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RANKINGS} className="mt-6" />

      <div className="mt-8">
        {meta.kind === "prediction" ? (
          <PredictionList type={type as "confident" | "controversial" | "popular"} />
        ) : (
          <UserList type={type as "accurate" | "wrong"} />
        )}
      </div>
    </div>
  );
}

async function PredictionList({
  type,
}: {
  type: "confident" | "controversial" | "popular";
}) {
  const items = await getPredictionRanking(type);
  if (items.length === 0)
    return <p className="text-muted">Not enough predictions yet.</p>;
  return (
    <ol className="space-y-4">
      {items.map((p, i) => (
        <li key={p.id} className="flex gap-4">
          <span className="display text-2xl text-muted w-8 shrink-0 pt-3">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <PredictionCard p={p} />
          </div>
        </li>
      ))}
    </ol>
  );
}

async function UserList({ type }: { type: "accurate" | "wrong" }) {
  const items = await getUserRanking(type);
  if (items.length === 0)
    return (
      <p className="text-muted">
        No resolved predictions yet — this fills in as calls get settled.
      </p>
    );
  return (
    <ol className="divide-y divide-line border border-line rounded-xl overflow-hidden">
      {items.map((s, i) => (
        <li
          key={s.username}
          className="flex items-center gap-4 px-4 py-3.5"
        >
          <span className="display text-xl text-muted w-6 shrink-0">
            {i + 1}
          </span>
          <span className="font-semibold flex-1">@{s.username}</span>
          <span className="text-sm text-muted text-right">
            {type === "accurate" ? (
              <>
                <span className="text-correct font-semibold">
                  {Math.round(s.accuracy * 100)}%
                </span>{" "}
                · {s.correct}/{s.resolved}
              </>
            ) : (
              <>
                <span className="text-wrong font-semibold">{s.wrong}</span> wrong
                · {s.total} total
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPredictionBySlug, listCommentsByPredictionId } from "@/lib/db";
import { siteUrl } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { Countdown } from "@/components/Countdown";
import { ShareButtons } from "@/components/ShareButtons";
import { AdSlot } from "@/components/AdSlot";
import { VoteWidget } from "./VoteWidget";
import { CommentSection } from "./CommentSection";
import { CreatedBanner } from "./CreatedBanner";
import { ViewPing } from "./ViewPing";

export const revalidate = 30;

type Params = { slug: string };
type Search = { created?: string; token?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPredictionBySlug(slug);
  if (!p) return { title: "Prediction not found" };
  const title = p.prediction.slice(0, 70);
  const desc = `@${p.username} predicted this on ${formatDate(p.created_at)}. Resolves ${formatDate(p.resolution_date)}. Prove them wrong.`;
  const url = `${await siteUrl()}/p/${p.slug}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, type: "article" },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function PredictionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { created, token } = await searchParams;
  const p = await getPredictionBySlug(slug);
  if (!p) notFound();

  const [comments, origin] = await Promise.all([
    listCommentsByPredictionId(p.id),
    siteUrl(),
  ]);
  const shareUrl = `${origin}/p/${p.slug}`;
  const shareText = `"${p.prediction}" — @${p.username} on ${formatDate(p.created_at)}. Prove them wrong:`;
  const resolutionPassed = new Date(p.resolution_date).getTime() < Date.now();

  return (
    <article className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <ViewPing slug={p.slug} />

      {created === "1" ? (
        <CreatedBanner slug={p.slug} token={token} shareUrl={shareUrl} />
      ) : null}

      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={p.status} resolutionDate={p.resolution_date} />
        <Link
          href={`/feed?category=${encodeURIComponent(p.category)}`}
          className="mono text-[11px] uppercase tracking-wide text-faint hover:text-ink"
        >
          {p.category}
        </Link>
      </div>

      <h1 className="mt-4 display text-3xl sm:text-4xl leading-tight">
        {p.prediction}
      </h1>

      <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        <Meta label="Creator" value={`@${p.username}`} />
        <Meta label="Confidence" value={`${p.confidence}%`} />
        <Meta label="Posted" value={formatDate(p.created_at)} />
        <Meta label="Resolves" value={formatDate(p.resolution_date)} />
        {p.resolved_at ? (
          <Meta label="Resolved" value={formatDate(p.resolved_at)} />
        ) : null}
        {p.evidence_url ? (
          <div className="col-span-2">
            <div className="text-muted text-xs uppercase tracking-wide">
              Source
            </div>
            <a
              href={p.evidence_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-accent hover:underline break-all"
            >
              {p.evidence_url}
            </a>
          </div>
        ) : null}
      </div>

      {/* Countdown / verdict */}
      <div
        className={`mt-8 rounded-xl border p-5 sm:p-6 ${
          p.status === "correct"
            ? "border-correct/30 bg-correct/[0.06]"
            : p.status === "wrong"
              ? "border-wrong/30 bg-wrong/[0.06]"
              : "border-line bg-surface/40"
        }`}
      >
        {p.status === "active" && !resolutionPassed ? (
          <>
            <div className="mono text-[11px] uppercase tracking-[0.2em] text-faint mb-4">
              time until resolution
            </div>
            <Countdown target={p.resolution_date} />
          </>
        ) : p.status === "active" && resolutionPassed ? (
          <div className="text-sm text-muted">
            The resolution date has passed. Waiting for{" "}
            <span className="font-medium text-ink">@{p.username}</span> to mark the
            verdict.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className={`display text-2xl sm:text-3xl ${
                p.status === "correct" ? "text-correct" : "text-wrong"
              }`}
            >
              {p.status === "correct" ? "They were right." : "They were wrong."}
            </span>
          </div>
        )}
      </div>

      {/* Vote */}
      <div className="mt-8">
        <VoteWidget
          slug={p.slug}
          agree={p.agree_count}
          doubt={p.doubt_count}
        />
      </div>

      {/* Share */}
      <div className="mt-8">
        <div className="mono text-[11px] uppercase tracking-[0.2em] text-faint mb-3">
          share this prediction
        </div>
        <ShareButtons url={shareUrl} text={shareText} />
        <div className="mt-3">
          <a
            href={`/p/${p.slug}/opengraph-image`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            View the share card ↗
          </a>
        </div>
      </div>

      <AdSlot
        slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_PREDICTION}
        className="my-10"
      />

      <CommentSection slug={p.slug} comments={comments} />
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mono text-faint text-[10px] uppercase tracking-[0.15em]">
        {label}
      </div>
      <div className="mono mt-0.5 font-medium text-sm">{value}</div>
    </div>
  );
}

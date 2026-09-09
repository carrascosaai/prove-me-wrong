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
          className="text-sm text-muted hover:text-ink"
        >
          {p.category}
        </Link>
        {p.is_pro && !p.is_sponsored ? (
          <span className="text-xs font-semibold text-[#8a6a00] border border-pro/50 rounded-full px-2 py-0.5">
            PRO
          </span>
        ) : null}
        {p.is_sponsored ? (
          <span className="text-xs font-semibold text-[#8a6a00] border border-pro/50 rounded-full px-2 py-0.5">
            SPONSORED{p.sponsor_name ? ` · ${p.sponsor_name}` : ""}
          </span>
        ) : null}
      </div>

      <h1
        className={`mt-4 display text-3xl sm:text-4xl leading-tight ${
          p.is_pro ? "text-[#7a5c00]" : ""
        }`}
      >
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
      <div className="mt-8 rounded-xl border border-line p-5 sm:p-6">
        {p.status === "active" && !resolutionPassed ? (
          <>
            <div className="text-xs uppercase tracking-widest text-muted mb-3">
              Time until resolution
            </div>
            <Countdown target={p.resolution_date} />
          </>
        ) : p.status === "active" && resolutionPassed ? (
          <div className="text-sm">
            The resolution date has passed. Waiting for{" "}
            <span className="font-medium">@{p.username}</span> to mark the verdict.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span
              className={`display text-2xl ${
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
        <div className="text-xs uppercase tracking-widest text-muted mb-3">
          Share this prediction
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

      {!p.is_pro ? (
        <div className="mt-8 rounded-xl border border-pro/40 bg-pro/[0.05] p-5">
          <div className="font-semibold text-[#7a5c00]">
            Make it a PRO prediction — €2.99
          </div>
          <p className="text-sm text-muted mt-1">
            Highlight it, get a badge, pin it higher in rankings and unlock
            advanced stats.
          </p>
          <Link
            href={`/pro/${p.slug}`}
            className="mt-3 inline-block rounded-md bg-[#7a5c00] text-white px-4 py-2 text-sm font-semibold hover:opacity-90"
          >
            Upgrade this prediction
          </Link>
        </div>
      ) : null}

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
      <div className="text-muted text-xs uppercase tracking-wide">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { getPredictionBySlug, markPredictionPro } from "@/lib/db";
import { STRIPE_LIVE } from "@/lib/env";
import { stripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Upgrade complete",
  robots: { index: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string; session_id?: string; simulated?: string }>;
}) {
  const { slug, session_id, simulated } = await searchParams;

  // Belt-and-braces: if the webhook hasn't landed yet, confirm the paid
  // session here too before showing success.
  if (slug && STRIPE_LIVE && session_id && !simulated) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      if (s.payment_status === "paid") await markPredictionPro(slug);
    } catch {
      // fall through
    }
  }

  const p = slug ? await getPredictionBySlug(slug) : null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="display text-4xl text-correct">PRO ✓</div>
      <h1 className="display text-2xl mt-3">
        {simulated ? "Simulated upgrade complete" : "Your prediction is now PRO"}
      </h1>
      <p className="mt-2 text-muted">
        {p
          ? "It's now highlighted with a PRO badge and ranked higher."
          : "The upgrade has been recorded."}
      </p>
      {slug ? (
        <Link
          href={`/p/${slug}`}
          className="mt-6 inline-block rounded-md bg-accent text-accent-ink px-5 py-3 font-semibold hover:bg-accent/90"
        >
          View your prediction →
        </Link>
      ) : (
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">
          Back home
        </Link>
      )}
      {simulated ? (
        <p className="mt-4 text-xs text-muted">
          No payment was taken. This is what the buyer sees after a real Stripe
          checkout once <code>PAYMENTS_ENABLED=true</code>.
        </p>
      ) : null}
    </div>
  );
}

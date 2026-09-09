import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPredictionBySlug } from "@/lib/db";
import { PAYMENTS_ENABLED, STRIPE_LIVE, PRO_PRICE_CENTS } from "@/lib/env";
import { priceEuros } from "@/lib/format";
import { CheckoutButton } from "./CheckoutButton";

export const metadata: Metadata = {
  title: "PRO prediction",
  robots: { index: false },
};

const PERKS = [
  "Highlighted card with a distinct PRO colour",
  "PRO badge on the prediction and in rankings",
  "Higher placement in feed and ranking lists",
  "Advanced stats: view history, vote split over time, referrers",
];

export default async function ProPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPredictionBySlug(slug);
  if (!p) notFound();

  if (p.is_pro) {
    return (
      <div className="mx-auto max-w-lg px-4 py-14 text-center">
        <h1 className="display text-3xl">Already PRO ✓</h1>
        <Link
          href={`/p/${slug}`}
          className="mt-4 inline-block text-accent hover:underline"
        >
          Back to the prediction →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl">
        PRO prediction — {priceEuros(PRO_PRICE_CENTS)}
      </h1>
      <p className="mt-2 text-muted">
        One-time upgrade for this prediction:
      </p>
      <p className="mt-4 rounded-lg border border-line p-4 font-medium">
        “{p.prediction}”
      </p>

      <ul className="mt-6 space-y-2">
        {PERKS.map((perk) => (
          <li key={perk} className="flex gap-2 text-sm">
            <span className="text-correct">✓</span>
            {perk}
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <CheckoutButton slug={slug} />
      </div>

      {!PAYMENTS_ENABLED ? (
        <p className="mt-4 text-xs text-muted">
          Payments are currently <strong>disabled</strong> (PAYMENTS_ENABLED=false).
          You&apos;ll see a simulated checkout — no card, no charge.
        </p>
      ) : !STRIPE_LIVE ? (
        <p className="mt-4 text-xs text-muted">
          Payments are enabled but Stripe keys are missing, so checkout runs in
          simulation mode.
        </p>
      ) : (
        <p className="mt-4 text-xs text-muted">
          Secure payment via Stripe. We never see or store your card details.
        </p>
      )}
    </div>
  );
}

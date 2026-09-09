import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPredictionBySlug } from "@/lib/db";
import { PRO_PRICE_CENTS } from "@/lib/env";
import { priceEuros } from "@/lib/format";
import { SimulateForm } from "./SimulateForm";

export const metadata: Metadata = {
  title: "Simulated checkout",
  robots: { index: false },
};

export default async function SimulatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getPredictionBySlug(slug);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-xl border border-line p-6">
        <div className="text-xs uppercase tracking-widest text-muted">
          Simulated checkout
        </div>
        <p className="mt-1 text-sm text-muted">
          Payments are disabled. This mimics the Stripe flow without a real
          charge. Flip <code>PAYMENTS_ENABLED=true</code> and add Stripe keys to
          go live.
        </p>

        <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
          <span className="font-medium">PRO prediction</span>
          <span className="display text-xl">{priceEuros(PRO_PRICE_CENTS)}</span>
        </div>
        <p className="mt-1 text-xs text-muted line-clamp-2">
          “{p.prediction}”
        </p>

        <div className="mt-6">
          <SimulateForm slug={slug} />
        </div>
      </div>
    </div>
  );
}

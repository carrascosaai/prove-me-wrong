import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sponsored predictions",
  description:
    "Put your brand on a prediction the internet will be watching.",
};

export default function SponsorsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="display text-4xl">Sponsored predictions</h1>
      <p className="mt-3 text-muted">
        A prediction page is a single, shareable unit of attention with a
        built-in reason to come back: the countdown. Brands can sponsor one.
      </p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed">
        <p>A sponsored prediction gets:</p>
        <ul className="space-y-2">
          <li className="flex gap-2">
            <span className="text-correct">✓</span> Your name on the card and the
            public page (“Sponsored · YourBrand”)
          </li>
          <li className="flex gap-2">
            <span className="text-correct">✓</span> Pinned placement on the home
            page and relevant rankings for the campaign window
          </li>
          <li className="flex gap-2">
            <span className="text-correct">✓</span> A custom share card with your
            logo
          </li>
          <li className="flex gap-2">
            <span className="text-correct">✓</span> Aggregate engagement report
            (views, vote split, shares)
          </li>
        </ul>
        <p className="text-muted">
          We only accept sponsorships that are clearly labelled and relevant.
          No political advertising.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-line p-5">
        <div className="font-semibold">Interested?</div>
        <p className="text-sm text-muted mt-1">
          Email <span className="text-ink">sponsors@yourdomain.com</span> with
          your brand, the prediction you have in mind and the dates. This is
          handled manually while volume is low.
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block text-sm text-accent hover:underline"
      >
        ← Back home
      </Link>
    </div>
  );
}

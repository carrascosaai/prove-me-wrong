import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose-sm">
      <h1 className="display text-3xl">Terms of use</h1>
      <p className="mt-4 text-sm text-muted">
        Placeholder terms — replace with legal copy before launch.
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed">
        <p>
          PROVE ME WRONG is a public bulletin board for predictions. Anything you
          publish becomes a public, permanent, timestamped record. You cannot
          edit a prediction&apos;s text after publishing.
        </p>
        <p>
          Do not post content that is illegal, defamatory, hateful, or that
          targets or harasses a private individual. We may remove predictions or
          comments and block abusive users at our discretion.
        </p>
        <p>
          Predictions and their verdicts are user-generated. We do not verify
          claims and this site is not financial, legal, or investment advice.
        </p>
        <p>
          PRO upgrades are one-time digital purchases and are non-refundable once
          the prediction is upgraded, except where required by law.
        </p>
        <p>The service is provided “as is”, without warranty.</p>
      </div>
    </div>
  );
}

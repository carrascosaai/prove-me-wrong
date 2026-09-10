import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="display text-3xl">Terms of use</h1>
      <p className="mt-4 text-sm text-muted">
        Plain-language summary. Have it reviewed before relying on it legally.
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed">
        <p>
          PROVE ME WRONG is a public bulletin board for predictions. Anything you
          publish becomes a public, permanent, timestamped record. You cannot
          edit a prediction&apos;s text after publishing.
        </p>
        <p>
          Do not post content that is illegal, defamatory, hateful, or that
          targets or harasses a private individual, and do not spam or automate
          submissions. We may hide or remove predictions or comments and block
          abusive users at our discretion.
        </p>
        <p>
          Predictions and their verdicts are user-generated. We do not verify
          claims and this site is not financial, legal, or investment advice.
        </p>
        <p>
          To report content, use the &ldquo;Report content&rdquo; link in the
          footer
          {CONTACT_EMAIL ? (
            <>
              {" "}
              or email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </>
          ) : null}
          .
        </p>
        <p>The service is provided &ldquo;as is&rdquo;, without warranty.</p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="display text-3xl">Privacy</h1>
      <p className="mt-4 text-sm text-muted">
        Plain-language summary. Have it reviewed before relying on it legally.
      </p>
      <div className="mt-6 space-y-4 text-sm leading-relaxed">
        <p>
          <strong>No accounts.</strong> Creating a prediction only requires a
          display name of your choosing. We don&apos;t ask for an email.
        </p>
        <p>
          <strong>What we store.</strong> The prediction text, category, dates,
          optional source link, display name, and engagement counts (views,
          votes, comments). For abuse prevention and vote de-duplication we store
          a one-way hash of your IP address and user-agent — never the raw
          values. Analytics is aggregated by day, page and referrer domain only —
          no per-visitor records, no cookies.
        </p>
        <p>
          <strong>Ads.</strong> None are served today. If advertising is enabled
          later, third parties such as Google may set cookies; you will be able to
          decline non-essential ones.
        </p>
        <p id="removal">
          <strong>Removal.</strong> To request removal of a prediction or
          comment, send its URL{" "}
          {CONTACT_EMAIL ? (
            <>
              to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-accent hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </>
          ) : (
            "to the project owner"
          )}
          . If it&apos;s your own prediction, use its manage link.
        </p>
      </div>
    </div>
  );
}

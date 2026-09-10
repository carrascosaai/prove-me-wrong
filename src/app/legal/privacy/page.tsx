import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="display text-3xl">Privacy</h1>
      <p className="mt-4 text-sm text-muted">
        Placeholder policy — replace with a reviewed policy before launch.
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
          values.
        </p>
        <p>
          <strong>Analytics & ads.</strong> If advertising is enabled, third
          parties such as Google may set cookies. You can decline non-essential
          cookies.
        </p>
        <p>
          <strong>Removal.</strong> To request removal of a prediction, contact
          us with its URL and the manage link.
        </p>
      </div>
    </div>
  );
}

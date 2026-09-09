"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CreatedBanner({
  slug,
  token,
  shareUrl,
}: {
  slug: string;
  token?: string;
  shareUrl: string;
}) {
  const [copiedManage, setCopiedManage] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const manageUrl = token
    ? `${origin}/p/${slug}/manage?token=${encodeURIComponent(token)}`
    : null;

  return (
    <div className="mb-8 rounded-xl border border-correct/40 bg-correct/[0.06] p-5">
      <div className="font-semibold text-correct">Prediction published ✓</div>
      <p className="text-sm text-muted mt-1">
        Its public page is live at{" "}
        <span className="font-medium text-ink">{shareUrl}</span>
      </p>

      {manageUrl ? (
        <div className="mt-4">
          <div className="text-xs uppercase tracking-wide text-muted">
            Your private manage link — save it now
          </div>
          <p className="text-xs text-muted mb-2">
            This is the only way to mark the verdict later. We don&apos;t email it
            to you.
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={manageUrl}
              className="flex-1 rounded-md border border-line bg-paper px-3 py-2 text-xs"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(manageUrl);
                  setCopiedManage(true);
                  setTimeout(() => setCopiedManage(false), 1800);
                } catch {
                  // ignore
                }
              }}
              className="rounded-md bg-ink text-paper px-3 py-2 text-xs font-medium"
            >
              {copiedManage ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <Link
            href={`/p/${slug}/manage?token=${encodeURIComponent(token ?? "")}`}
            className="mt-2 inline-block text-xs text-accent hover:underline"
          >
            Open manage page →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

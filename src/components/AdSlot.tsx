import { ADSENSE_CLIENT } from "@/lib/env";

/**
 * Discreet ad placeholder. Renders a real AdSense unit only when
 * NEXT_PUBLIC_ADSENSE_CLIENT is set; otherwise renders nothing in
 * production and a labelled box in development so layout is visible.
 *
 * Never place this inside the create flow.
 */
export function AdSlot({
  slot,
  className = "",
  label = "Advertisement",
}: {
  slot?: string;
  className?: string;
  label?: string;
}) {
  if (ADSENSE_CLIENT && slot) {
    return (
      <div className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
          }}
        />
      </div>
    );
  }

  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        className={`rounded-lg border border-dashed border-line text-muted text-xs flex items-center justify-center py-6 ${className}`}
      >
        {label} slot{slot ? ` · ${slot}` : ""}
      </div>
    );
  }

  return null;
}

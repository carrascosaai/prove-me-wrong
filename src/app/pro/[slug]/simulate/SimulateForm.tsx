"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SimulateForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function complete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        setError("Simulation failed.");
        return;
      }
      router.push(`/pro/success?slug=${slug}&simulated=1`);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="mono rounded-md bg-white/5 px-3 py-2 text-xs text-muted">
        Test card 4242 4242 4242 4242 · any future date · any CVC
      </div>
      <button
        type="button"
        onClick={complete}
        disabled={loading}
        className="w-full rounded-md bg-pro text-accent-ink px-4 py-3 font-semibold hover:bg-pro/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing…" : "Complete simulated payment"}
      </button>
      {error ? <p className="text-sm text-wrong">{error}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";

export function CheckoutButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, product: "pro_prediction" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Could not start checkout.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={loading}
        className="w-full rounded-md bg-pro text-accent-ink px-4 py-3 font-semibold hover:bg-pro/90 disabled:opacity-50 transition-colors"
      >
        {loading ? "Starting checkout…" : "Continue to payment"}
      </button>
      {error ? <p className="mt-2 text-sm text-wrong">{error}</p> : null}
    </div>
  );
}

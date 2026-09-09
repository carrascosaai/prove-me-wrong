"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="display text-5xl">Something broke.</div>
      <p className="mt-3 text-muted">
        That&apos;s on us, not on your prediction. Try again.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-ink text-paper px-5 py-3 font-semibold hover:opacity-90"
        >
          Retry
        </button>
        <Link
          href="/"
          className="rounded-md border border-line px-5 py-3 font-medium hover:bg-black/[0.04]"
        >
          Home
        </Link>
      </div>
    </div>
  );
}

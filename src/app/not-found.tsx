import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="display text-6xl">404</div>
      <p className="mt-3 text-muted">
        This prediction doesn&apos;t exist — or never did.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-accent text-accent-ink px-5 py-3 font-semibold hover:bg-accent/90"
        >
          Home
        </Link>
        <Link
          href="/create"
          className="rounded-md border border-line-strong px-5 py-3 font-medium hover:bg-white/5"
        >
          Make a prediction
        </Link>
      </div>
    </div>
  );
}

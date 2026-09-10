import Link from "next/link";

export function Nav() {
  return (
    <header className="border-b border-line sticky top-0 z-40 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="display text-base sm:text-lg tracking-tight shrink-0"
        >
          PROVE&nbsp;ME&nbsp;WRONG<span className="text-accent">.</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/rankings"
            className="hidden sm:inline-block px-3 py-2 rounded-md hover:bg-white/5 text-muted hover:text-ink transition-colors"
          >
            Rankings
          </Link>
          <Link
            href="/feed"
            className="hidden sm:inline-block px-3 py-2 rounded-md hover:bg-white/5 text-muted hover:text-ink transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/create"
            className="ml-1 rounded-md bg-accent text-accent-ink px-3.5 py-2 font-semibold hover:bg-accent/90 transition-colors whitespace-nowrap"
          >
            Make a prediction
          </Link>
        </nav>
      </div>
    </header>
  );
}

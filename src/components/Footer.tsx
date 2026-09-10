import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/env";

export function Footer() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="mx-auto max-w-5xl px-4 py-10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-sm text-muted">
        <div className="display text-base text-ink">
          PROVE ME WRONG<span className="text-accent">.</span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/rankings" className="hover:text-ink">Rankings</Link>
          <Link href="/feed" className="hover:text-ink">Feed</Link>
          <Link href="/mine" className="hover:text-ink">My predictions</Link>
          <Link href="/legal/terms" className="hover:text-ink">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-ink">Privacy</Link>
          {CONTACT_EMAIL ? (
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=PROVE%20ME%20WRONG%20report`}
              className="hover:text-ink"
            >
              Report content
            </a>
          ) : (
            <Link href="/legal/privacy#removal" className="hover:text-ink">
              Report content
            </Link>
          )}
        </nav>
        <div>© {new Date().getFullYear()}</div>
      </div>
    </footer>
  );
}

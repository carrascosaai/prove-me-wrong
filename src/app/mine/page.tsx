import type { Metadata } from "next";
import { MineList } from "./MineList";

export const metadata: Metadata = {
  title: "My predictions",
  robots: { index: false, follow: false },
};

export default function MinePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl">My predictions</h1>
      <p className="mono mt-2 text-xs text-muted">
        Remembered in this browser only — no account. Clearing site data or
        switching device loses this list, so keep your manage links somewhere
        safe.
      </p>
      <div className="mt-8">
        <MineList />
      </div>
    </div>
  );
}

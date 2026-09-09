import Link from "next/link";
import type { Metadata } from "next";
import { verifyManageToken } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { ResolveForm } from "./ResolveForm";

export const metadata: Metadata = {
  title: "Manage prediction",
  robots: { index: false, follow: false },
};

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <Shell>
        <p className="text-sm text-wrong">
          Missing manage token. Use the private link you were given when you
          created the prediction.
        </p>
      </Shell>
    );
  }

  const p = await verifyManageToken(slug, token);
  if (p === null) {
    // Could be wrong token or missing prediction.
    return (
      <Shell>
        <p className="text-sm text-wrong">
          That manage link isn&apos;t valid for this prediction.
        </p>
        <Link href={`/p/${slug}`} className="text-sm text-accent hover:underline">
          ← Back to the prediction
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="rounded-xl border border-line p-5">
        <div className="text-xs uppercase tracking-wide text-muted">
          Your prediction
        </div>
        <p className="mt-1 font-semibold">{p.prediction}</p>
        <p className="mt-2 text-sm text-muted">
          Resolves {formatDate(p.resolution_date)} · current status:{" "}
          <span className="font-medium uppercase">{p.status}</span>
        </p>
      </div>

      {p.status === "active" ? (
        <ResolveForm slug={slug} token={token} />
      ) : (
        <p className="text-sm text-muted">
          This prediction is already resolved as{" "}
          <span className="font-semibold uppercase">{p.status}</span>. Verdicts
          are final.
        </p>
      )}

      <Link href={`/p/${slug}`} className="text-sm text-accent hover:underline">
        ← View public page
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 space-y-6">
      <h1 className="display text-3xl">Manage prediction</h1>
      {children}
    </div>
  );
}

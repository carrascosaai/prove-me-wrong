import type { Metadata } from "next";
import Link from "next/link";
import {
  adminRecentComments,
  adminRecentPredictions,
  type AdminComment,
  type AdminPrediction,
} from "@/lib/db";
import { ADMIN_SECRET, HAS_DB_WRITE } from "@/lib/env";
import { formatDateShort } from "@/lib/format";
import { adminAction } from "./actions";

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;

  if (!ADMIN_SECRET) {
    return (
      <Shell>
        <p className="text-sm text-wrong">
          Set <code>ADMIN_SECRET</code> in Vercel first, then open{" "}
          <code>/admin?key=YOUR_SECRET</code>.
        </p>
      </Shell>
    );
  }
  if (key !== ADMIN_SECRET) {
    return (
      <Shell>
        <p className="text-sm text-muted">
          Add <code className="text-ink">?key=YOUR_ADMIN_SECRET</code> to the URL.
        </p>
      </Shell>
    );
  }
  if (!HAS_DB_WRITE) {
    return (
      <Shell>
        <p className="text-sm text-muted">Supabase isn&apos;t configured here.</p>
      </Shell>
    );
  }

  const [predictions, comments] = await Promise.all([
    adminRecentPredictions(60),
    adminRecentComments(60),
  ]);

  return (
    <Shell>
      <section className="mt-8">
        <h2 className="mono text-[11px] uppercase tracking-[0.2em] text-faint mb-3">
          recent predictions ({predictions.length})
        </h2>
        <ul className="space-y-2">
          {predictions.map((p) => (
            <PredictionRow key={p.id} p={p} adminKey={key} />
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="mono text-[11px] uppercase tracking-[0.2em] text-faint mb-3">
          recent comments ({comments.length})
        </h2>
        <ul className="space-y-2">
          {comments.map((c) => (
            <CommentRow key={c.id} c={c} adminKey={key} />
          ))}
        </ul>
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="display text-3xl sm:text-4xl">Moderation</h1>
      {children}
    </div>
  );
}

function OpButton({
  op,
  kind,
  id,
  adminKey,
  label,
  danger = false,
}: {
  op: string;
  kind: "prediction" | "comment";
  id: string;
  adminKey: string;
  label: string;
  danger?: boolean;
}) {
  return (
    <form action={adminAction} className="inline">
      <input type="hidden" name="key" value={adminKey} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={`mono text-[11px] hover:underline ${
          danger ? "text-wrong" : "text-accent"
        }`}
      >
        {label}
      </button>
    </form>
  );
}

function PredictionRow({
  p,
  adminKey,
}: {
  p: AdminPrediction;
  adminKey: string;
}) {
  return (
    <li
      className={`rounded-lg border p-3 ${
        p.is_hidden ? "border-wrong/40 bg-wrong/[0.05]" : "border-line"
      }`}
    >
      <div className="text-sm">
        <Link href={`/p/${p.slug}`} className="hover:underline">
          {p.prediction}
        </Link>
      </div>
      <div className="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
        <span>@{p.username}</span>
        <span>{p.category}</span>
        <span className="uppercase">{p.status}</span>
        <span>{formatDateShort(p.created_at)}</span>
        {p.is_hidden ? <span className="text-wrong">HIDDEN</span> : null}
        <span className="mx-1 text-line-strong">·</span>
        <OpButton
          op={p.is_hidden ? "unhide" : "hide"}
          kind="prediction"
          id={p.id}
          adminKey={adminKey}
          label={p.is_hidden ? "unhide" : "hide"}
        />
        <OpButton
          op="delete"
          kind="prediction"
          id={p.id}
          adminKey={adminKey}
          label="delete"
          danger
        />
      </div>
    </li>
  );
}

function CommentRow({ c, adminKey }: { c: AdminComment; adminKey: string }) {
  return (
    <li
      className={`rounded-lg border p-3 ${
        c.is_hidden ? "border-wrong/40 bg-wrong/[0.05]" : "border-line"
      }`}
    >
      <div className="text-sm whitespace-pre-wrap">{c.body}</div>
      <div className="mono mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-faint">
        <span>@{c.username}</span>
        {c.prediction_slug ? (
          <Link
            href={`/p/${c.prediction_slug}`}
            className="text-accent hover:underline"
          >
            on /p/{c.prediction_slug}
          </Link>
        ) : null}
        <span>{formatDateShort(c.created_at)}</span>
        {c.is_hidden ? <span className="text-wrong">HIDDEN</span> : null}
        <span className="mx-1 text-line-strong">·</span>
        <OpButton
          op={c.is_hidden ? "unhide" : "hide"}
          kind="comment"
          id={c.id}
          adminKey={adminKey}
          label={c.is_hidden ? "unhide" : "hide"}
        />
        <OpButton
          op="delete"
          kind="comment"
          id={c.id}
          adminKey={adminKey}
          label="delete"
          danger
        />
      </div>
    </li>
  );
}

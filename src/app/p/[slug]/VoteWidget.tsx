"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { voteAction, type VoteState } from "@/app/actions";

function VoteButton({
  choice,
  active,
  disabled,
  children,
}: {
  choice: "agree" | "doubt";
  active: boolean;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="choice"
      value={choice}
      disabled={disabled || pending}
      className={`w-full rounded-md border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 ${
        active
          ? choice === "agree"
            ? "border-correct bg-correct/10 text-correct"
            : "border-wrong bg-wrong/10 text-wrong"
          : "border-line bg-white/[0.02] hover:border-line-strong hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

export function VoteWidget({
  slug,
  agree,
  doubt,
}: {
  slug: string;
  agree: number;
  doubt: number;
}) {
  const [state, action] = useActionState<VoteState, FormData>(voteAction, null);
  const [storedVote, setStoredVote] = useState<string | null>(null);

  useEffect(() => {
    try {
      setStoredVote(localStorage.getItem(`pmw:voted:${slug}`));
    } catch {
      // ignore
    }
  }, [slug]);

  useEffect(() => {
    if (state?.voted) {
      try {
        localStorage.setItem(`pmw:voted:${slug}`, state.voted);
      } catch {
        // ignore
      }
      setStoredVote(state.voted);
    }
  }, [state, slug]);

  const voted = storedVote ?? state?.voted ?? null;
  const counts = state ?? { agree, doubt };
  const total = counts.agree + counts.doubt;
  const agreePct = total > 0 ? Math.round((counts.agree / total) * 100) : 50;
  const doubtPct = 100 - agreePct;

  return (
    <div className="rounded-xl border border-line bg-surface/40 p-5">
      <div className="mono text-[11px] uppercase tracking-[0.2em] text-faint mb-3">
        do you buy it?
      </div>

      <form action={action} className="flex gap-2">
        <input type="hidden" name="slug" value={slug} />
        <div className="flex-1">
          <VoteButton choice="agree" active={voted === "agree"} disabled={!!voted}>
            I think they&apos;re right
          </VoteButton>
        </div>
        <div className="flex-1">
          <VoteButton choice="doubt" active={voted === "doubt"} disabled={!!voted}>
            Prove me wrong
          </VoteButton>
        </div>
      </form>

      <div className="mt-4">
        <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.08]">
          <div className="bg-correct/80" style={{ width: `${agreePct}%` }} />
          <div className="bg-wrong/80" style={{ width: `${doubtPct}%` }} />
        </div>
        <div className="mono mt-1.5 flex justify-between text-[11px] text-faint">
          <span>
            {agreePct}% believe it ({counts.agree})
          </span>
          <span>
            {doubtPct}% doubt it ({counts.doubt})
          </span>
        </div>
      </div>
      {voted ? (
        <p className="mono mt-2 text-[11px] text-muted">
          thanks — your vote is counted.
        </p>
      ) : null}
    </div>
  );
}

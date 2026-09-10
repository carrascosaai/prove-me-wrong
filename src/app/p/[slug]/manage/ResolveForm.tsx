"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { resolveAction, type ResolveState } from "@/app/actions";

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full rounded-md bg-accent text-accent-ink px-4 py-3 font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
    >
      {pending ? "Saving…" : "Submit final verdict"}
    </button>
  );
}

export function ResolveForm({ slug, token }: { slug: string; token: string }) {
  const [state, action] = useActionState<ResolveState, FormData>(
    resolveAction,
    {},
  );
  const [verdict, setVerdict] = useState<string>("");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="token" value={token} />

      <div className="text-sm font-medium">What actually happened?</div>
      <div className="grid grid-cols-2 gap-3">
        {(["correct", "wrong"] as const).map((v) => (
          <label
            key={v}
            className={`cursor-pointer rounded-md border px-3 py-3 text-center text-sm font-semibold capitalize transition-colors ${
              verdict === v
                ? v === "correct"
                  ? "border-correct bg-correct/10 text-correct"
                  : "border-wrong bg-wrong/10 text-wrong"
                : "border-line hover:border-line-strong"
            }`}
          >
            <input
              type="radio"
              name="verdict"
              value={v}
              className="sr-only"
              onChange={() => setVerdict(v)}
            />
            {v === "correct" ? "I was right" : "I was wrong"}
          </label>
        ))}
      </div>

      <p className="text-xs text-muted">
        This is permanent and public. It feeds the accuracy rankings.
      </p>

      {state.error ? (
        <p className="text-sm text-wrong">{state.error}</p>
      ) : null}

      <Submit disabled={!verdict} />
    </form>
  );
}

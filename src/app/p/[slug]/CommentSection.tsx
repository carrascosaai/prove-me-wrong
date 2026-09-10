"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { addCommentAction, type CommentState } from "@/app/actions";
import { formatDateShort } from "@/lib/format";
import type { Comment } from "@/lib/types";

const field =
  "w-full rounded-md border border-line bg-white/[0.03] px-3 py-2 text-sm outline-none focus:border-accent focus:bg-white/[0.05] transition-colors placeholder:text-faint";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-accent text-accent-ink px-4 py-2 text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
    >
      {pending ? "Posting…" : "Post"}
    </button>
  );
}

export function CommentSection({
  slug,
  comments,
}: {
  slug: string;
  comments: Comment[];
}) {
  const [state, action] = useActionState<CommentState, FormData>(
    addCommentAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <section id="discussion">
      <h2 className="display text-2xl">
        Discussion & evidence{" "}
        <span className="text-muted font-normal text-lg">
          ({comments.length})
        </span>
      </h2>

      <form ref={formRef} action={action} className="mt-4 space-y-3">
        <input type="hidden" name="slug" value={slug} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
        <div className="grid sm:grid-cols-[1fr_2fr] gap-3">
          <input
            name="username"
            placeholder="Name"
            maxLength={40}
            className={field}
          />
          <input
            name="url"
            type="url"
            placeholder="Evidence link (optional)"
            className={field}
          />
        </div>
        <textarea
          name="body"
          rows={3}
          required
          maxLength={1000}
          placeholder="Add context, a source, or tell them why they're wrong…"
          className={field}
        />
        {state.error ? (
          <p className="text-sm text-wrong">{state.error}</p>
        ) : null}
        <div className="flex justify-end">
          <Submit />
        </div>
      </form>

      <ul className="mt-8 space-y-5">
        {comments.length === 0 ? (
          <li className="text-sm text-muted">
            No comments yet. Be the first to weigh in.
          </li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="border-b border-line pb-5 last:border-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold">@{c.username}</span>
                <span className="text-muted">
                  {formatDateShort(c.created_at)}
                </span>
              </div>
              <p className="mt-1.5 text-sm whitespace-pre-wrap">{c.body}</p>
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="mt-1.5 inline-block text-xs text-accent hover:underline break-all"
                >
                  {c.url}
                </a>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

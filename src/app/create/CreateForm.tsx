"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPredictionAction, type CreateState } from "@/app/actions";
import { CATEGORIES } from "@/lib/categories";

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-ink transition-colors";
const labelCls = "block text-sm font-medium mb-1.5";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-ink text-paper px-4 py-3 font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? "Publishing…" : "Publish prediction"}
    </button>
  );
}

export function CreateForm() {
  const [state, formAction] = useActionState<CreateState, FormData>(
    createPredictionAction,
    {},
  );
  const [confidence, setConfidence] = useState(60);
  const [count, setCount] = useState(0);

  // default resolution date: 90 days out
  const defaultDate = new Date(Date.now() + 90 * 86400_000)
    .toISOString()
    .slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="prediction" className={labelCls}>
          Prediction
        </label>
        <textarea
          id="prediction"
          name="prediction"
          rows={3}
          required
          maxLength={280}
          placeholder="e.g. Bitcoin will pass $150,000 before 2027."
          className={field}
          onChange={(e) => setCount(e.target.value.length)}
        />
        <div className="mt-1 text-right text-xs text-muted">{count}/280</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className={labelCls}>
            Category
          </label>
          <select id="category" name="category" required className={field} defaultValue="">
            <option value="" disabled>
              Choose…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="resolution_date" className={labelCls}>
            Resolution date
          </label>
          <input
            id="resolution_date"
            name="resolution_date"
            type="date"
            required
            defaultValue={defaultDate}
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="confidence" className={labelCls}>
          How confident are you? <span className="text-muted">({confidence}%)</span>
        </label>
        <input
          id="confidence"
          name="confidence"
          type="range"
          min={1}
          max={100}
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
        <div className="flex justify-between text-xs text-muted mt-1">
          <span>Just a hunch</span>
          <span>I&apos;d bet my house</span>
        </div>
      </div>

      <div>
        <label htmlFor="evidence_url" className={labelCls}>
          Evidence / source <span className="text-muted">(optional)</span>
        </label>
        <input
          id="evidence_url"
          name="evidence_url"
          type="url"
          placeholder="https://…"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="username" className={labelCls}>
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          minLength={2}
          maxLength={40}
          placeholder="how you want to be credited"
          className={field}
        />
        <p className="mt-1 text-xs text-muted">
          No account needed. This is just the name shown on your prediction.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-md bg-wrong/10 text-wrong text-sm px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-xs text-muted">
        By publishing you agree it becomes a public, permanent record. Don&apos;t
        post anything illegal, defamatory or targeting a private individual.
      </p>
    </form>
  );
}

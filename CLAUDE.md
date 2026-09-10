# PROVE ME WRONG — working notes

Public board for dated predictions. "Say it now. Prove it later."
See `README.md` for setup and deploy.

## Stack

Next.js 15 App Router · TypeScript (strict) · Tailwind v4 (`@theme` in
`src/app/globals.css`, no `tailwind.config`) · Supabase (Postgres) · Vercel.
No auth — a prediction only carries a free-text `username`. No payments —
free product; revisit only if it gets traction.

## Architecture

- **Data layer**: `src/lib/db.ts` is the only module that touches storage. Every
  function has two backends chosen at runtime:
  - Supabase when `NEXT_PUBLIC_SUPABASE_URL` + keys are set (`HAS_DB` /
    `HAS_DB_WRITE` in `src/lib/env.ts`).
  - Otherwise an in-memory seeded store (`src/lib/demoStore.ts`) so the app runs
    with zero config. Never import `demoStore` outside `db.ts`.
- **Reads**: anon Supabase client, RLS = public `select`. **Writes**: service
  role client, server-only. Schema + RLS + RPCs in `supabase/schema.sql`.
- **Mutations** go through server actions in `src/app/actions.ts` (create, vote,
  comment, resolve) or route handlers under `src/app/api/`.
- **Creator auth for resolving a verdict**: a random `manage_token` is generated
  on create, returned to the browser once, and stored only as a SHA-256 hash
  (`manage_token_hash`). `verifyManageToken` / `resolvePrediction` hash the
  incoming token to compare.
- **Absolute URLs**: use `siteUrl()` from `src/lib/site.ts` (env var, else Host
  header) — only in dynamic routes. Client components use
  `window.location.origin`.
- **Share cards**: `src/app/**/opengraph-image.tsx` via `next/og`; fonts loaded
  through `src/lib/ogFont.ts` with a graceful fallback to Satori's default.

## Conventions

- Ads: only `src/components/AdSlot.tsx`, and never on `/create`. Renders nothing
  until `NEXT_PUBLIC_ADSENSE_CLIENT` is set.
- `is_pro` / `is_sponsored` columns still exist for a future "featured" flag but
  nothing sets them and nothing renders them — no purchase path.
- Keep pages server components; push interactivity into small `"use client"`
  leaves (`Countdown`, `VoteWidget`, `ShareButtons`, form components).
- **Abuse control** in `src/app/actions.ts`: honeypot (`isBot`) first, then
  `containsBlockedTerm` (short slur list in `src/lib/moderation.ts`), then
  `rateCheck` (per-IP, `pmw_rate_check` RPC, fail-open).
- **Moderation**: `is_hidden` on predictions/comments; every public read filters
  it out. `/admin?key=ADMIN_SECRET` lists recent rows with hide/delete.
- **`/mine`**: localStorage only (`src/lib/mine.ts`), written by `CreatedBanner`.
- **`/stats`**: aggregated pageviews (`pmw_stats` + `pmw_track`), fed by
  `<Track/>` in the layout. Public unless `ADMIN_SECRET` is set.
- SQL lives in `supabase/`: `schema.sql`, then `analytics.sql`, then
  `hardening.sql`. All idempotent, all `pmw_`-prefixed.
- `revalidate` is set per route; don't make list/detail pages fully dynamic
  without reason (cost target: 100k visitors on free tiers).

## Checks

```
npm run typecheck   # tsc --noEmit
npm run lint         # eslint (next/core-web-vitals + next/typescript)
npm run build
```

## Out of scope

Payments, mobile app, AI, chat, marketplace, complex social graph, user
accounts.

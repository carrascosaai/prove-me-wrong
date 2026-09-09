# PROVE ME WRONG — working notes

Public board for dated predictions. "Say it now. Prove it later."
See `README.md` for setup and deploy.

## Stack

Next.js 15 App Router · TypeScript (strict) · Tailwind v4 (`@theme` in
`src/app/globals.css`, no `tailwind.config`) · Supabase (Postgres) · Stripe
Checkout · Vercel. No auth — a prediction only carries a free-text `username`.

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

- Money is integer cents (`PRO_PRICE_CENTS = 299`), formatted with
  `priceEuros()`.
- Ads: only `src/components/AdSlot.tsx`, and never on `/create`. Renders nothing
  until `NEXT_PUBLIC_ADSENSE_CLIENT` is set.
- Payments: gate every Stripe call behind `STRIPE_LIVE` (= `PAYMENTS_ENABLED`
  true AND a secret key present). When false, `/api/checkout` returns the
  simulate URL.
- Keep pages server components; push interactivity into small `"use client"`
  leaves (`Countdown`, `VoteWidget`, `ShareButtons`, form components).
- `revalidate` is set per route; don't make list/detail pages fully dynamic
  without reason (cost target: 100k visitors on free tiers).

## Checks

```
npm run typecheck   # tsc --noEmit
npm run lint         # eslint (next/core-web-vitals + next/typescript)
npm run build
```

## Out of scope (MVP)

Mobile app, AI, chat, marketplace, complex social graph, user accounts.

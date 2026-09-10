# PROVE ME WRONG

> Say it now. Prove it later.

A public board where anyone can post a dated prediction, get a shareable page
with a countdown, and let the future settle it.

Stack: **Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(PostgreSQL) · Vercel**. No payments, no accounts — free and simple.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the app runs without a DB
npm run dev
```

Open http://localhost:3000.

**No database?** The app boots with an in-memory demo store (seeded with ~10
predictions) so the whole UI is browsable immediately. Data resets on restart —
connect Supabase before any real launch.

## Connecting Supabase (persistent data)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL editor → run, in order: [`supabase/schema.sql`](supabase/schema.sql),
   [`supabase/analytics.sql`](supabase/analytics.sql),
   [`supabase/hardening.sql`](supabase/hardening.sql). All idempotent, all
   prefixed `pmw_`, so they can safely share a project with other apps.
3. Project settings → API → set these (in `.env.local` locally, and in Vercel):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never exposed to the browser)
4. Restart `npm run dev`.

Optional env: `ADMIN_SECRET` (locks `/admin` moderation and `/stats`),
`NEXT_PUBLIC_CONTACT_EMAIL` (footer "Report content" link).

Reads use the anon key (RLS: public `select` only). All writes go through
server code with the service-role key. The secret "manage token" that lets a
creator mark a verdict is only stored as a SHA-256 hash.

## Ads (dormant)

`src/components/AdSlot.tsx` renders **nothing** until
`NEXT_PUBLIC_ADSENSE_CLIENT` (and per-slot `NEXT_PUBLIC_ADSENSE_SLOT_*`) are
set — no ads on the live site until you opt in, and never inside the create
flow. Enable later with real traffic:

```
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_HOME=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_FEED=1234567891
NEXT_PUBLIC_ADSENSE_SLOT_RANKINGS=1234567892
NEXT_PUBLIC_ADSENSE_SLOT_PREDICTION=1234567893
```

## Deploy (Vercel)

1. Push to GitHub, import in Vercel (or it auto-deploys on push).
2. Add the 3 Supabase env vars. `NEXT_PUBLIC_SITE_URL` is optional — it is
   derived from Vercel's own env; set it only to pin a custom domain.

### Cost profile

- Supabase free tier and Vercel Hobby cover early traffic.
- Pages are statically rendered / ISR-cached (`revalidate` 30–120s); a viral
  prediction is served from cache, not the DB, on most hits.
- View counts are fired once per session from the client.
- No AI, no paid APIs, no payment provider.

## Routes

| Path | What |
|---|---|
| `/` | Home — hero, ticker, closing soon, most talked about |
| `/create` | Prediction form |
| `/feed` | All predictions, sortable + category filter |
| `/p/<slug>` | Public prediction page: countdown, status, votes, share, comments |
| `/p/<slug>/manage?token=` | Creator-only: mark CORRECT / WRONG (noindex) |
| `/p/<slug>/opengraph-image` | Auto-generated share card |
| `/rankings` + `/rankings/<type>` | Most popular / controversial / confident / accurate / wrong |
| `/mine` | Predictions you made (localStorage), with manage links |
| `/stats` | Aggregated pageviews + referrers (public unless `ADMIN_SECRET` set) |
| `/admin?key=` | Moderation — hide / delete predictions & comments (`ADMIN_SECRET`) |
| `/api/p/<slug>/view`, `/api/hit` | View-count + analytics pings |

## Abuse control

Honeypot field + per-IP rate limits (create 6/h, comment 20/h, vote 120/h,
fail-open) + a short hard-blocked slur list + `is_hidden` moderation. No CAPTCHA.

## What's intentionally NOT here

Payments · mobile app · AI · chat · marketplace · complex social graph · user
accounts. Build the viral core first; monetise only if it takes off.

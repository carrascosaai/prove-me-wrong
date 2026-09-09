# PROVE ME WRONG

> Say it now. Prove it later.

A public board where anyone can post a dated prediction, get a shareable page
with a countdown, and let the future settle it.

Stack: **Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase
(PostgreSQL) · Stripe · Vercel**.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the app runs without a DB
npm run dev
```

Open http://localhost:3000.

**No database?** The app boots with an in-memory demo store (seeded with ~10
predictions) so the whole UI is browsable immediately. Data resets on restart.

## Connecting Supabase (persistent data)

1. Create a project at [supabase.com](https://supabase.com).
2. SQL editor → run [`supabase/schema.sql`](supabase/schema.sql).
3. Project settings → API → copy into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only — never exposed to the browser)
4. Restart `npm run dev`.

Reads use the anon key (RLS: public `select` only). All writes go through
server code with the service-role key. The secret "manage token" that lets a
creator mark a verdict is only stored as a SHA-256 hash.

## Payments (Stripe)

Controlled by one switch:

| `PAYMENTS_ENABLED` | Behaviour |
|---|---|
| `false` (default) | Simulated checkout. No Stripe calls, no charge. `/pro/<slug>/simulate` mimics the flow and unlocks PRO. |
| `true` + Stripe keys | Real [Stripe Checkout](https://stripe.com/docs/payments/checkout). |

To go live:

1. `PAYMENTS_ENABLED=true`
2. `STRIPE_SECRET_KEY=sk_live_…` (or `sk_test_…`)
3. Create a webhook endpoint → `https://yourdomain.com/api/stripe/webhook`,
   subscribe to `checkout.session.completed`, copy the signing secret to
   `STRIPE_WEBHOOK_SECRET`.
4. (Optional) create a one-time Price for €2.99 and set `STRIPE_PRICE_PRO`;
   otherwise an inline price is used.

Flow: user → Stripe Checkout → Stripe confirms payment → webhook →
`markPredictionPro(slug)` → PRO delivered. The success page also
double-checks the session as a fallback. **Card data never touches our DB.**

Stripe Connect is not used — add it only if payouts to third parties are needed
later.

## Ads

None are bought. Ad slots are discreet placeholders that render **nothing**
until `NEXT_PUBLIC_ADSENSE_CLIENT` (and per-slot
`NEXT_PUBLIC_ADSENSE_SLOT_*`) are set. Slots exist on the home, feed, rankings
and prediction pages — never inside the create flow.

Enable later with real traffic:

```
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_ADSENSE_SLOT_HOME=1234567890
NEXT_PUBLIC_ADSENSE_SLOT_FEED=1234567891
NEXT_PUBLIC_ADSENSE_SLOT_RANKINGS=1234567892
NEXT_PUBLIC_ADSENSE_SLOT_PREDICTION=1234567893
```

## Deploy (Vercel)

1. Push to GitHub, import in Vercel.
2. Add all env vars from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to the real
   domain).
3. Add the Stripe webhook pointing at the deployed `/api/stripe/webhook`.

### Cost profile

- Supabase free tier and Vercel Hobby cover early traffic.
- Pages are statically rendered / ISR-cached (`revalidate` 30–120s); a viral
  prediction is served from cache, not the DB, on most hits.
- View counts are fired once per session from the client.
- No AI, no paid APIs.

## Routes

| Path | What |
|---|---|
| `/` | Home — hero, closing soon, most talked about |
| `/create` | Prediction form |
| `/feed` | All predictions, sortable + category filter |
| `/p/<slug>` | Public prediction page: countdown, status, votes, share, comments |
| `/p/<slug>/manage?token=` | Creator-only: mark CORRECT / WRONG (noindex) |
| `/p/<slug>/opengraph-image` | Auto-generated share card |
| `/rankings` + `/rankings/<type>` | Most popular / controversial / confident / accurate / wrong |
| `/pro/<slug>` | PRO upgrade offer (€2.99) |
| `/sponsors` | Sponsored predictions pitch |
| `/api/checkout`, `/api/stripe/webhook`, `/api/p/<slug>/view` | Backend |

## What's intentionally NOT here (MVP)

Mobile app · AI · chat · marketplace · complex social graph · user accounts.
Build the viral core first.

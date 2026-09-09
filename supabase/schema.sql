-- ============================================================
-- PROVE ME WRONG — database schema (PostgreSQL / Supabase)
-- Run this in the Supabase SQL editor.
-- ============================================================

create extension if not exists pgcrypto;

-- ── predictions ─────────────────────────────────────────────
create table if not exists predictions (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  prediction       text not null check (char_length(prediction) between 8 and 280),
  category         text not null,
  resolution_date  timestamptz not null,
  evidence_url     text,
  username         text not null check (char_length(username) between 2 and 40),
  confidence       int not null default 50 check (confidence between 1 and 100),
  status           text not null default 'active'
                     check (status in ('active', 'correct', 'wrong')),
  is_pro           boolean not null default false,
  is_sponsored     boolean not null default false,
  sponsor_name     text,
  -- SHA-256 of the secret manage token. The plaintext token is shown to the
  -- creator once, at creation time, and never stored.
  manage_token_hash text not null,
  views            int not null default 0,
  agree_count      int not null default 0,
  doubt_count      int not null default 0,
  created_at       timestamptz not null default now(),
  resolved_at      timestamptz
);

create index if not exists predictions_created_idx    on predictions (created_at desc);
create index if not exists predictions_resolution_idx on predictions (resolution_date);
create index if not exists predictions_status_idx     on predictions (status);
create index if not exists predictions_category_idx   on predictions (category);
create index if not exists predictions_views_idx      on predictions (views desc);

-- ── comments ────────────────────────────────────────────────
create table if not exists comments (
  id             uuid primary key default gen_random_uuid(),
  prediction_id  uuid not null references predictions(id) on delete cascade,
  username       text not null,
  body           text not null check (char_length(body) between 1 and 1000),
  url            text,
  created_at     timestamptz not null default now()
);
create index if not exists comments_prediction_idx on comments (prediction_id, created_at desc);

-- ── votes (one per fingerprint per prediction) ──────────────
create table if not exists votes (
  id             uuid primary key default gen_random_uuid(),
  prediction_id  uuid not null references predictions(id) on delete cascade,
  vote           text not null check (vote in ('agree', 'doubt')),
  voter_hash     text not null,
  created_at     timestamptz not null default now(),
  unique (prediction_id, voter_hash)
);

-- ── orders (Stripe) ─────────────────────────────────────────
-- Card data is NEVER stored here. Only references to Stripe objects.
create table if not exists orders (
  id                 uuid primary key default gen_random_uuid(),
  stripe_session_id  text unique,
  prediction_slug    text,
  product            text not null,
  amount             int not null default 0,
  currency           text not null default 'eur',
  status             text not null default 'pending',
  created_at         timestamptz not null default now()
);

-- ============================================================
-- Functions (called by the server with the service-role key)
-- ============================================================

create or replace function increment_views(p_slug text)
returns void
language sql
as $$
  update predictions set views = views + 1 where slug = p_slug;
$$;

create or replace function bump_vote_count(p_slug text, p_column text)
returns void
language plpgsql
as $$
begin
  if p_column = 'agree_count' then
    update predictions set agree_count = agree_count + 1 where slug = p_slug;
  elsif p_column = 'doubt_count' then
    update predictions set doubt_count = doubt_count + 1 where slug = p_slug;
  end if;
end;
$$;

-- ============================================================
-- Row Level Security
-- Reads are public. All writes go through the server (service
-- role bypasses RLS), so no anon insert/update/delete policies.
-- ============================================================

alter table predictions enable row level security;
alter table comments    enable row level security;
alter table votes        enable row level security;
alter table orders       enable row level security;

drop policy if exists "public read predictions" on predictions;
create policy "public read predictions" on predictions
  for select using (true);

drop policy if exists "public read comments" on comments;
create policy "public read comments" on comments
  for select using (true);

drop policy if exists "public read votes" on votes;
create policy "public read votes" on votes
  for select using (true);

-- orders: no public access at all (service role only)

-- ============================================================
-- Optional: expose predictions without the manage_token to the
-- anon role via a view, if you prefer selecting from it.
-- ============================================================
create or replace view predictions_public as
  select
    id, slug, prediction, category, resolution_date, evidence_url,
    username, confidence, status, is_pro, is_sponsored, sponsor_name,
    views, agree_count, doubt_count, created_at, resolved_at
  from predictions;

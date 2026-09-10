-- ============================================================
-- PROVE ME WRONG — hardening migration
-- Run once in the Supabase SQL editor, after schema.sql.
-- Safe to re-run.
-- ============================================================

-- ── moderation flags ────────────────────────────────────────
alter table pmw_predictions add column if not exists is_hidden boolean not null default false;
alter table pmw_comments    add column if not exists is_hidden boolean not null default false;

create index if not exists pmw_predictions_visible_idx
  on pmw_predictions (created_at desc) where is_hidden = false;

-- ── rate limiting ───────────────────────────────────────────
create table if not exists pmw_ratelimit (
  bucket    text primary key,
  hits      int not null default 0,
  reset_at  timestamptz not null
);

-- Returns true if the action is allowed (and records it), false if over limit.
create or replace function pmw_rate_check(
  p_bucket text, p_limit int, p_window_seconds int
) returns boolean
language plpgsql
as $$
declare
  v_hits int;
  v_reset timestamptz;
begin
  select hits, reset_at into v_hits, v_reset
  from pmw_ratelimit where bucket = p_bucket for update;

  if not found or v_reset < now() then
    -- opportunistic cleanup of expired buckets
    delete from pmw_ratelimit where reset_at < now();
    insert into pmw_ratelimit (bucket, hits, reset_at)
    values (p_bucket, 1, now() + make_interval(secs => p_window_seconds))
    on conflict (bucket) do update
      set hits = 1, reset_at = now() + make_interval(secs => p_window_seconds);
    return true;
  end if;

  if v_hits < p_limit then
    update pmw_ratelimit set hits = hits + 1 where bucket = p_bucket;
    return true;
  end if;

  return false;
end;
$$;

alter table pmw_ratelimit enable row level security;
-- server-only (service role bypasses RLS); no policies

-- ── keep public reads fast: nothing else needed ─────────────

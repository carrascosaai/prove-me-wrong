-- ============================================================
-- PROVE ME WRONG — lightweight analytics
-- Run this once in the Supabase SQL editor (after schema.sql).
--
-- Aggregated by (day, path, referrer) so it stays tiny forever —
-- one row per unique combination, not one per visit.
-- ============================================================

create table if not exists pmw_stats (
  day       date not null,
  path      text not null,
  referrer  text not null default 'direct',
  hits      bigint not null default 0,
  primary key (day, path, referrer)
);

create index if not exists pmw_stats_day_idx on pmw_stats (day desc);

-- Atomic increment. Called by the server with the service-role key.
create or replace function pmw_track(p_path text, p_referrer text)
returns void
language plpgsql
as $$
begin
  insert into pmw_stats (day, path, referrer, hits)
  values (current_date, left(coalesce(p_path, '/'), 200),
          left(coalesce(nullif(p_referrer, ''), 'direct'), 120), 1)
  on conflict (day, path, referrer)
  do update set hits = pmw_stats.hits + 1;
end;
$$;

alter table pmw_stats enable row level security;
-- no policies: the stats table is server-only (service role bypasses RLS)

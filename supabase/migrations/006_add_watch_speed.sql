-- Phase 11: Add watch speed tracking (episodes per day)
-- Default: 2 episodes per day (standard for a 10-episode season = 5 days)
-- Range: 1-6 episodes per day (configurable via slider)

alter table public.profiles
add column watch_speed integer default 2
check (watch_speed >= 1 and watch_speed <= 6);

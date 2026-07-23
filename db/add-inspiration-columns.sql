-- Adds the Inspiration Starter metadata columns that
-- createSongFromInspiration (src/app/songs/actions.ts) inserts into.
-- Idempotent: safe to run whether or not the columns already exist.
-- Run in the Supabase SQL editor, then reload PostgREST's schema cache.

alter table public.songs
  add column if not exists inspiration_angle text,
  add column if not exists inspiration_pov text;

-- Refresh the API schema cache in case the columns already existed and the
-- failure was a stale-cache issue rather than a missing-column issue.
notify pgrst, 'reload schema';

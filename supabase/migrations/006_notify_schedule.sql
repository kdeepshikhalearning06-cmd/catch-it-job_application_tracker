-- Applied 25 Oct 2026. The schedule itself holds a secret, so it is set up by hand from
-- supabase/schedule.sql.example (job "catchit-notify", every 15 minutes).
create extension if not exists pg_cron;
create extension if not exists pg_net;

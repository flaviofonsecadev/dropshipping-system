alter table if exists public.reseller_stores
add column if not exists visual_settings jsonb not null default '{}'::jsonb;


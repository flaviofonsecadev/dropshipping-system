alter table if exists public.reseller_stores
add column if not exists storefront_settings jsonb not null default '{}'::jsonb;


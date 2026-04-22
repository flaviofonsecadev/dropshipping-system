alter table if exists public.profiles
  add column if not exists asaas_account_id text,
  add column if not exists asaas_wallet_id text,
  add column if not exists asaas_api_key_encrypted text,
  add column if not exists asaas_api_key_hint text,
  add column if not exists asaas_is_subaccount boolean not null default false,
  add column if not exists asaas_connected_at timestamptz;


alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin', 'supplier', 'reseller', 'customer'));

create or replace function public.handle_new_user()
returns trigger as $$
declare
  desired_role text;
begin
  if coalesce(new.raw_user_meta_data->>'signup_origin', '') = 'storefront' then
    desired_role := 'customer';
  else
    desired_role := 'reseller';
  end if;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, desired_role)
  on conflict (id) do update
    set email = excluded.email,
        role = excluded.role;

  return new;
end;
$$ language plpgsql security definer;


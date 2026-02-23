alter table public.users
  add column is_onboarded boolean default false not null;

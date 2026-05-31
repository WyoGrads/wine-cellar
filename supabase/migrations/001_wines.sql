-- Wine Cellar: wines table
-- Run in Supabase SQL Editor or via supabase db push

create extension if not exists "pgcrypto";

create table if not exists public.wines (
  id                   uuid primary key default gen_random_uuid(),
  wine_name            text not null,
  location             text,
  bin                  text,
  bottle_size          text,
  quantity             integer not null default 1,
  score_personal       numeric(4,1),
  score_community      numeric(4,1),
  score_drinkability   numeric(4,1),
  drink_window_start   integer,
  drink_window_end     integer,
  wine_type            text,
  variety              text,
  vintage              integer,
  producer             text,
  region               text,
  sub_region           text,
  price_paid           numeric(10,2),
  value_score          numeric(4,1),
  store                text,
  purchase_date        date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Unique natural key used for upsert conflict resolution
alter table public.wines
  add constraint wines_natural_key unique (wine_name, vintage, producer);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger wines_set_updated_at
  before update on public.wines
  for each row execute function public.set_updated_at();

-- Row-Level Security: enable but allow anon reads (dashboard uses anon key)
alter table public.wines enable row level security;

create policy "anon_read" on public.wines
  for select using (true);

-- Service-role key required for insert/update/delete (n8n sync uses service key)
create policy "service_write" on public.wines
  for all using (auth.role() = 'service_role');

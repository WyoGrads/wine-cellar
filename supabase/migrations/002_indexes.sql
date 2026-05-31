-- Wine Cellar: performance indexes
-- Run after 001_wines.sql

create index if not exists idx_wines_wine_name
  on public.wines using gin (to_tsvector('english', wine_name));

create index if not exists idx_wines_producer
  on public.wines (producer);

create index if not exists idx_wines_region
  on public.wines (region);

create index if not exists idx_wines_vintage
  on public.wines (vintage);

create index if not exists idx_wines_variety
  on public.wines (variety);

-- Dashboard sort helpers
create index if not exists idx_wines_score_personal
  on public.wines (score_personal desc nulls last);

create index if not exists idx_wines_drink_window
  on public.wines (drink_window_start, drink_window_end);

create index if not exists idx_wines_wine_type
  on public.wines (wine_type);

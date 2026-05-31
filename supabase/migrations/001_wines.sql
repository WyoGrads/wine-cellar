-- Wine Cellar Schema
-- Run in Supabase: Dashboard → SQL Editor → paste & run

CREATE TABLE IF NOT EXISTS public.wines (
  id                  bigserial PRIMARY KEY,
  wine_name           text,
  location            text,
  bin                 text,
  bottle_size         text,
  quantity            integer,
  score_personal      numeric,
  score_community     numeric,
  score_drinkability  numeric,
  drink_window_start  integer,
  drink_window_end    integer,
  wine_type           text,
  variety             text,
  vintage             integer,
  producer            text,
  region              text,
  sub_region          text,
  price_paid          numeric,
  value_score         numeric,
  store               text,
  purchase_date       date,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='wines' AND policyname='anon_read'
  ) THEN
    CREATE POLICY anon_read ON public.wines FOR SELECT USING (true);
  END IF;
END $$;

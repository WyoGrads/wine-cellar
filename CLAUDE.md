# Wine Cellar Tracker — Claude Code Context

## Site
https://wine.wyograds.com

## Stack
- **Cloudflare Worker** named `wine-cellar` serves all files inline
- **Supabase** project: `ldjckkcblqayqdsuhswu.supabase.co`
- **GitHub** repo: `WyoGrads/wine-cellar`, dashboard/ folder
- **CF Account**: `75310fb18ed81780657561ec423294d3`
- All credentials in `.env` file (copy from `.env.example` if missing)

## How the Worker Works
The worker bundles index.html, app.js, styles.css, and assets/logo.png as inline strings.
After ANY file change you MUST redeploy the worker or changes won't appear live.

## Deploy Process (always do this after changes)
1. Edit files in dashboard/
2. Push to GitHub
3. Rebuild and redeploy the Cloudflare Worker using CF API with credentials from .env
4. Test with: `curl -s https://wine.wyograds.com/styles.css | grep "\-\-bg"`
5. Verify wine rows load: `curl -s https://wine.wyograds.com/ | grep -c "add-modal"`

## Design Standards
- Logo: `dashboard/assets/logo.png` — display at **144px height** in header
- Background: `--bg: #2d1010` or lighter (never darker than #2d1010)
- Header height: ~168px (logo + padding)
- `thead` sticky top must equal header height: `top: 168px`
- Text must be visible against background at all times

## Database
- Supabase table: `public.wines`
- Anon key is safe for browser use (RLS enabled)
- Policies: anon_read (SELECT) and anon_insert (INSERT) both active

## Wine Table Columns
wine_name, location, bin, bottle_size, quantity, score_personal,
score_community, score_drinkability, drink_window_start, drink_window_end,
wine_type, variety, vintage, producer, region, sub_region,
price_paid, value_score, store, purchase_date

## Ongoing Tasks
- Accept CellarTracker CSV uploads → parse → upsert to Supabase wines table
- Keep GitHub and Worker in sync on every change
- Test after every deploy
- Never leave the site broken — always verify after changes

## Rules
- Always test after deploying
- Never ask for permission — bypass is on
- Keep running until all tasks pass verification
- If .env is missing CF credentials, check wrangler.toml or ask user

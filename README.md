# Wine Cellar Tracker — wine.wyograds.com

Dark-themed wine cellar dashboard with Supabase backend, n8n CSV sync, and Cloudflare Pages hosting.

## Quick Start

### 1 — Supabase
1. Create a free project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run in order:
   ```
   supabase/migrations/001_wines.sql
   supabase/migrations/002_indexes.sql
   ```
3. Copy **Project URL** and **anon key** from Settings → API

### 2 — Dashboard config
Edit `dashboard/app.js` lines 3–4:
```js
const SUPABASE_URL      = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

### 3 — Deploy to Cloudflare Pages
```bash
export CLOUDFLARE_API_TOKEN=your_token   # dash.cloudflare.com/profile/api-tokens
./deploy.sh
```
Then in Cloudflare Pages dashboard → wine-cellar → Custom domains → add `wine.wyograds.com`.

### 4 — n8n sync
1. Log in to [app.n8n.cloud](https://app.n8n.cloud)
2. Import `n8n/cellartracker_sync.json`
3. Replace placeholders:
   - `REPLACE_WITH_GDRIVE_FOLDER_ID` — Google Drive folder containing CellarTracker CSVs
   - `REPLACE_PROJECT_REF` + `REPLACE_SUPABASE_SERVICE_KEY` — Supabase service role key
   - `REPLACE_WITH_YOUR_EMAIL` — Gmail address for notifications
4. Add Google Drive and Gmail credentials
5. Activate the workflow

## Credentials reference

| Placeholder | Where to find it |
|---|---|
| `REPLACE_PROJECT_REF` | Supabase → Settings → API → Project URL |
| `REPLACE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |
| `REPLACE_SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key |
| `REPLACE_CLOUDFLARE_API_TOKEN` | dash.cloudflare.com/profile/api-tokens (Pages: Edit) |
| `REPLACE_GOOGLE_DRIVE_FOLDER_ID` | Google Drive folder URL → last path segment |

## File structure

```
wine-cellar/
├── dashboard/          ← Cloudflare Pages root
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── assets/
│   │   └── logo.png    ← drop your logo here
│   └── _headers        ← security headers
├── supabase/migrations/
│   ├── 001_wines.sql
│   └── 002_indexes.sql
├── n8n/
│   └── cellartracker_sync.json
├── cloudflare/
│   └── wrangler.toml
├── .github/workflows/
│   └── deploy.yml      ← auto-deploy on git push
├── .env.example
├── deploy.sh
└── wrangler.toml
```

## Dashboard features
- Sortable columns (click any header)
- Search across wine, producer, region, variety
- Wine type filter buttons (auto-built from data)
- Color-coded scores: 🟢 90+ · 🟡 80–89 · 🔴 <80
- Drink window badges: ✓ peak · 🔔 drink soon · ⏳ hold · ⏰ past peak
- Stats: bottles, wines, avg score, cellar value, drink-now count
- Pagination at 100 wines/page
- Mobile responsive, dark wine theme

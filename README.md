# Worldroot

Browser idle RPG — gather resources, level skills, unlock character slots.

## Play locally

1. Double-click **`open-game.bat`** (opens the website), or run **`start-server.bat`** for `http://localhost:8080`
2. On the **Worldroot** home page, choose:
   - **Log In** / **Create Account** — cloud save (needs Supabase)
   - **Play offline** — saves to this browser only

## Cloud saves (like Aetherbound)

1. Create a free [Supabase](https://supabase.com) project
2. Run **`supabase/schema.sql`** in Supabase → SQL Editor
3. Copy **`supabase.local.json.example`** → **`supabase.local.json`** and paste your Project URL + anon key
4. For Vercel: set env vars `SUPABASE_URL` and `SUPABASE_ANON_KEY`

Without Supabase, login shows *Cloud saves are not configured* — offline mode still works.

## Public URL (Vercel — like Aetherbound)

Host the game at a real link such as `https://worldroot.vercel.app`.

### 1. Push the game to GitHub

The **`idle-game`** folder must be in a GitHub repo (its own repo, or the repo root).

### 2. Import on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (same account as Aetherbound is fine)
2. **Add New… → Project**
3. Import your GitHub repo
4. If the repo contains other folders, set **Root Directory** to `idle-game`
5. Framework Preset: **Other** (no build command needed)
6. Deploy

### 3. Add Supabase env vars on Vercel

In the Vercel project → **Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | `https://YOUR-PROJECT-ID.supabase.co` |
| `SUPABASE_ANON_KEY` | your publishable key (`sb_publishable_...`) |

Redeploy after saving (Deployments → … → Redeploy).

### 4. Tell Supabase your live URL

In Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/**`

Save. Login and cloud saves will work on the public site.

### 5. Custom name (optional)

Vercel → Project → **Settings → Domains** → add a name like `worldroot.vercel.app` if available.

---

**Local dev** still uses `supabase.local.json`. **Production** uses the Vercel env vars above — do not commit `supabase.local.json`.

## File layout

| File | Purpose |
|------|---------|
| `index.html` | Worldroot website — login, register, play offline |
| `game.html` | The idle game |
| `css/site.css` | Landing page styles |
| `css/style.css` | In-game UI |
| `js/site.js` | Home page logic |
| `js/gameBootstrap.js` | Game entry — auth gate, cloud load, game loop |
| `js/auth.js` | Supabase login (email or username + password) |
| `js/cloudSave.js` | Sync save to `worldroot_saves` table |
| `js/cloudConfig.js` | Supabase URL/key loader |
| `js/config.js` | Game balance & data |
| `js/state.js` | Save/load, levels, characters |
| `js/engine.js` | Tick logic & upgrades |
| `js/ui.js` | In-game UI |

## Login

- **Email or username** + password (same as Aetherbound)
- **Play offline** skips login — separate save from cloud accounts

# HUB#4 Stabilisation Checklist (MUST-DO)

> Purpose: ensure HUB#4 starts from a clean, consistent baseline before adding new features.

---

## 1) Environment parity (GitHub ↔ Netlify ↔ Supabase)

- [ ] Confirm Netlify **Admin UI site** has:
  - [ ] Build command = `npm install && npm run build`
  - [ ] Publish directory = `public`
  - [ ] Base directory = `admin-ui`
  - [ ] Environment var: `NODE_VERSION = 18`
- [ ] Confirm Netlify **Functions site** (availability API) still has:
  - [ ] `SUPABASE_URL` (value present)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (value present)
  - [ ] (Optional) `NODE_VERSION = 18` in Functions/Runtime
- [ ] Supabase tables exist: `rooms`, `catalog`, `vat`, `durations`, `room_catalog_map`, `blackout_periods`
- [ ] `blackout_periods` includes column `title text` (added in HUB#2)

**How to verify (UI steps):**
1. Netlify (Admin UI site) → **Site settings** → **Build & deploy** → confirm build & publish paths.  
2. Netlify (Admin UI site) → **Site settings** → **Environment variables** → confirm `NODE_VERSION=18`.  
3. Netlify (Functions site) → **Site settings** → **Environment variables** → confirm Supabase vars exist.  
4. Supabase → **Table Editor** → see all tables listed above; open `blackout_periods` and confirm `title`.

---

## 2) Admin UI build is green (Node 18)

- [ ] Trigger **Deploy without cache** on the Admin UI site
- [ ] Build completes without errors
- [ ] Routes render:
  - [ ] `/admin/venue`
  - [ ] `/admin/rooms`
  - [ ] `/admin/fnb`
  - [ ] `/admin/av`
  - [ ] `/admin/labour`
  - [ ] `/admin/addons`

**How to verify (UI steps):**
1. Netlify (Admin UI site) → **Deploys** → **Trigger deploy** → **Deploy without cache**.  
2. Wait for ✅. Open site and visit each route.  
3. DevTools → **Console** has no red errors on each page.

---

## 3) Functions untouched (availability + blackout_periods still OK)

- [ ] `/.netlify/functions/availability?roomId=<VALID_ID>&from=<ISO>Z&to=<ISO>Z` returns JSON
- [ ] `POST /.netlify/functions/blackout_periods` creates a row when given a valid `room_id`
- [ ] `GET /.netlify/functions/blackout_periods?roomId=<VALID_ID>` lists periods
- [ ] (Optional) `DELETE /.netlify/functions/blackout_periods/:id?roomId=<VALID_ID>` removes it

**Quick commands (PowerShell/curl):**
```powershell
# Replace RM002 with a real rooms.id and adjust times to a future UTC window
$base = "https://<YOUR-FUNCTIONS-SITE>.netlify.app"

# Create blackout
curl -s -X POST "$base/.netlify/functions/blackout_periods" `
 -H "Content-Type: application/json" `
 -d '{ "roomId":"RM002", "title":"Test Hold", "startsAt":"2030-01-01T10:00:00Z", "endsAt":"2030-01-01T12:00:00Z" }'

# List
curl -s "$base/.netlify/functions/blackout_periods?roomId=RM002"

# Availability
curl -s "$base/.netlify/functions/availability?roomId=RM002&from=2030-01-01T10:00:00Z&to=2030-01-01T12:00:00Z"

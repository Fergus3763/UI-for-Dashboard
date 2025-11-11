# PERSISTENCE

## Table
```sql
create table if not exists public.admin_ui_config (
  id text primary key,
  data jsonb,
  updated_at timestamptz default now()
);
## HUB#4: Venue configuration flow

- Netlify Functions:
  - `/.netlify/functions/load_config` (GET) → returns `{ ok, id, data, updated_at, created }`.
  - `/.netlify/functions/save_config` (POST) → expects a JSON body `{"data": { ... }}` and upserts into `public.admin_ui_config`.
- Current payload (MVP):
  - `data.venue` holds the Venue Admin form fields (name, address, email, phone, main_image, more_images, notes, etc.).
- Frontend entrypoints:
  - Route `/admin/venue` → `admin-ui/src/pages/Venue.jsx` → `admin-ui/src/pages/Dashboard/VenueSetup/index.jsx`.
  - `VenueSetup`:
    - On mount: `fetch("/.netlify/functions/load_config")` and, if present, merges `data.venue` into its local `venue` state.
    - On Save: `fetch("/.netlify/functions/save_config", { method: "POST", body: JSON.stringify({ data: { venue } }) })`.
- Forward plan:
  - As other tabs gain persistence (Rooms, F&B, AV, Labour, Add-Ons), extend the `data` object with additional keys instead of creating new configuration tables per tab.

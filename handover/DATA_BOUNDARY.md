# DATA BOUNDARY — Canonical (HUB#6 → HUB#7)

This document defines what each layer owns and what it must *never* do.

---

# 1. Admin UI (React)
Owns:
- Displaying configuration
- Editing configuration
- Calling `load_config` / `save_config`
- Simple validation

Must NOT:
- Write to Supabase directly
- Bypass Netlify Functions
- Manipulate blackout periods (except via API)

---

# 2. Netlify Functions (API Layer)
Owns:
- Full responsibility for persistence logic
- All reads/writes to Supabase
- Validation of inputs
- Availability calculation (until moved to shared module)

Functions:
- `load_config.mjs`
- `save_config.mjs`
- `availability.js`
- `blackout_periods.js`

Must:
- Always return canonical JSON shapes
- Always use UTC timestamps

---

# 3. Supabase (Database)
Owns:
- `admin_ui_config.data` JSONB (single-row configuration store)
- `blackout_periods` (persistent event table)

Must NOT:
- Contain UI-only fields
- Have schema changes without corresponding API updates

---

# 4. Booker (future)
Will:
- Read → rooms
- Read → availability
- Display options

Will NOT:
- Write blackouts
- Write config

---

# Boundary Summary

| Layer | Config | Availability | Persistence |
|-------|--------|--------------|-------------|
| Admin UI | YES (edit) | NO | NO |
| Netlify Functions | YES (validation) | YES (logic) | YES |
| Supabase | YES (store) | YES (store blackouts) | YES |
| Booker | read-only | read-only | NO |

---

# Versioning
- v1.1 — HUB #6 canonical rewrite for HUB #7


# API Layer — Canonical (HUB#6 → HUB#7)

This document defines how the API layer (Netlify Functions) behaves and what rules it must follow.

---

## 1. Responsibilities

- Owns all reads and writes to Supabase  
- Validates inputs coming from Admin UI  
- Exposes stable function endpoints  
- Maintains backward-compatible JSON response shapes  
- Ensures that Admin UI never talks directly to the database  

---

## 2. Mandatory Functions

### load_config.mjs
- Reads row `id="default"` from `public.admin_ui_config`
- Always returns:
```json
{
  "ok": true,
  "id": "default",
  "data": { /* JSON config */ },
  "updated_at": "...",
  "created": "..."
}
```
- If `data` is null, return `{}` instead of null.

### save_config.mjs
- Accepts a JSON body containing *only* the keys the UI wants to update  
- Merges those keys into the existing `data` JSONB  
- Must preserve all other root keys  
- Must never drop fields unless explicitly instructed

---

## 3. Availability / Blackouts

### GET /.netlify/functions/blackout_periods?roomId=...
Returns all blackouts for a room.

### POST /.netlify/functions/blackout_periods
Creates a blackout period.

### DELETE /.netlify/functions/blackout_periods/:id
Deletes a blackout period.

### GET /.netlify/functions/availability
Returns availability based on blackout periods + working-hours logic.  
Current shape matches existing implementation; final spec will be expanded under HUB#7.

---

## 4. No Direct Admin UI → Supabase

The UI may **only** call:
- `load_config`
- `save_config`
- `availability`
- `blackout_periods`

All persistence and validation stays in this layer.

---

## 5. Version API_LAYER v1.0 (HUB#6 → HUB#7)

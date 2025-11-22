# API Contract — Availability & Blackouts (Canonical v1.1 — HUB#6 → HUB#7)

This file defines the **only authoritative API behaviour** for the Availability & Blackouts subsystem.

These endpoints run on **Netlify Functions** in the Admin UI repo:

```
/.netlify/functions/availability
/.netlify/functions/blackout_periods
```

Supabase is the **persistent layer**, not the UI.

---

# 1. POST /blackout_periods  
Create a blackout period for a room.

### Request Body
```json
{
  "roomId": "RM-002",
  "startsAt": "2025-10-29T10:00:00Z",
  "endsAt": "2025-10-29T12:00:00Z",
  "title": "Admin Blackout"
}
```

### Response (200 OK)
```json
{
  "id": "uuid-string",
  "room_id": "RM-002",
  "starts_at": "2025-10-29T10:00:00Z",
  "ends_at": "2025-10-29T12:00:00Z",
  "title": "Admin Blackout"
}
```

### Rules
- `roomId` **must exist** in `public.rooms.id` (FK enforced).
- `startsAt` < `endsAt`.
- Timestamps must be **UTC** (`Z` suffix).
- If input invalid → `400`.
- If DB error → `500`.

---

# 2. GET /blackout_periods?roomId=RM-002  
List all blackout periods for a room.

### Response
```json
[
  {
    "id": "uuid",
    "room_id": "RM-002",
    "title": "Admin Blackout",
    "starts_at": "2025-10-29T10:00:00Z",
    "ends_at": "2025-10-29T12:00:00Z"
  }
]
```

---

# 3. DELETE /blackout_periods/:id  
Remove a blackout period.

### Response (200 OK)
```json
{ "deleted": true }
```

---

# 4. GET /availability  
Query room availability over a date/time window.

### Query Parameters
```
roomId=RM-002
from=2025-11-10T09:00:00Z
to=2025-11-10T18:00:00Z
```

### Response (shape stable)
```json
{
  "roomId": "RM-002",
  "available": true,
  "billableHours": 4,
  "events": [
    {
      "type": "blackout",
      "starts_at": "2025-11-10T12:00:00Z",
      "ends_at": "2025-11-10T14:00:00Z",
      "title": "Maintenance"
    }
  ],
  "ooh": false
}
```

### Notes
- Formal extended spec will be completed under HUB #7.
- Booker will rely on this endpoint; do not change field names casually.
- Times always returned in **UTC**.

---

# Required Implementation Notes (for HUB #7)
- Availability logic currently lives inside the function; it must migrate to a reusable module during refactor.
- Blackouts are the **only persisted events** at this stage.
- Future features (e.g. bookings) must follow the same shape.

---

# Versioning
- **v1.0** — HUB #2 (initial contract)  
- **v1.1** — HUB #6 (cleanup & canonicalisation)

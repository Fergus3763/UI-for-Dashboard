# API Contract — Availability & Blackouts

All times ISO 8601 (timezone aware). Responses are JSON.

---

## GET /availability
**Query**
- roomId (string, required)
- from (ISO date, required)
- to   (ISO date, required)

**Sample response**
```json
[
  { "date": "2025-10-20", "available": true,  "blackoutReason": null },
  { "date": "2025-10-21", "available": false, "blackoutReason": "Maintenance" }
]
---

## Availability & Blackouts (Live in HUB#2)

### POST /functions/blackout_periods
Insert a blackout period.

- **Body:**
  ```json
  {
    "roomId": "RM-002",
    "startsAt": "2025-10-29T10:00:00Z",
    "endsAt": "2025-10-29T12:00:00Z",
    "title": "Admin Blackout"
  }
Response

200 with the inserted row payload (incl. id)
4xx/5xx on error

Rules
roomId must exist in public.rooms.id (FK)
GET /functions/blackout_periods?roomId=RM-002
Lists blackout periods for a room.

Response

[
  { "id": "blk_123", "room_id": "RM-002", "title": "Admin Blackout",
    "starts_at": "2025-10-29T10:00:00Z", "ends_at": "2025-10-29T12:00:00Z" }

GET /functions/availability?roomId=RM-002&from=...&to=...
Returns availability for a room over a window.
(Used by Admin UI; full formal spec TBD — current fields match implementation.)

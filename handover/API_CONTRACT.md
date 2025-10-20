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

## POST /blackout_periods
Creates a fixed blackout window (start–end) for a room.

**Body**
```json
{
  "roomId": "A101",
  "start": "2025-10-21T09:00:00+00:00",
  "end":   "2025-10-21T17:00:00+00:00",
  "reason": "Maintenance"
}
{ "success": true, "id": "blk_456" }
{ "success": false, "error": "Overlaps existing blackout" }


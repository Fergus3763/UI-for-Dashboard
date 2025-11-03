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


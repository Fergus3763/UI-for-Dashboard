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


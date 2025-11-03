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

## DELETE /blackout_periods/:id

- Removes a blackout by id.
- Optional safety check: `?roomId=Room-A`

**Example**
DELETE
https://zingy-biscuit-94791a.netlify.app/.netlify/functions/blackout_periods/blk_456?roomId=Room-A

**Response (example)**
{ "success": true }

**Commit message:**  
`docs(api): add lightweight sections for blackout_periods & availability`

---

# E. Mark progress & next actions in Integration Plan (EDIT)

**Path:** `/handover/INTEGRATION_PLAN.md`

**Action:** Add a quick “Status snapshot” block.

**Append this:**
```md
## Status Snapshot (post-HUB#2)
- [x] Netlify functions live: `blackout_periods`, `availability`
- [x] Env vars aligned (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NODE_VERSION=18`)
- [x] Schema updated: `blackout_periods.title`
- [ ] Formalise `availability` API spec in `API_CONTRACT.md`
- [ ] Add E2E smoke script (CI) to hit both endpoints and validate basic responses
- [ ] Document Room ID/Name mapping rules (Design doc → upcoming Spoke)

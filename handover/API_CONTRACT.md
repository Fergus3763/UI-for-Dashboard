API Contract — Admin UI ↔ Netlify Functions ↔ Supabase

Canonical version — updated under HUB #6 for HUB #7

This file defines the authoritative API shapes, payloads, and expectations
for the Admin UI, the serverless API, and the database.

Only Netlify Functions communicate with Supabase.
Only the Admin UI communicates with the Netlify Functions.
The Booker will later use the same endpoints in read-only mode.

1. Shared Concepts

All timestamps must be UTC ISO 8601 (2025-10-29T10:00:00Z).

All API responses must be JSON.

All errors must include { ok:false, error:"…" }.

2. Configuration Endpoints
2.1 GET /.netlify/functions/load_config
Purpose

Retrieve the entire configuration from Supabase.

Response
{
  "ok": true,
  "id": "default",
  "data": {
    "venue": { … },
    "bookingPolicy": { … },
    "rooms": [ … ],
    "addOns": [ … ]
  },
  "updated_at": "2025-01-11T10:20:00Z"
}

Rules

Missing keys must be returned as {} or [], never null.

data must always be an object.

2.2 POST /.netlify/functions/save_config
Purpose

Merge new config fragments into the existing Supabase admin_ui_config.data JSON.

Request Body
{
  "venue": { … },
  "bookingPolicy": { … },
  "rooms": [ … ],
  "addOns": [ … ]
}

Behaviour

The function merges keys into the existing JSONB.

No key is deleted unless explicitly overwritten.

Unknown keys are ignored with an error.

Response
{ "ok": true, "saved": ["venue", "rooms"] }

3. Availability Endpoints
3.1 POST /.netlify/functions/blackout_periods
Purpose

Insert a blackout period for a room.

Request
{
  "roomId": "RM-002",
  "startsAt": "2025-10-29T10:00:00Z",
  "endsAt": "2025-10-29T12:00:00Z",
  "title": "Admin Blackout"
}

Response
{
  "ok": true,
  "data": {
    "id": "uuid",
    "room_id": "RM-002",
    "starts_at": "2025-10-29T10:00:00Z",
    "ends_at": "2025-10-29T12:00:00Z",
    "title": "Admin Blackout"
  }
}

3.2 GET /.netlify/functions/blackout_periods?roomId=RM-002
Response
{
  "ok": true,
  "data": [
    { "id": "uuid", "room_id": "RM-002", "starts_at": "...", "ends_at": "...", "title": "..." }
  ]
}

3.3 GET /.netlify/functions/availability?...
Purpose

Return the availability window for a room.

Status

API exists and works.

Formal spec will be produced by the Availability Spoke under HUB #7.

4. Validation Requirements

Every function must respond:

200 on success

400 on malformed input

404 if entity not found

500 on server error

5. Version

API Contract v1.2 — Updated by HUB #6 for HUB #7

// admin-ui/netlify/functions/availability.mjs
// Minimal availability endpoint (MVP) for HUB #7.
// Reads blackout_periods and returns blackout windows per room.
// This is intentionally simple and forward-compatible; a future
// Availability Spoke will extend the shape and logic as needed.

import { supabase } from "./_supabaseClient.mjs";

/** @type {import("@netlify/functions").Handler} */
export async function handler(event) {
  try {
    if (event.httpMethod !== "GET") {
      return jsonResponse(
        405,
        { ok: false, error: "Method Not Allowed" },
        { Allow: "GET" }
      );
    }

    return await handleGet(event);
  } catch (err) {
    console.error("[availability] Unhandled error:", err);
    return jsonResponse(500, {
      ok: false,
      error: "Server error while handling availability",
    });
  }
}

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

async function handleGet(event) {
  const qs = event.queryStringParameters || {};

  const roomId =
    typeof qs.roomId === "string" && qs.roomId.trim() ? qs.roomId.trim() : "";

  if (!roomId) {
    return jsonResponse(400, {
      ok: false,
      error: "Missing or invalid roomId query parameter",
    });
  }

  // Optional date window
  const now = new Date();
  const defaultFrom = now.toISOString();
  const defaultTo = new Date(
    now.getTime() + 7 * 24 * 60 * 60 * 1000
  ).toISOString(); // +7 days

  const fromRaw = typeof qs.from === "string" ? qs.from : defaultFrom;
  const toRaw = typeof qs.to === "string" ? qs.to : defaultTo;

  const fromDate = new Date(fromRaw);
  const toDate = new Date(toRaw);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return jsonResponse(400, {
      ok: false,
      error: "from and to must be valid ISO 8601 timestamps (or omitted)",
    });
  }

  if (toDate <= fromDate) {
    return jsonResponse(400, {
      ok: false,
      error: "to must be after from",
    });
  }

  const from = fromDate.toISOString();
  const to = toDate.toISOString();

  const { data, error } = await supabase
    .from("blackout_periods")
    .select("id, room_id, starts_at, ends_at, reason")
    .eq("room_id", roomId)
    .gte("starts_at", from)
    .lte("ends_at", to)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[availability][GET] Supabase error:", error);
    return jsonResponse(500, {
      ok: false,
      error: "Failed to load blackout periods for availability window",
    });
  }

  const blackouts = (data || []).map((row) => ({
    id: row.id,
    roomId: row.room_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    title: row.reason ?? null,
  }));

  // MVP response shape: window + blackout periods.
  // Future Availability Spoke can add derived "free slots" etc.
  return jsonResponse(200, {
    ok: true,
    roomId,
    window: { from, to },
    blackouts,
  });
}

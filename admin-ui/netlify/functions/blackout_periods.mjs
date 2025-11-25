// admin-ui/netlify/functions/blackout_periods.mjs
// Blackout persistence for meeting rooms.
// Uses Supabase via shared _supabaseClient.mjs.
// External API fields: roomId, startsAt, endsAt, title
// Internal DB column for "title" is mapped to blackout_periods.reason.

import { supabase } from "./_supabaseClient.mjs";

/** @type {import("@netlify/functions").Handler} */
export async function handler(event) {
  try {
    if (event.httpMethod === "GET") {
      return await handleGet(event);
    }

    if (event.httpMethod === "POST") {
      return await handlePost(event);
    }

    return jsonResponse(
      405,
      { ok: false, error: "Method Not Allowed" },
      { "Allow": "GET, POST" }
    );
  } catch (err) {
    console.error("[blackout_periods] Unhandled error:", err);
    return jsonResponse(500, {
      ok: false,
      error: "Server error while handling blackout periods",
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
  const roomId = qs.roomId;

  if (!roomId || typeof roomId !== "string" || !roomId.trim()) {
    return jsonResponse(400, {
      ok: false,
      error: "Missing or invalid roomId query parameter",
    });
  }

  const { data, error } = await supabase
    .from("blackout_periods")
    .select("id, room_id, starts_at, ends_at, reason")
    .eq("room_id", roomId)
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("[blackout_periods][GET] Supabase error:", error);
    return jsonResponse(500, {
      ok: false,
      error: "Failed to load blackout periods from database",
    });
  }

  const result = (data || []).map((row) => ({
    id: row.id,
    roomId: row.room_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    // Map DB "reason" column to API "title" field
    title: row.reason ?? null,
  }));

  return jsonResponse(200, { ok: true, data: result });
}

async function handlePost(event) {
  if (!event.body) {
    return jsonResponse(400, {
      ok: false,
      error: "Missing request body",
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return jsonResponse(400, {
      ok: false,
      error: "Request body must be valid JSON",
    });
  }

  const roomId = typeof payload.roomId === "string" ? payload.roomId.trim() : "";
  const startsAt = typeof payload.startsAt === "string" ? payload.startsAt : "";
  const endsAt = typeof payload.endsAt === "string" ? payload.endsAt : "";
  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : null;

  if (!roomId) {
    return jsonResponse(400, { ok: false, error: "roomId is required" });
  }
  if (!startsAt) {
    return jsonResponse(400, { ok: false, error: "startsAt is required" });
  }
  if (!endsAt) {
    return jsonResponse(400, { ok: false, error: "endsAt is required" });
  }

  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return jsonResponse(400, {
      ok: false,
      error: "startsAt and endsAt must be valid ISO 8601 timestamps",
    });
  }

  if (endDate <= startDate) {
    return jsonResponse(400, {
      ok: false,
      error: "endsAt must be after startsAt",
    });
  }

  // Validate that the room exists in Supabase "rooms" table
  const { data: roomRow, error: roomErr } = await supabase
    .from("rooms")
    .select("id")
    .eq("id", roomId)
    .maybeSingle();

  if (roomErr) {
    console.error("[blackout_periods][POST] Room lookup error:", roomErr);
    return jsonResponse(500, {
      ok: false,
      error: "Failed to validate roomId against rooms table",
    });
  }

  if (!roomRow) {
    return jsonResponse(400, {
      ok: false,
      error: "Unknown roomId (no matching row in rooms table)",
    });
  }

  const insertPayload = {
    room_id: roomId,
    starts_at: startsAt,
    ends_at: endsAt,
    // Store "title" as "reason" in DB to avoid schema changes
    reason: title,
  };

  const { data, error } = await supabase
    .from("blackout_periods")
    .insert(insertPayload)
    .select("id, room_id, starts_at, ends_at, reason")
    .single();

  if (error) {
    console.error("[blackout_periods][POST] Insert error:", error);
    return jsonResponse(500, {
      ok: false,
      error: "Failed to insert blackout period into database",
    });
  }

  const responseData = {
    id: data.id,
    roomId: data.room_id,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    title: data.reason ?? null,
  };

  return jsonResponse(200, { ok: true, data: responseData });
}

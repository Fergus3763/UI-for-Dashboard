// save_config.mjs — ESM Netlify Function
// Merges incoming fields into Supabase admin_ui_config.data
// POST body example: { venue: {...}, bookingPolicy: {...}, ... }
// Response: { ok, id, data, updated_at, created }

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    if (!body || typeof body !== "object") {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Invalid JSON body" }) };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ ok: false, error: "Missing Supabase env vars" }),
      };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const id = "default";

    // Fetch existing row (ignore "no rows" error)
    const { data: existingRow, error: fetchErr } = await supabase
      .from("admin_ui_config")
      .select("id, data, updated_at, created")
      .eq("id", id)
      .single();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      throw fetchErr;
    }

    const existingData = (existingRow && existingRow.data) || {};
    const merged = { ...existingData, ...body };
    const now = new Date().toISOString();

    let upsertRes;
    if (existingRow) {
      upsertRes = await supabase
        .from("admin_ui_config")
        .update({ data: merged, updated_at: now })
        .eq("id", id)
        .select()
        .single();
    } else {
      upsertRes = await supabase
        .from("admin_ui_config")
        .insert([{ id, data: merged, updated_at: now, created: now }])
        .select()
        .single();
    }

    if (upsertRes.error) throw upsertRes.error;

    const row = upsertRes.data;
    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        id: row.id,
        data: row.data,
        updated_at: row.updated_at,
        created: row.created,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: String(err) }) };
  }
};

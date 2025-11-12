// save_config.mjs — ESM Netlify Function
// Stores { venue, bookingPolicy, etc } inside admin_ui_config.data
// Guarantees data is an object even if Supabase row had data:null

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method Not Allowed" }),
    };
  }

  try {
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
    const body = JSON.parse(event.body || "{}");

    console.log("[save_config] incoming keys:", Object.keys(body));

    // Fetch existing row (if any)
    const { data: existingRow, error: fetchErr } = await supabase
      .from("admin_ui_config")
      .select("id, data")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") throw fetchErr;

    const existingData =
      existingRow && typeof existingRow.data === "object"
        ? existingRow.data
        : {};

    const merged = { ...existingData, ...body };
    const now = new Date().toISOString();

    const { error: upsertErr } = await supabase
      .from("admin_ui_config")
      .upsert({ id, data: merged, updated_at: now, created: existingRow?.created || now });

    if (upsertErr) throw upsertErr;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, id, savedKeys: Object.keys(merged) }),
    };
  } catch (err) {
    console.error("[save_config] ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(err) }),
    };
  }
};

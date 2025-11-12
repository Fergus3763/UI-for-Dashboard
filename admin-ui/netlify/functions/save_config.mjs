// save_config.mjs — ESM Netlify Function
// Stores { venue, bookingPolicy, etc } inside admin_ui_config.data

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

    // Log incoming keys (for visibility in Netlify logs)
    console.log("[save_config] incoming keys:", Object.keys(body));

    const { data: existing } = await supabase
      .from("admin_ui_config")
      .select("data")
      .eq("id", id)
      .single();

    const merged = { ...(existing?.data || {}), ...body };

    const { error } = await supabase
      .from("admin_ui_config")
      .upsert({ id, data: merged, updated_at: new Date().toISOString() });

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, message: "Configuration saved", id }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(err) }),
    };
  }
};

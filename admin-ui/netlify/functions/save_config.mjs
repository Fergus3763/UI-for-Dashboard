// load_config.mjs — ESM Netlify Function
// Returns the admin_ui_config row in a stable shape:
// { ok, id, data, updated_at, created }

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
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

    const { data: row, error } = await supabase
      .from("admin_ui_config")
      .select("id, data, updated_at, created")
      .eq("id", id)
      .single();

    // If no row yet, return an empty shell
    if (error && error.code === "PGRST116") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          id,
          data: {},
          updated_at: null,
          created: null,
        }),
      };
    }

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        id: row.id,
        data: row.data || {},
        updated_at: row.updated_at || null,
        created: row.created || null,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: String(err) }),
    };
  }
};

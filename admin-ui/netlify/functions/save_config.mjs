// UI-for-Dashboard/admin-ui/netlify/functions/save_config.mjs
import { supabase } from './_supabaseClient.mjs';

const TABLE = 'admin_ui_config';

/** @type {import('@netlify/functions').Handler} */
export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!event.body) {
      return { statusCode: 400, body: 'Missing body' };
    }

    const tenantHeader = event.headers['x-tenant-id'] || event.headers['X-Tenant-Id'];
    const payload = JSON.parse(event.body);

    const id = String(payload?.id || tenantHeader || 'default');

    const { data, error } = await supabase
      .from(TABLE)
      .upsert(
        {
          id,
          data: payload?.data ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('save_config upsert error:', error);
      return { statusCode: 500, body: `Supabase error: ${error.message}` };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id, data }),
    };
  } catch (err) {
    console.error('save_config exception:', err);
    return { statusCode: 500, body: `Server error: ${err?.message ?? 'unknown'}` };
  }
}

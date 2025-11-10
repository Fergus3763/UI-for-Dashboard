// UI-for-Dashboard/admin-ui/netlify/functions/load_config.mjs
import { supabase } from './_supabaseClient.mjs';

const TABLE = 'admin_ui_config';

/** @type {import('@netlify/functions').Handler} */
export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Prefer ?id=... then header, else 'default'
    const qs = new URLSearchParams(event.queryStringParameters || {});
    const idParam = qs.get('id');
    const tenantHeader = event.headers['x-tenant-id'] || event.headers['X-Tenant-Id'];
    const id = String(idParam || tenantHeader || 'default');

    const { data, error } = await supabase
      .from(TABLE)
      .select('id, data, updated_at')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('load_config select error:', error);
      return { statusCode: 500, body: `Supabase error: ${error.message}` };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        id,
        data: data?.data ?? null,
        updated_at: data?.updated_at ?? null,
        created: !data,
      }),
    };
  } catch (err) {
    console.error('load_config exception:', err);
    return { statusCode: 500, body: `Server error: ${err?.message ?? 'unknown'}` };
  }
}

// UI-for-Dashboard/admin-ui/netlify/functions/_supabaseClient.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('Missing env SUPABASE_URL');
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env SUPABASE_SERVICE_ROLE_KEY');
}

// Service-role client for server-side only (NEVER expose to browser)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

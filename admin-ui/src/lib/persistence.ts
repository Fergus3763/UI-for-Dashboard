// UI-for-Dashboard/admin-ui/src/lib/persistence.ts

export type PersistOptions = {
  tenantId?: string;
  signal?: AbortSignal;
};

async function request<T>(url: string, init: RequestInit & { tenantId?: string } = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.tenantId) headers['X-Tenant-Id'] = init.tenantId;

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

/** Save the entire Admin configuration blob. */
export async function saveConfig(
  data: unknown,
  opts: PersistOptions = {}
): Promise<{ ok: boolean; id: string; data: unknown }> {
  return request('/.netlify/functions/save_config', {
    method: 'POST',
    body: JSON.stringify({ data }),
    signal: opts.signal,
    tenantId: opts.tenantId,
  });
}

/** Load configuration for a tenant/id (defaults to 'default'). */
export async function loadConfig(
  opts: PersistOptions = {}
): Promise<{ ok: boolean; id: string; data: unknown; updated_at: string | null; created?: boolean }> {
  return request('/.netlify/functions/load_config', {
    method: 'GET',
    signal: opts.signal,
    tenantId: opts.tenantId,
  });
}

// ═══════════════════════════════════════════════════════
//  Small fetch wrapper for the admin panel's /api/admin routes.
//  All admin data lives in Firebase and is reached through these
//  routes (the browser never talks to the database directly).
// ═══════════════════════════════════════════════════════

export async function adminFetch<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok || json?.success === false) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }

  return (json && 'data' in json ? json.data : json) as T;
}

export function jsonBody(body: unknown): RequestInit['body'] {
  return JSON.stringify(body);
}

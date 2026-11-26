import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { isOwner } from './owner';

/** The signed-in owner, checked ONCE per page render (every api() call on the page reuses it). */
export const currentUser = cache(async () => {
  const supabase = await createClient();
  // Verified locally (signature + expiry) with Supabase's cached public signing keys: no network round trip.
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims?.email as string | undefined;
  return email && isOwner(email) ? { email } : null;
});

/**
 * For background requests (live-update poll, images): verify the current access token ONLY, never renew it.
 * Renewing the session from many parallel requests reuses the same refresh token and makes Supabase end the
 * session. Page loads (middleware) are the only place that renews; an expired token here just returns null.
 */
export async function backgroundUser() {
  const store = await cookies();
  const parts = store.getAll().filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  if (!parts.length) return null;
  try {
    let raw = parts.map((c) => c.value).join('');
    if (raw.startsWith('base64-')) raw = Buffer.from(raw.slice(7), 'base64url').toString('utf8');
    const token = (JSON.parse(raw) as { access_token?: string }).access_token;
    if (!token) return null;
    const { data } = await (await createClient()).auth.getClaims(token); // checks signature + expiry; no refresh
    const email = data?.claims?.email as string | undefined;
    return email && isOwner(email) ? { email } : null;
  } catch { return null; }
}

/** Server-side call to the CreatorOS API. Requires a signed-in Supabase user. */
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  if (!(await currentUser())) throw new Error('Not authorised');
  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...init, cache: 'no-store',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.API_KEY!, ...init.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

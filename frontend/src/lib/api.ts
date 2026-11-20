import 'server-only';
import { createClient } from '@/utils/supabase/server';

/** Server-side call to the CreatorOS API. Requires a signed-in Supabase user. */
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  const res = await fetch(`${process.env.API_URL}${path}`, {
    ...init, cache: 'no-store',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.API_KEY!, ...init.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

import { NextResponse } from 'next/server';
import { backgroundUser } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Tiny "has anything changed?" value for the live dashboard. Never renews the login (see backgroundUser). */
export async function GET() {
  if (!(await backgroundUser())) return NextResponse.json({ error: 'login expired' }, { status: 401 });
  try {
    const res = await fetch(`${process.env.API_URL}/pulse`, { cache: 'no-store', headers: { 'x-api-key': process.env.API_KEY! } });
    if (!res.ok) throw new Error(String(res.status));
    return NextResponse.json(await res.json());
  } catch { return NextResponse.json({ error: 'unavailable' }, { status: 503 }); }
}

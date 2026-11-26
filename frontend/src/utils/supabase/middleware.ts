import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { isOwner } from '@/lib/owner';

/** Refreshes the Supabase session and redirects signed-out users to /login. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // getClaims verifies the signed (ES256) session token locally with cached public keys and refreshes an
  // expired session, so most requests need no round trip to Supabase.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ? { email: data.claims.email as string | undefined } : null;
  if (!request.nextUrl.pathname.startsWith('/login') && (!user || !isOwner(user.email))) {
    // Signed in but not an allowed owner: end the session and send to login.
    if (user) await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = user ? '?denied=1' : '';
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  }
  return response;
}

'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Keeps the dashboard live without reloading every page constantly: polls a tiny "has anything changed?"
 * value and re-renders the page only when it changes (a new approval, a step finished, a post, …).
 */
export function LiveRefresh({ ms = 2500 }: { ms?: number }) {
  const router = useRouter();
  const last = useRef<string | null>(null);
  const renewing = useRef(false);
  useEffect(() => {
    let stopped = false;
    const tick = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const r = await fetch('/api/pulse', { cache: 'no-store' });
        // Login token expired: one normal page refresh lets the middleware renew it (once, not from every poll).
        if (r.status === 401) { if (!renewing.current) { renewing.current = true; router.refresh(); setTimeout(() => { renewing.current = false; }, 30_000); } return; }
        if (!r.ok) return;
        const { v } = (await r.json()) as { v: string };
        if (last.current !== null && v !== last.current && !stopped) router.refresh();
        last.current = v;
      } catch { /* offline or API restarting: try again next tick */ }
    };
    tick();
    const id = setInterval(tick, ms);
    const onFocus = () => { last.current = null; tick(); router.refresh(); };
    window.addEventListener('focus', onFocus);
    return () => { stopped = true; clearInterval(id); window.removeEventListener('focus', onFocus); };
  }, [router, ms]);
  return null;
}

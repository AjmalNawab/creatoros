'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Re-fetches server data periodically so the dashboard shows live agent activity. */
export function AutoRefresh({ ms = 3000 }: { ms?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, ms);
    return () => clearInterval(id);
  }, [router, ms]);
  return null;
}

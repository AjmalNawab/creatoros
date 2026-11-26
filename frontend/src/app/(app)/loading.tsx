import { Skeleton } from '@/components/ui';

/** Shown instantly while a page's data loads. */
export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3"><Skeleton className="size-10" /><div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-72 max-w-full" /></div></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      <Skeleton className="h-64" />
    </div>
  );
}

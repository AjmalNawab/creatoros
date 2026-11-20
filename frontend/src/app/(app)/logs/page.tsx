import { ScrollText } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, EmptyState, PageHeader } from '@/components/ui';

type Log = { id: string; at: string; actor: string; action: string; entity: string | null; entityId: string | null; data: Record<string, unknown> };

const tone = (a: string) =>
  /dead|emergency_stop\.on|aborted|rejected/.test(a) ? 'bg-red-500'
  : /failed/.test(a) ? 'bg-orange-500'
  : /completed|approved|published|consumed|selected/.test(a) ? 'bg-emerald-500'
  : /approval|awaiting/.test(a) ? 'bg-violet-500'
  : /ai\.|waiting_ai/.test(a) ? 'bg-sky-500'
  : /human|waiting_human/.test(a) ? 'bg-fuchsia-500' : 'bg-zinc-300 dark:bg-zinc-600';

export default async function LogsPage() {
  const logs = await api<Log[]>('/audit?limit=300');
  return (
    <div>
      <PageHeader icon={ScrollText} title="Logs" description="Append-only audit trail: every decision, agent run, approval and upload is recorded here." />
      {!logs.length ? <EmptyState icon={ScrollText} title="No events yet" /> : (
        <Card padded={false}>
          <ol className="divide-y divide-zinc-100 font-mono text-xs dark:divide-zinc-800">
            {logs.map((l) => (
              <li key={l.id} className="grid grid-cols-[auto_1fr] items-baseline gap-x-3 px-5 py-2 sm:grid-cols-[110px_auto_200px_150px_1fr]">
                <span className="text-zinc-400">{new Date(l.at).toLocaleTimeString()}</span>
                <span className={`hidden size-2 self-center rounded-full sm:block ${tone(l.action)}`} />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{l.action}</span>
                <span className="truncate text-zinc-500">{l.actor}</span>
                <span className="col-span-2 truncate text-zinc-400 sm:col-span-1" title={JSON.stringify(l.data)}>{l.entityId ? `${l.entity}:${l.entityId.slice(0, 8)} ` : ''}{Object.keys(l.data).length ? JSON.stringify(l.data) : ''}</span>
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}

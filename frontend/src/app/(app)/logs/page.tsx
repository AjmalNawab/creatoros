import { api } from '@/lib/api';
import { Card } from '@/components/ui';

type Log = { id: string; at: string; actor: string; action: string; entity: string | null; entityId: string | null; data: Record<string, unknown> };

const tone = (a: string) =>
  a.includes('dead') || a.includes('emergency_stop.on') || a.includes('aborted') ? 'text-red-600'
  : a.includes('failed') ? 'text-orange-600'
  : a.includes('completed') || a.includes('approved') ? 'text-emerald-600'
  : a.includes('approval') ? 'text-violet-600' : '';

export default async function LogsPage() {
  const logs = await api<Log[]>('/audit?limit=300');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">System logs</h1>
      <Card>
        <ul className="divide-y divide-zinc-200 font-mono text-xs dark:divide-zinc-800">
          {logs.map((l) => (
            <li key={l.id} className="grid grid-cols-[auto_1fr] gap-x-4 py-1.5 sm:grid-cols-[150px_160px_220px_1fr]">
              <span className="text-zinc-500">{new Date(l.at).toLocaleTimeString()}</span>
              <span className="truncate text-zinc-500">{l.actor}</span>
              <span className={`font-semibold ${tone(l.action)}`}>{l.action}</span>
              <span className="truncate text-zinc-500" title={JSON.stringify(l.data)}>
                {l.entityId ? `${l.entity}:${l.entityId.slice(0, 8)} ` : ''}{Object.keys(l.data).length ? JSON.stringify(l.data) : ''}
              </span>
            </li>
          ))}
          {!logs.length && <li className="py-2 text-zinc-500">No events yet.</li>}
        </ul>
      </Card>
    </div>
  );
}

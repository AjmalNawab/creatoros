import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge, Card, EmptyState, PageHeader, ago } from '@/components/ui';
import { VideoTitle } from '@/components/video-title';
import { ClaudePanel, type OperatorStatus } from '@/components/claude-panel';

const KIND: Record<string, string> = {
  trends: 'Find trends', ideas: 'Suggest ideas', research: 'Research facts', script: 'Write the script', visuals: 'Design the scenes',
  youtube_metadata: 'YouTube title & description', facebook_metadata: 'Facebook caption', tiktok_metadata: 'TikTok caption',
  instagram_metadata: 'Instagram caption', snapchat_metadata: 'Snapchat caption',
};

type Req = {
  id: string; kind: string; format: string; status: string; error: string | null; createdAt: string; answeredAt: string | null; answeredBy: string | null;
  task: { id: string; contentProject: { id: string; slug: string; title: string } | null };
  displayTitle: string | null;
};
const MAP: Record<string, string> = { PENDING: 'WAITING_AI', ANSWERED: 'QUEUED', CONSUMED: 'COMPLETED', REJECTED: 'FAILED' };
const LABEL: Record<string, string> = { PENDING: 'Waiting', ANSWERED: 'Answered', CONSUMED: 'Used', REJECTED: 'Rejected · re-asked' };

export default async function AiQueuePage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const [reqs, op, { msg }] = await Promise.all([api<Req[]>('/ai-requests'), api<OperatorStatus>('/operator'), searchParams]);
  return (
    <div className="space-y-6">
      <PageHeader icon={Sparkles} title="Waiting for Claude" description="Writing work (research, scripts, scene designs, captions) waits here until Claude answers it. Press the button, or switch on Auto and it starts by itself." />
      {msg && <div role="status" className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200">{msg}</div>}
      <ClaudePanel st={op} />
      <p className="text-xs text-zinc-400">You can also say “process the AI queue” in Claude Code. Either way it&apos;s free: it uses your normal Claude plan, not a paid service.</p>
      {reqs.length ? (
        <Card padded={false}>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reqs.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <span className="font-medium">{KIND[r.kind] ?? r.kind.replace(/_/g, ' ')}</span>
                {r.task.contentProject ? <Link href={`/content/${r.task.contentProject.id}`} className="min-w-0 flex-1 text-zinc-500 hover:underline"><VideoTitle title={r.displayTitle} oneLine size="sm" /></Link> : <span className="text-zinc-400">Ideas</span>}
                <span className="ml-auto flex items-center gap-3"><Badge status={MAP[r.status] ?? r.status} label={LABEL[r.status]} /><span className="w-16 text-right text-xs text-zinc-400">{ago(r.answeredAt ?? r.createdAt)}</span></span>
                {r.error && <div className="basis-full truncate text-xs text-orange-600" title={r.error}>Fixed and re-asked: {r.error}</div>}
              </li>
            ))}
          </ul>
        </Card>
      ) : <EmptyState icon={Sparkles} title="No AI requests yet" />}
    </div>
  );
}

import { api } from '@/lib/api';
import { Badge, Card, ago } from '@/components/ui';
import { ScriptView, VideoPlayer, media } from '@/components/content';

type Task = {
  id: string; agentId: string; type: string; status: string; lastError: string | null; output: Record<string, unknown> | null;
  approvals: { id: string; decision: string; feedback: string | null }[];
  aiRequests: { id: string; kind: string; status: string; error: string | null; createdAt: string }[];
};
type Project = { id: string; slug: string; title: string; status: string; createdAt: string; tasks: Task[]; files: { path: string; bytes: number }[] };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await api<Project>(`/content/${id}`);
  const has = (rel: string) => p.files.some((f) => f.path === rel);
  const script = p.tasks.find((t) => t.agentId === 'script')?.output as { scenes?: never[]; titleOptions?: string[]; words?: number; targetWords?: number } | null;
  const audio = p.files.filter((f) => /^audio\/scene_\d+\.mp3$/.test(f.path)).sort((a, b) => parseInt(a.path.match(/\d+/)![0]) - parseInt(b.path.match(/\d+/)![0]));
  const stills = p.files.filter((f) => /^visuals\/stills\/scene_\d+\.jpg$/.test(f.path)).sort((a, b) => parseInt(a.path.match(/\d+/)![0]) - parseInt(b.path.match(/\d+/)![0]));
  const videoRel = `output/${p.slug}.mp4`;
  const qa = p.tasks.find((t) => t.agentId === 'qa')?.output as { checks?: { check: string; pass: boolean; detail: string }[] } | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" dir="auto">{p.title}</h1>
        <div className="font-mono text-xs text-zinc-500">content/{p.slug} · {p.status.replace(/_/g, ' ')} · created {ago(p.createdAt)}</div>
      </div>

      <Card title="Pipeline">
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {p.tasks.filter((t) => t.agentId !== 'orchestrator').map((t, i) => (
            <li key={t.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2 text-sm"><span>{i + 1}. {t.agentId}</span><Badge status={t.status} /></div>
              {t.status === 'WAITING_AI' && <div className="mt-1 text-xs text-sky-700 dark:text-sky-400">Waiting for Claude Code. Say “process the AI queue”.</div>}
              {t.lastError && <div className="mt-1 line-clamp-3 text-xs text-red-600" title={t.lastError}>{t.lastError}</div>}
              {t.aiRequests.find((r) => r.status === 'REJECTED') && <div className="mt-1 text-xs text-orange-600">AI answer rejected once: re-asked with the error</div>}
            </li>
          ))}
        </ol>
      </Card>

      {has(videoRel) && <Card title="Final video"><VideoPlayer src={media(p.id, videoRel)} /></Card>}

      {qa?.checks && (
        <Card title="Quality checks">
          <ul className="space-y-1 text-sm">{qa.checks.map((c, i) => <li key={i}>{c.pass ? '✅' : '❌'} {c.check} <span className="text-zinc-500">{c.detail}</span></li>)}</ul>
        </Card>
      )}

      {stills.length > 0 && (
        <Card title="Scene previews">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {stills.map((f, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f.path} src={media(p.id, f.path)} alt={`Scene ${i + 1}`} className="w-full rounded-lg" />
            ))}
          </div>
        </Card>
      )}

      {audio.length > 0 && (
        <Card title="Narration">
          <ul className="space-y-2">{audio.map((f, i) => (
            <li key={f.path} className="flex items-center gap-3 text-sm"><span className="w-16 text-zinc-500">Scene {i + 1}</span><audio controls preload="none" src={media(p.id, f.path)} className="h-8 flex-1" /></li>
          ))}</ul>
        </Card>
      )}

      {script?.scenes && <Card title="Script"><ScriptView scenes={script.scenes} titleOptions={script.titleOptions} words={script.words} targetWords={script.targetWords} /></Card>}

      <Card title="Files">
        <ul className="grid gap-x-6 font-mono text-xs sm:grid-cols-2">
          {p.files.map((f) => <li key={f.path} className="truncate py-0.5"><a href={media(p.id, f.path)} target="_blank" className="hover:underline">{f.path}</a> <span className="text-zinc-500">{(f.bytes / 1024).toFixed(0)} KB</span></li>)}
        </ul>
      </Card>
    </div>
  );
}

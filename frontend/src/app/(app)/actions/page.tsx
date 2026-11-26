import Link from 'next/link';
import { Check, ChevronDown, ExternalLink, MessageSquareText, MonitorUp, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { completeHumanAction } from '@/lib/actions';
import { PLATFORM_NAME, platformOfAction } from '@/lib/labels';
import { Badge, Btn, Card, EmptyState, Json, LinkBtn, PageHeader, ago, inputCls } from '@/components/ui';
import { VideoPlayer, media } from '@/components/content';
import { PlatformIcon } from '@/components/platform-icon';
import { VideoTitle } from '@/components/video-title';

type Payload = {
  video?: string; caption?: string; description?: string; title?: string; visibility?: string; audience?: string; format?: string;
  account?: { handle?: string; name?: string }; page?: { name?: string }; channel?: { handle?: string };
};
type Action = {
  id: string; kind: string; title: string; instructions: string; payload: Payload; status: string; result: Record<string, unknown> | null;
  createdAt: string; completedAt: string | null; displayTitle: string | null;
  task: { id: string; agentId: string; contentProject: { id: string; slug: string; title: string } | null };
};

const LINK_INPUT: Record<string, { pattern: string; example: string }> = {
  tiktok: { pattern: 'https://(www\\.)?tiktok\\.com/@.+/video/.+', example: 'https://www.tiktok.com/@…/video/…' },
  facebook: { pattern: 'https://(www\\.|m\\.|web\\.)?facebook\\.com/.+', example: 'https://www.facebook.com/reel/…' },
  instagram: { pattern: 'https://(www\\.)?instagram\\.com/(reels?|p)/.+', example: 'https://www.instagram.com/reel/…' },
  snapchat: { pattern: 'https://((www\\.)?snapchat\\.com/.*spotlight/.+|t\\.snapchat\\.com/.+)', example: 'https://www.snapchat.com/spotlight/…' },
  youtube: { pattern: 'https://(www\\.)?(youtube\\.com/(watch\\?v=|shorts/)|youtu\\.be/|studio\\.youtube\\.com/video/).+', example: 'https://youtube.com/shorts/…' },
};

export default async function ReadyToPostPage() {
  const [pending, all] = await Promise.all([api<Action[]>('/human-actions?status=PENDING'), api<Action[]>('/human-actions')]);
  const done = all.filter((a) => a.status !== 'PENDING');
  return (
    <div className="space-y-6">
      <PageHeader icon={MonitorUp} title="Ready to post" description="Approved videos waiting to go live. Claude posts them in your Chrome while you watch, using exactly what you approved." />

      {!pending.length && <EmptyState icon={MonitorUp} title="Nothing waiting to post">After you approve a caption, the video appears here.</EmptyState>}

      {pending.map((a) => {
        const pl = platformOfAction(a.kind);
        const p = a.payload;
        const pid = a.task.contentProject?.id;
        const text = p.caption ?? p.description;
        const where = p.account?.handle ?? p.page?.name ?? p.channel?.handle;
        const link = LINK_INPUT[pl] ?? LINK_INPUT.youtube;
        return (
          <section key={a.id} id={a.id} className="scroll-mt-20 overflow-hidden rounded-2xl border border-fuchsia-200 bg-white shadow-sm target:ring-4 target:ring-fuchsia-500/30 dark:border-fuchsia-900/60 dark:bg-zinc-900">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 bg-fuchsia-50/50 px-5 py-3.5 dark:border-zinc-800 dark:bg-fuchsia-950/20">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white ring-1 ring-fuchsia-200 dark:bg-zinc-900 dark:ring-fuchsia-900"><PlatformIcon id={pl} /></div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Post on {PLATFORM_NAME[pl] ?? pl}{where ? <span className="font-normal text-zinc-500"> · {where}</span> : null}</div>
                  {pid ? <Link href={`/content/${pid}`} className="hover:underline"><VideoTitle title={a.displayTitle} oneLine size="sm" className="text-xs text-zinc-500" /></Link> : null}
                </div>
              </div>
              <span className="text-xs text-zinc-400">approved {ago(a.createdAt)}</span>
            </header>

            <div className="grid gap-5 p-5 lg:grid-cols-5">
              {pid && p.video && <div className="lg:col-span-2"><VideoPlayer vertical={pl !== 'youtube' || p.format === 'short'} src={media(pid, p.video)} /></div>}
              <div className="space-y-4 lg:col-span-3">
                {p.title && pl !== 'tiktok' && <div><div className="text-xs font-medium text-zinc-500">Title</div><VideoTitle title={p.title} className="mt-1 font-semibold" /></div>}
                {text && <div><div className="text-xs font-medium text-zinc-500">{pl === 'youtube' ? 'Description' : 'Caption'}</div><p className="bidi-lines mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-sm leading-relaxed ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">{text}</p></div>}
                <div className="flex items-start gap-3 rounded-xl bg-zinc-900 p-4 text-sm text-white dark:bg-white dark:text-zinc-900">
                  <MessageSquareText className="mt-0.5 size-5 shrink-0 text-orange-400" />
                  <div>
                    <div className="font-semibold">To post: say “post it” to Claude Code</div>
                    <div className="mt-0.5 text-xs opacity-75">Keep Chrome open. Claude posts it while you watch, then the link appears here.</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500"><ShieldCheck className="size-3.5 text-emerald-500" />Only this exact video and text can be posted. Login or CAPTCHA screens are handed back to you.</div>
              </div>
            </div>

            <details className="group border-t border-zinc-100 dark:border-zinc-800">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-5 py-3 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"><ChevronDown className="size-3.5 transition group-open:rotate-180" />Posted it yourself? Paste the link</summary>
              <form action={completeHumanAction.bind(null, a.id)} className="flex flex-col gap-2 px-5 pb-4 sm:flex-row">
                <input name="url" type="url" required pattern={link.pattern} title={`The post link, e.g. ${link.example}`} placeholder={`Post link (${link.example})`} className={`${inputCls} flex-1`} />
                <input name="notes" placeholder="Notes (optional)" className={`${inputCls} sm:w-56`} />
                <Btn tone="success" icon={Check} pendingLabel="Saving…">It&apos;s posted</Btn>
              </form>
              <details className="px-5 pb-4"><summary className="cursor-pointer text-xs text-zinc-400">Technical details</summary><div className="mt-2 space-y-2"><pre className="whitespace-pre-wrap text-xs text-zinc-500">{a.instructions}</pre><Json value={a.payload} /></div></details>
            </details>
          </section>
        );
      })}

      {done.length > 0 && (
        <Card title="Posted" padded={false}>
          <ul className="divide-y divide-zinc-100 text-sm dark:divide-zinc-800">
            {done.map((a) => {
              const pl = platformOfAction(a.kind);
              const url = typeof a.result?.url === 'string' ? a.result.url : null;
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-2.5">
                  <PlatformIcon id={pl} />
                  <div className="min-w-0 flex-1"><VideoTitle title={a.displayTitle} oneLine size="sm" /></div>
                  {a.status === 'DONE' || a.status === 'COMPLETED' ? null : <Badge status={a.status} />}
                  <span className="hidden text-xs text-zinc-400 sm:block">{ago(a.completedAt)}</span>
                  {url && <LinkBtn href={url} external size="sm" tone="ghost" icon={ExternalLink}>Open</LinkBtn>}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

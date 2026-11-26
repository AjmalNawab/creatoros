'use client';
import { useRef, useState } from 'react';
import { Check, MessageSquareWarning, X } from 'lucide-react';
import { btnCls } from './btn-styles';
import { FormPending } from './buttons';
import { inputCls } from './ui';

/**
 * Approve / Request changes / Reject for one approval.
 * "Request changes" needs a note (so Claude knows what to fix); "Reject" asks for confirmation.
 */
export function DecisionBar({ action, approveLabel = 'Approve' }: { action: (form: FormData) => Promise<void>; approveLabel?: string }) {
  const note = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState<string | null>(null);
  return (
    <form action={action} className="sticky bottom-0 z-10 space-y-2 border-t border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur sm:px-5 dark:border-zinc-800 dark:bg-zinc-900/95">
      <textarea ref={note} name="feedback" rows={1} onChange={() => setHint(null)}
        placeholder="Note for Claude: what should change? (needed for “Request changes”)"
        className={`${inputCls} h-auto min-h-10 resize-y py-2 ${hint ? 'border-orange-400 ring-4 ring-orange-500/10' : ''}`} />
      {hint && <p className="text-xs font-medium text-orange-600">{hint}</p>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="submit" name="decision" value="REJECTED" className={`${btnCls('ghost')} text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40`}
          onClick={(e) => { if (!window.confirm('Reject this? The step stops here and nothing is posted.')) e.preventDefault(); }}>
          <X className="size-4" />Reject<FormPending name="decision" value="REJECTED" />
        </button>
        <button type="submit" name="decision" value="CHANGES_REQUESTED" className={btnCls('default')}
          onClick={(e) => { if (!note.current?.value.trim()) { e.preventDefault(); setHint('Write what should change, then press “Request changes” again.'); note.current?.focus(); } }}>
          <MessageSquareWarning className="size-4" />Request changes<FormPending name="decision" value="CHANGES_REQUESTED" />
        </button>
        <button type="submit" name="decision" value="APPROVED" className={`${btnCls('success', 'lg')} min-w-32`}>
          <Check className="size-4" />{approveLabel}<FormPending name="decision" value="APPROVED" label="Approving…" />
        </button>
      </div>
    </form>
  );
}

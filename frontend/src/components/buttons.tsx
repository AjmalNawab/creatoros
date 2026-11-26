'use client';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { btnCls, type BtnSize, type BtnTone } from './btn-styles';

/**
 * Shown inside a submit button while its form's server action runs: a spinner on the button that was
 * clicked (matched by name/value), and a "busy" cover on the other buttons of the same form.
 */
export function FormPending({ name, value, label }: { name?: string; value?: string; label?: string }) {
  const { pending, data } = useFormStatus();
  if (!pending) return null;
  const mine = !name || data?.get(name) === value;
  return (
    <span aria-live="polite" className="absolute inset-0 flex cursor-wait items-center justify-center gap-1.5 rounded-[inherit] bg-inherit">
      {mine ? <><Loader2 className="size-4 animate-spin" />{label && <span>{label}</span>}</> : <span className="opacity-40">…</span>}
    </span>
  );
}

/** A submit button that asks for confirmation first (for destructive or public actions). */
export function ConfirmBtn({ message, children, tone = 'default', size = 'md', icon, name, value, className = '' }: {
  message: string; children: React.ReactNode; tone?: BtnTone; size?: BtnSize; icon?: React.ReactNode; name?: string; value?: string; className?: string;
}) {
  return (
    <button type="submit" name={name} value={value} className={`${btnCls(tone, size)} ${className}`}
      onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {icon}{children}
      <FormPending name={name} value={value} />
    </button>
  );
}

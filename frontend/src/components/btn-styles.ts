export type BtnTone = 'default' | 'primary' | 'accent' | 'danger' | 'ghost' | 'success' | 'soft';
export type BtnSize = 'sm' | 'md' | 'lg';

const TONES: Record<BtnTone, string> = {
  default: 'border border-zinc-300 bg-white text-zinc-800 shadow-sm hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800',
  primary: 'bg-zinc-900 text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200',
  accent: 'bg-orange-500 text-white shadow-sm shadow-orange-500/20 hover:bg-orange-600',
  success: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700',
  soft: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white',
};
const SIZES: Record<BtnSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
};

/** Shared look for <button>, <Link> and <a> buttons. Touch-friendly heights (≥ 32 px). */
export const btnCls = (tone: BtnTone = 'default', size: BtnSize = 'md') =>
  `relative inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium transition active:scale-[.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/25 disabled:pointer-events-none disabled:opacity-50 ${SIZES[size]} ${TONES[tone]}`;
export const iconCls = (size: BtnSize = 'md') => (size === 'sm' ? 'size-3.5' : 'size-4');

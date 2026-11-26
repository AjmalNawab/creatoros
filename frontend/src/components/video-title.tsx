const URDU = /[؀-ۿ]/;

/**
 * A video title. Bilingual titles ("اردو عنوان | English title") are split into two clean lines,
 * so Urdu and English never jumble on one line. Urdu uses the Nastaliq font.
 * oneLine: only the main title, truncated (for compact rows).
 */
export function VideoTitle({ title, oneLine = false, size = 'base', className = '' }: { title: string | null | undefined; oneLine?: boolean; size?: 'sm' | 'base' | 'lg'; className?: string }) {
  const [main, sub] = (title ?? 'Untitled video').split(/\s+\|\s+/, 2);
  const ur = URDU.test(main);
  const mainSize = size === 'lg' ? (ur ? 'text-2xl leading-[2.1]' : 'text-xl sm:text-2xl') : size === 'sm' ? (ur ? 'text-[15px] leading-[2]' : 'text-sm') : ur ? 'text-[17px] leading-[2]' : 'text-[15px]';
  if (oneLine) {
    return <span title={title ?? undefined} className={`block truncate ${className}`}><bdi className={`${ur ? 'urdu' : ''} ${mainSize}`} style={{ lineHeight: ur ? 1.9 : undefined }}>{main}</bdi></span>;
  }
  return (
    <span className={`block text-left ${className}`}>
      <span dir="auto" className={`block text-left ${ur ? 'urdu' : ''} ${mainSize}`}>{main}</span>
      {sub && <span dir="auto" className={`mt-0.5 block text-left font-normal text-zinc-500 ${URDU.test(sub) ? 'urdu text-sm' : size === 'lg' ? 'text-sm' : 'text-xs'}`}>{sub}</span>}
    </span>
  );
}

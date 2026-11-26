import { Camera, Facebook, Ghost, Instagram, Linkedin, Music2, Radio, Youtube, type LucideIcon } from 'lucide-react';

export const PLATFORM_ICON: Record<string, [LucideIcon, string]> = {
  youtube: [Youtube, 'text-red-500'],
  facebook: [Facebook, 'text-blue-600'],
  tiktok: [Music2, 'text-zinc-900 dark:text-white'],
  instagram: [Instagram, 'text-pink-500'],
  snapchat: [Ghost, 'text-yellow-500'],
  linkedin: [Linkedin, 'text-sky-700'],
  camera: [Camera, 'text-zinc-500'],
};

export function PlatformIcon({ id, className = 'size-4' }: { id: string; className?: string }) {
  const [Icon, color] = PLATFORM_ICON[id] ?? [Radio, 'text-zinc-500'];
  return <Icon className={`${className} shrink-0 ${color}`} aria-label={id} />;
}

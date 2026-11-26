import type { PlatformModule } from '..';
import { shortVideoPlatform } from '../short-video';

/** https://www.instagram.com/reel/<code>/ (also /p/<code>/) */
export const IG_POST = /^https:\/\/(?:www\.)?instagram\.com\/(?:reels?|p)\/([\w-]+)/;

/**
 * Instagram agent: Reels on a separate anonymous account "Chai & Curiosity" (INSTAGRAM_HANDLE in .env),
 * NOT linked to the Facebook Page (owner's choice: anonymity). Active once the handle is set.
 */
const ig = shortVideoPlatform({
  id: 'instagram', name: 'Instagram', handleEnv: 'INSTAGRAM_HANDLE',
  profileUrl: (h) => `https://www.instagram.com/${h.replace(/^@/, '')}/`,
  postUrl: IG_POST, urlExample: 'instagram.com/reel/<code>/',
  feed: 'Instagram Reels: people scroll with sound often off and save or share posts that teach them something. Saves and shares matter most.',
  captionLines: '2-4 short lines.', captionMax: 1200,
  hashtags: { min: 3, max: 8, rule: 'Mix Urdu, Roman Urdu and English where natural (e.g. #سائنس #pakistan #sciencefacts #urdu). No #explore/#viral spam.' },
  sources: true, aiLabel: 'Advanced settings → "AI label" (Add AI info)',
  uploadSteps: (videoPath) => [
    '1. instagram.com → Create (+) → Post → select file: ' + videoPath + ' (videos are posted as Reels).',
    '2. Crop: Original (9:16). Next through edit. Caption: payload.caption exactly.',
    '3. Advanced settings: keep comments on, do NOT share to Facebook (separate accounts).',
    '4. Share.',
  ],
});

export const INSTAGRAM_ACCOUNT = ig.account;
export const instagram: PlatformModule = {
  ...ig.module,
  notes: 'Reels on the separate “Chai & Curiosity” account: vertical videos, caption + hashtags, AI label on. Posted from your Chrome.',
};

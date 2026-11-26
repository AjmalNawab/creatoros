import type { PlatformModule } from '..';
import { shortVideoPlatform } from '../short-video';

/** Spotlight links: snapchat.com/spotlight/<id>, snapchat.com/@user/spotlight/<id>, or a t.snapchat.com share link. */
export const SC_POST = /^https:\/\/(?:(?:www\.)?snapchat\.com\/(?:@[\w.-]+\/)?spotlight\/([\w-]+)|t\.snapchat\.com\/([\w-]+))/;

/**
 * Snapchat agent: Spotlight posts on a separate anonymous public profile "Chai & Curiosity"
 * (SNAPCHAT_HANDLE in .env). Posted from the desktop web (profile.snapchat.com) in the owner's Chrome.
 * Spotlight takes vertical videos of about 5-60 s, so our Shorts fit; captions are short.
 */
const sc = shortVideoPlatform({
  id: 'snapchat', name: 'Snapchat', handleEnv: 'SNAPCHAT_HANDLE',
  profileUrl: (h) => `https://www.snapchat.com/add/${h.replace(/^@/, '')}`,
  postUrl: SC_POST, urlExample: 'snapchat.com/spotlight/<id>',
  feed: 'Snapchat Spotlight: a fast, young audience; the caption is short and topics (#hashtags) decide who sees it.',
  captionLines: 'ONE short line (a hook or question).', captionMax: 120,
  hashtags: { min: 1, max: 3, rule: 'Simple topic tags people follow (e.g. #science #facts #pakistan).' },
  sources: false, aiLabel: 'If Snapchat offers an AI-content label, turn it',
  uploadSteps: (videoPath) => [
    '1. profile.snapchat.com (public profile) → upload / Post to Spotlight → select file: ' + videoPath,
    '2. Description: payload.caption exactly (if it is too long for Spotlight, stop and tell the owner; do not shorten it yourself).',
    '3. Send to: Spotlight only. Keep it public.',
    '4. Post.',
  ],
});

export const SNAPCHAT_ACCOUNT = sc.account;
export const snapchat: PlatformModule = {
  ...sc.module,
  notes: 'Spotlight on the separate “Chai & Curiosity” public profile: vertical Shorts, one-line caption + topics. Posted from your Chrome.',
};

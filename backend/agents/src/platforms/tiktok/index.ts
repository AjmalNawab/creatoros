import type { PlatformModule } from '..';

/**
 * TikTok agent: PLANNED (not built yet).
 * Vertical 9:16 video, caption + hashtags. Route: owner's Chrome first (API posts are private-only until audit).
 * To activate: add package + publish agents (see ../youtube), list them in agents/steps, set status 'active'.
 */
export const tiktok: PlatformModule = {
  id: 'tiktok', name: 'TikTok', status: 'planned', route: 'browser', agents: [], steps: [],
  notes: "Vertical 9:16 video, caption + hashtags. Route: owner's Chrome first (API posts are private-only until audit).",
};

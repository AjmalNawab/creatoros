import type { PlatformModule } from '..';

/**
 * Instagram agent: PLANNED (not built yet).
 * Reel (9:16, ≤90s), caption + hashtags, cover. Route: owner's Chrome first, Instagram Platform API later.
 * To activate: add package + publish agents (see ../youtube), list them in agents/steps, set status 'active'.
 */
export const instagram: PlatformModule = {
  id: 'instagram', name: 'Instagram', status: 'planned', route: 'browser', agents: [], steps: [],
  notes: "Reel (9:16, ≤90s), caption + hashtags, cover. Route: owner's Chrome first, Instagram Platform API later.",
};

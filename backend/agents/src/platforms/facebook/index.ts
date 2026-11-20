import type { PlatformModule } from '..';

/**
 * Facebook agent: PLANNED (not built yet).
 * Page video / Reel (9:16 vertical cut), caption. Route: owner's Chrome (Meta Business Suite) first, Graph API later.
 * To activate: add package + publish agents (see ../youtube), list them in agents/steps, set status 'active'.
 */
export const facebook: PlatformModule = {
  id: 'facebook', name: 'Facebook', status: 'planned', route: 'browser', agents: [], steps: [],
  notes: "Page video / Reel (9:16 vertical cut), caption. Route: owner's Chrome (Meta Business Suite) first, Graph API later.",
};

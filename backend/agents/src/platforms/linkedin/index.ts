import type { PlatformModule } from '..';

/**
 * LinkedIn agent: PLANNED (not built yet).
 * Professional educational post with a short clip or graphic. Route: owner's Chrome first, Posts API later.
 * To activate: add package + publish agents (see ../youtube), list them in agents/steps, set status 'active'.
 */
export const linkedin: PlatformModule = {
  id: 'linkedin', name: 'LinkedIn', status: 'planned', route: 'browser', agents: [], steps: [],
  notes: "Professional educational post with a short clip or graphic. Route: owner's Chrome first, Posts API later.",
};

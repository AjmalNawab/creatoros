import type { PlatformModule } from '..';
import { facebookPackage } from './package';
import { facebookPublish } from './publish';

/**
 * Facebook agent: ACTIVE. Page "Chai & Curiosity" (mixed English/Urdu content).
 * package → owner approves exact package → publish (browser route via owner's Chrome / DevTools).
 * Shorts (9:16) post as Reels; long videos as Page video posts.
 */
export const facebook: PlatformModule = {
  id: 'facebook', name: 'Facebook', status: 'active', route: 'browser',
  agents: [facebookPackage, facebookPublish],
  steps: [
    { key: 'facebook_package', agentId: 'facebook.package', type: 'facebook_package', dependsOn: ['qa'] },
    { key: 'facebook_publish', agentId: 'facebook.publish', type: 'facebook_publish', dependsOn: ['facebook_package'] },
  ],
  notes: "Page \"Chai & Curiosity\": Reels (9:16) and video posts with caption. Route: owner's Chrome now, Graph API later.",
};

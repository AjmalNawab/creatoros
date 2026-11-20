import type { PlatformModule } from '..';
import { youtubePackage } from './package';
import { youtubePublish } from './publish';

/**
 * YouTube agent: ACTIVE.
 * package → owner approves exact package → publish (browser route via owner's Chrome / DevTools).
 */
export const youtube: PlatformModule = {
  id: 'youtube', name: 'YouTube', status: 'active', route: 'browser',
  agents: [youtubePackage, youtubePublish],
  steps: [
    { key: 'youtube_package', agentId: 'youtube.package', type: 'youtube_package', dependsOn: ['qa'] },
    { key: 'youtube_publish', agentId: 'youtube.publish', type: 'youtube_publish', dependsOn: ['youtube_package'] },
  ],
  notes: '16:9 long-form upload with title, description + chapters, tags, thumbnail. Route: owner\'s Chrome now, YouTube Data API after verification.',
};

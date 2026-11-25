import type { PlatformModule } from '..';
import { tiktokPackage } from './package';
import { tiktokPublish } from './publish';

/**
 * TikTok agent: ACTIVE. Separate anonymous account "Chai & Curiosity" (TIKTOK_HANDLE in .env).
 * package → owner approves exact package → publish (owner's Chrome via DevTools; API posts stay private until audit).
 * Vertical (9:16) videos only.
 */
export const tiktok: PlatformModule = {
  id: 'tiktok', name: 'TikTok', status: 'active', route: 'browser',
  agents: [tiktokPackage, tiktokPublish],
  steps: [
    { key: 'tiktok_package', agentId: 'tiktok.package', type: 'tiktok_package', dependsOn: ['qa'] },
    { key: 'tiktok_publish', agentId: 'tiktok.publish', type: 'tiktok_publish', dependsOn: ['tiktok_package'] },
  ],
  notes: "Anonymous account \"Chai & Curiosity\": vertical videos, caption + hashtags, AI-content label on. Route: owner's Chrome.",
};

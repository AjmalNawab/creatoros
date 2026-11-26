import type { AgentDefinition } from '@creatoros/core';
import type { WorkflowStep } from '../main/orchestrator';
import { youtube } from './youtube';
import { facebook } from './facebook';
import { instagram } from './instagram';
import { tiktok } from './tiktok';
import { linkedin } from './linkedin';
import { snapchat } from './snapchat';

export type PlatformId = 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'snapchat' | 'linkedin';

/** Each platform is an independent module: its own agents, workflow steps and publishing route. */
export interface PlatformModule {
  id: PlatformId;
  name: string;
  status: 'active' | 'planned';
  /** Publishing route now. browser = owner's Chrome via DevTools (operator), api = official API. */
  route: 'browser' | 'api';
  agents: AgentDefinition[];
  /** Steps appended after production; the first step depends on 'qa' (final video approved). */
  steps: WorkflowStep[];
  notes: string;
}

export const PLATFORMS: Record<PlatformId, PlatformModule> = { youtube, facebook, instagram, tiktok, snapchat, linkedin };
export const PLATFORM_AGENTS = Object.values(PLATFORMS).flatMap((p) => p.agents);

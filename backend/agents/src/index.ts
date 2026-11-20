import { MAIN_AGENT } from './main/agent';
import { PRODUCTION_AGENTS } from './production';
import { PLATFORM_AGENTS } from './platforms';

export * from './main/orchestrator';
export { MAIN_AGENT } from './main/agent';
export { PRODUCTION_AGENTS } from './production';
export { PLATFORMS, PLATFORM_AGENTS, type PlatformId, type PlatformModule } from './platforms';

/** Every agent the worker registers: Main → Production → Platforms. */
export const ALL_AGENTS = [MAIN_AGENT, ...PRODUCTION_AGENTS, ...PLATFORM_AGENTS];

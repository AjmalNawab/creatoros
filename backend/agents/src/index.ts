import { MAIN_AGENT } from './main/agent';
import { PRODUCTION_AGENTS } from './production';
import { PLATFORM_AGENTS } from './platforms';
import { STRATEGY_AGENTS } from './strategy';

export * from './main/orchestrator';
export { MAIN_AGENT } from './main/agent';
export { PRODUCTION_AGENTS } from './production';
export * from './strategy';
export { PLATFORMS, PLATFORM_AGENTS, type PlatformId, type PlatformModule } from './platforms';

/** Every agent the worker registers: Main → Strategy → Production → Platforms. */
export const ALL_AGENTS = [MAIN_AGENT, ...STRATEGY_AGENTS, ...PRODUCTION_AGENTS, ...PLATFORM_AGENTS];

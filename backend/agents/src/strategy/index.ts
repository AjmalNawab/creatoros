// Strategy department: decides WHAT to make before anything is produced.
import { trends } from './trends';
import { ideas } from './ideas';

export const STRATEGY_AGENTS = [trends, ideas];
export { DEFAULT_BRAND, getDefaultBrand, profileOf, type BrandProfile } from './brand';

// Strategy department: decides WHAT to make before anything is produced.
import { trends } from './trends';
import { ideas } from './ideas';

export const STRATEGY_AGENTS = [trends, ideas];
export { BRANDS, DEFAULT_BRAND, brandForProject, ensureBrands, getDefaultBrand, profileOf, setActiveBrand, type BrandProfile } from './brand';

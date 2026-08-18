import {VARIANTS as BASE_VARIANTS} from './variants.js';
import {STAGE12_VARIANTS} from './variantsStage12.js';
import {STAGE13_VARIANTS} from './variantsStage13.js';

export const VARIANTS=[...BASE_VARIANTS,...STAGE12_VARIANTS,...STAGE13_VARIANTS];
export const variantById=id=>VARIANTS.find(v=>v.variantId===id)||null;
export const variantsForFamily=familyId=>VARIANTS.filter(v=>v.familyId===familyId);

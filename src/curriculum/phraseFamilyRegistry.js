import {PHRASE_FAMILIES as BASE_PHRASE_FAMILIES} from './phraseFamilies.js';
import {STAGE13_PHRASE_FAMILIES} from './phraseFamiliesStage13.js';

export const PHRASE_FAMILIES=[...BASE_PHRASE_FAMILIES,...STAGE13_PHRASE_FAMILIES];
export const familyById=id=>PHRASE_FAMILIES.find(f=>f.familyId===id)||null;
export const familiesForStage=stage=>PHRASE_FAMILIES.filter(f=>f.stage===Number(stage));
export const familiesThroughStage=stage=>PHRASE_FAMILIES.filter(f=>f.stage<=Number(stage));

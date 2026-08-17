import {STAGES} from './src/curriculum/stages.js';
import {familyById,familiesForStage} from './src/curriculum/phraseFamilyRegistry.js';
import {STAGE13_VARIANTS,stage13VariantById} from './src/curriculum/variantsStage13.js';
import {VARIANTS,variantById} from './src/curriculum/variantRegistry.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {isFamilyMastered} from './src/curriculum/mastery.js';
import {flagCountForDuration} from './src/notation.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const sounding=v=>v.notes.filter(n=>!n.rest);
const pitches=id=>sounding(variantById(id)).map(n=>n.pitch);
const endBeat=id=>Math.max(...variantById(id).notes.map(n=>n.startBeat+n.duration));

assert(validateCurriculum(),'Stage 13 aggregate curriculum validates');
const stage=STAGES.find(s=>s.stage===13),family=familyById('density-g-to-f');
assert(stage?.id==='density-double-time'&&stage.title==='Density / Double Time','Stage 13 roadmap entry');
assert(stage.unlock.difficultyAxis==='density'&&stage.unlock.bpmPolicy==='hold','tempo and density remain independent difficulty axes');
assert(stage.unlock.rhythm.includes('16th'),'Stage 13 unlocks sixteenth-note surface notation');
assert(familiesForStage(13).length===1&&familiesForStage(13)[0].familyId===family.familyId,'Stage 13 runtime registry exposes its Phrase Family');

assert(family.invariant.includes('G→F')&&family.invariant.includes('density'),'known G→F movement is the explicit invariant');
assert(family.source.hamaseRef==='ex.267'&&family.source.sourcePages.join(',')==='232,233','ex.267/ex.268 prepared-page traceability');
assert(family.source.adaptation&&/No Parker surface is copied/.test(family.source.adaptation),'source adaptation is explicit');
assert(family.variants.join(',')==='density-gf-seed,density-gf-arpeggio,density-gf-scalar,density-gf-chromatic,density-gf-double','density ladder order is explicit');

const densityCounts=family.variants.map(id=>sounding(variantById(id)).length);
assert(densityCounts.join(',')==='2,4,6,8,16','density rises 2 → 4 → 6 → 8 → 16 notes inside the same phrase window');
for(const id of family.variants){
 const v=variantById(id),ps=pitches(id);
 assert(ps[0]==='G4'&&ps.at(-1)==='F4',`${id}: G→F endpoints survive`);
 assert(endBeat(id)===4,`${id}: density changes inside the same four-beat window`);
 assert(v.allowedHarmony.length===1&&v.allowedHarmony[0]==='G7',`${id}: same harmonic context is held while density changes`);
 assert(!('harmonyFieldId' in v)&&!('harmonyTimeline' in v)&&!('tonalFieldId' in v),`${id}: Variant remains separate from Event context`);
}
assert(STAGE13_VARIANTS.every((v,i)=>v.densityLevel===i),'densityLevel increases monotonically');
assert(stage13VariantById('density-gf-arpeggio').surfaceType==='ARPEGGIATE','arpeggio stage');
assert(stage13VariantById('density-gf-scalar').surfaceType==='SCALARIZE','scalarization stage');
assert(stage13VariantById('density-gf-chromatic').surfaceType==='CHROMATICIZE','chromaticization stage');
const double=stage13VariantById('density-gf-double');
assert(double.surfaceType==='RHYTHMIC_COMPRESSION'&&double.notes.every(n=>n.duration===.25),'final surface compresses rhythm to sixteenths');
assert(flagCountForDuration(.25)===2&&flagCountForDuration(.5)===1&&flagCountForDuration(1)===0,'ordinary notation renderer distinguishes 16th/eighth/quarter flags');
assert(STAGE13_VARIANTS.slice(1).every(v=>v.morphType==='DENSIFY'),'growth uses DENSIFY rather than inventing a new phrase category');
assert(VARIANTS.filter(v=>v.familyId==='density-g-to-f').length===5,'aggregate Variant registry exposes all Stage 13 variants');

const plan=buildDailySessionPlan({currentStage:13,bpm:60,eventCount:20,targetSessionBeats:320});
assert(plan.bpm===60,'Stage 13 density growth does not silently raise BPM');
assert(plan.focusFamilyIds.includes('density-g-to-f'),'Scheduler selects the Stage 13 family');
const events=plan.events.filter(e=>e.familyId==='density-g-to-f');
assert(events.length>=5,'Session can traverse the full density ladder');
const byVariant=new Map(events.map(e=>[e.variantId,e]));
for(const id of family.variants)assert(byVariant.has(id),`Scheduler reaches ${id}`);
assert(events.some(e=>e.variantId==='density-gf-arpeggio'&&e.presentationMode==='BUILD'&&e.morphPolicy==='DENSIFY'),'first density expansion is experienced as BUILD morph');
assert(events.some(e=>e.variantId==='density-gf-double'&&e.scoreModel.notes.length===16),'double-time event materializes all sixteen notes');
assert(events.every(e=>e.scoreModel.totalBeats===4),'all Stage 13 score models keep the same four-beat window');
assert(events.every(e=>!('cellQuestion' in e)&&!('doubleTimeDefinition' in e)&&!('analysisPrompt' in e)),'theory naming never becomes a learner task');

const masteredRecord={reading:.9,coldRead:.9,coldReadAttempts:5,coldVariantIds:[...family.variants],coldHarmonyFieldIds:['static-g7'],coldVariantHarmonyKeys:[],attempts:5};
assert(isFamilyMastered(masteredRecord,family.familyId),'full scaffold-free density coverage can master the family');
const missingDouble={...masteredRecord,coldVariantIds:family.variants.slice(0,-1)};
assert(!isFamilyMastered(missingDouble,family.familyId),'mastery cannot skip the densest cold-read surface');

console.log('OK: Stage 13 raises density on the known G→F movement at fixed BPM and preserves ordinary sight-reading');

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
const endBeat=id=>Math.max(...variantById(id).notes.map(n=>n.startBeat+n.duration));
const structuralPitches=id=>{const v=variantById(id);return (v.structuralTargetIndices||[]).map(i=>v.notes[i]?.pitch)};
const indexedPitches=(v,indices)=>(indices||[]).map(i=>v.notes[i]?.pitch);

assert(validateCurriculum(),'Stage 13 aggregate curriculum validates');
const stage=STAGES.find(s=>s.stage===13),family=familyById('density-g-to-f');
assert(stage?.id==='density-double-time'&&stage.title==='Density / Double Time','Stage 13 roadmap entry');
assert(stage.unlock.difficultyAxis==='density'&&stage.unlock.bpmPolicy==='hold','tempo and density remain independent difficulty axes');
assert(stage.unlock.rhythm.includes('16th'),'Stage 13 unlocks sixteenth-note surface notation');
assert(familiesForStage(13).length===1&&familiesForStage(13)[0].familyId===family.familyId,'Stage 13 runtime registry exposes its Phrase Family');

assert(family.invariant.includes('structural G→F')&&family.invariant.includes('density')&&family.invariant.includes('continuation'),'known G→F structural cell is the explicit invariant');
assert(family.structuralTargets.join(',')==='G,F','Stage 13 family declares structural targets separately from surface boundaries');
assert(family.source.hamaseRef==='ex.267'&&family.source.sourcePages.join(',')==='232,233','ex.267/ex.268 prepared-page traceability');
assert(family.source.operatorSources.map(x=>`${x.hamaseRef}:${x.role}`).join(',')==='ex.267:DENSITY_EXPANSION,ex.268:CELL_RESTART_EXTENSION','source operators are distinguished');
assert(/Gm7b5/.test(family.source.operatorSources[0].sourceHarmony)&&/Eb7/.test(family.source.operatorSources[0].sourceHarmony),'ex.267 source harmony remains explicit');
assert(/G7/.test(family.source.pedagogicalApplication)&&/not a transcription/.test(family.source.pedagogicalApplication),'G7 material is declared as pedagogical application rather than source simplification');
assert(family.variants.join(',')==='density-gf-seed,density-gf-arpeggio,density-gf-scalar,density-gf-chromatic,density-gf-double,density-gf-restart','density ladder and restart extension are explicit');

// ex.267-style local densification: fixed four-beat span is a scaffold for this operator, not the Stage-wide invariant.
const densityIds=family.variants.slice(0,5);
const densityCounts=densityIds.map(id=>sounding(variantById(id)).length);
assert(densityCounts.join(',')==='2,4,6,8,16','density expansion rises 2 → 4 → 6 → 8 → 16 notes');
for(const id of densityIds){
 const v=variantById(id);
 assert(structuralPitches(id).join(',')==='G4,F4',`${id}: structural G→F targets survive`);
 assert(v.operationType==='DENSITY_EXPANSION',`${id}: ex.267-style operation is density expansion`);
 assert(endBeat(id)===4,`${id}: this local density scaffold stays inside four beats`);
 assert(v.source.hamaseRef==='ex.267'&&v.source.operatorSource.role==='DENSITY_EXPANSION',`${id}: source provenance is ex.267 operator`);
 assert(v.allowedHarmony.length===1&&v.allowedHarmony[0]==='G7',`${id}: pedagogical G7 context is held while density changes`);
 assert(!('harmonyFieldId' in v)&&!('harmonyTimeline' in v)&&!('tonalFieldId' in v),`${id}: Variant remains separate from Event context`);
}
assert(densityIds.map(id=>stage13VariantById(id).densityLevel).join(',')==='0,1,2,3,4','densityLevel increases only across the density ladder');
assert(stage13VariantById('density-gf-arpeggio').surfaceType==='ARPEGGIATE','arpeggio stage');
assert(stage13VariantById('density-gf-scalar').surfaceType==='SCALARIZE','scalarization stage');
assert(stage13VariantById('density-gf-chromatic').surfaceType==='CHROMATICIZE','chromaticization stage');
const double=stage13VariantById('density-gf-double');
assert(double.surfaceType==='RHYTHMIC_COMPRESSION'&&double.notes.every(n=>n.duration===.25),'final within-span density surface compresses rhythm to sixteenths');
assert(double.notes.slice(0,8).map(n=>n.pitch).join(',')!==double.notes.slice(8).map(n=>n.pitch).join(','),'rhythmic compression is not implemented as a blind concat of the same eight-note surface');
assert(flagCountForDuration(.25)===2&&flagCountForDuration(.5)===1&&flagCountForDuration(1)===0,'ordinary notation renderer distinguishes 16th/eighth/quarter flags');
assert(STAGE13_VARIANTS.slice(1,5).every(v=>v.morphType==='DENSIFY'),'within-span growth uses DENSIFY');

// ex.268-style phrase extension: a structural exit is followed by new entry material and the same cell restarts.
const restart=stage13VariantById('density-gf-restart');
assert(restart.phase==='EXTEND'&&restart.morphType==='EXTEND','restart is modeled as phrase extension rather than more within-span density');
assert(restart.operationType==='CELL_RESTART_EXTENSION'&&restart.surfaceType==='CELL_RESTART','restart operator is explicit');
assert(restart.source.hamaseRef==='ex.268'&&restart.source.sourcePage===233&&restart.source.operatorSource.role==='CELL_RESTART_EXTENSION','restart provenance is ex.268 p233');
assert(endBeat('density-gf-restart')===8,'restart extension is allowed to exceed the four-beat density scaffold');
assert(structuralPitches('density-gf-restart').join(',')==='G4,F4,G4,F4','restart preserves two successive structural G→F cells');
assert(restart.structuralTargetIndices.join(',')==='0,5,8,15','structural targets are declared inside the surface rather than inferred from endpoints');
assert(indexedPitches(restart,restart.restartEntryIndices).join(',')==='A4,F#4','A–F# is the pedagogical double-appoggiatura restart entry');
assert(restart.structuralTargetIndices[1] < restart.restartEntryIndices[0] && restart.restartEntryIndices.at(-1) < restart.structuralTargetIndices[2],'first structural F exits into entry material before the restarted G');
assert(restart.notes[restart.structuralTargetIndices[1]].pitch==='F4'&&restart.notes[restart.structuralTargetIndices[1]+1].pitch==='A4','the first structural F is not a surface phrase endpoint');
assert(/reinterpreted/.test(restart.continuationRole)&&/restarted/.test(restart.continuationRole),'continuation semantics record exit→entry reinterpretation');
assert(restart.allowedHarmony.join(',')==='G7','restart remains a declared G7 pedagogical application, not ex.268 source harmony');

assert(VARIANTS.filter(v=>v.familyId==='density-g-to-f').length===6,'aggregate Variant registry exposes density ladder plus restart extension');

const plan=buildDailySessionPlan({currentStage:13,bpm:60,eventCount:20,targetSessionBeats:320});
assert(plan.bpm===60,'Stage 13 transformations do not silently raise BPM');
assert(plan.focusFamilyIds.includes('density-g-to-f'),'Scheduler selects the Stage 13 family');
const events=plan.events.filter(e=>e.familyId==='density-g-to-f');
assert(events.length>=6,'Session can traverse density ladder and restart extension');
const byVariant=new Map(events.map(e=>[e.variantId,e]));
for(const id of family.variants)assert(byVariant.has(id),`Scheduler reaches ${id}`);
assert(events.some(e=>e.variantId==='density-gf-arpeggio'&&e.presentationMode==='BUILD'&&e.morphPolicy==='DENSIFY'),'first density expansion is experienced as BUILD morph');
assert(events.some(e=>e.variantId==='density-gf-double'&&e.scoreModel.notes.length===16&&e.scoreModel.totalBeats===4),'within-span double-time event materializes sixteen notes in four beats');
assert(events.some(e=>e.variantId==='density-gf-restart'&&e.presentationMode==='BUILD'&&e.morphPolicy==='EXTEND'&&e.scoreModel.totalBeats===8),'restart event materializes an eight-beat phrase extension');
assert(events.every(e=>!('cellQuestion' in e)&&!('doubleTimeDefinition' in e)&&!('analysisPrompt' in e)),'theory naming never becomes a learner task');

const masteredRecord={reading:.9,coldRead:.9,coldReadAttempts:6,coldVariantIds:[...family.variants],coldHarmonyFieldIds:['static-g7'],coldVariantHarmonyKeys:[],attempts:6};
assert(isFamilyMastered(masteredRecord,family.familyId),'full scaffold-free operator coverage can master the family');
const missingRestart={...masteredRecord,coldVariantIds:family.variants.slice(0,-1)};
assert(!isFamilyMastered(missingRestart,family.familyId),'mastery cannot skip the restart-extension surface');

console.log('OK: Stage 13 preserves structural G→F identity across distinct density-expansion and cell-restart operators at fixed BPM');

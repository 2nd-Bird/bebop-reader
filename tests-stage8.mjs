import {STAGES} from './src/curriculum/stages.js';
import {familyById} from './src/curriculum/phraseFamilies.js';
import {variantById} from './src/curriculum/variants.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const pitches=id=>variantById(id).notes.filter(n=>!n.rest).map(n=>n.pitch);
const structuralPitches=id=>{const v=variantById(id);return (v.structuralTargetIndices||[]).map(i=>v.notes[i]?.pitch)};
const durations=id=>variantById(id).notes.map(n=>n.duration);
const endBeat=id=>Math.max(...variantById(id).notes.map(n=>n.startBeat+n.duration));

const stage8=STAGES.find(s=>s.stage===8);
assert(stage8?.id==='ornament-direction','Stage 8 Ornament as Direction exists');
for(const operator of ['passing','neighbor','appoggiatura','turn','chromatic-approach'])assert(stage8.unlock.transform.includes(operator),`Stage 8 unlocks ${operator}`);
assert(stage8.unlock.notes.includes('F#4'),'Stage 8 explicitly unlocks F#4 used by the chromatic approach');
assert(!stage8.unlock.notes.includes('C#4')&&!stage8.unlock.notes.includes('D#4'),'Stage 8 does not pre-unlock unused chromatic notes');

const ge=familyById('ornament-to-mi');
assert(ge?.invariant==='structural G→E target relation','G→E structural target relation is the Stage 8 invariant');
assert(ge.structuralTargets.join(',')==='G,E','Stage 8 family declares its structural targets');
assert(ge.source.hamaseRefs.join(',')==='ex.001,ex.008,ex.019,ex.043,ex.162','Stage 8 G→E source examples include pre-target double appoggiatura evidence');
assert(ge.source.sourcePages.join(',')==='21,24,28,38,131','Stage 8 G→E source pages');
assert(ge.source.adaptation,'Hamase-derived Stage 8 material declares pedagogical adaptation');
assert(ge.variants.join(',')==='ge-orn-seed,ge-orn-passing,ge-orn-appoggiatura,ge-orn-neighbor,ge-orn-chromatic,ge-orn-pretarget','Stage 8 variants follow parent growth order');

for(const id of ge.variants){
  const v=variantById(id);
  assert(structuralPitches(id).join(',')==='G4,E4',`${id} preserves structural G→E targets`);
  assert(v.entryRole&&v.exitRole,`${id} declares surface/structural boundary roles`);
  assert(v.allowedHarmony.join(',')==='C',`${id} keeps source analysis out of sounding harmony`);
}
assert([...ge.variants].every(id=>endBeat(id)===4),'current G→E Stage 8 examples fit the Training 4 scaffold');

assert(variantById('ge-orn-passing').ornamentType==='PASSING','passing metadata');
assert(variantById('ge-orn-appoggiatura').ornamentType==='APPOGGIATURA','appoggiatura metadata');
assert(variantById('ge-orn-neighbor').ornamentType==='NEIGHBOR','neighbor metadata');
assert(variantById('ge-orn-chromatic').ornamentType==='CHROMATIC_APPROACH','chromatic approach metadata');
assert(pitches('ge-orn-passing').join(',')===pitches('ge-orn-appoggiatura').join(','),'passing and appoggiatura can share pitch route');
assert(durations('ge-orn-passing').join(',')!==durations('ge-orn-appoggiatura').join(','),'passing and appoggiatura differ by time placement, not theory quiz labels');
assert(pitches('ge-orn-chromatic').join(',')==='G4,F#4,G4,F4,E4','chromatic approach remains embedded in structural G→E direction');

const pretarget=variantById('ge-orn-pretarget');
assert(pretarget.source.hamaseRef==='ex.043'&&pretarget.source.sourcePage===38,'pre-target boundary source is ex.043 p38');
assert(pitches('ge-orn-pretarget').join(',')==='A4,F#4,G4,F4,E4','pre-target double appoggiatura precedes known G→E movement');
assert(pretarget.structuralTargetIndices.join(',')==='2,4','surface notes before G are not structural targets');
assert(pretarget.notes[0].pitch==='A4'&&pretarget.notes[pretarget.structuralTargetIndices[0]].pitch==='G4','surface entry differs from first structural target');
assert(pretarget.entryRole==='pre-target-double-appoggiatura','pre-target entry role is explicit');

const turn=familyById('turn-to-do');
assert(turn?.invariant==='C structural target','turn family keeps structural C as invariant');
assert(turn.structuralTargets.join(',')==='C','turn family declares C target');
assert(turn.source.hamaseRef==='ex.032','turn source is ex.032');
assert(turn.source.sourcePages.join(',')==='34,131','turn cross-reference pages');
assert(turn.source.adaptation,'turn is marked as pedagogical adaptation');
const turnGrow=variantById('turn-do-grow');
assert(pitches('turn-do-grow').join(',')==='D4,C4,B3,C4','C turn is D-C-B-C');
assert(turnGrow.ornamentType==='TURN','turn metadata');
assert(turnGrow.parentVariant==='turn-do-seed','turn grows from direct D→C target');
assert(turnGrow.structuralTargetIndices.join(',')==='1'&&turnGrow.notes[1].pitch==='C4','the first C is the structural target even though the surface continues');
assert(turnGrow.continuationRole&&turnGrow.exitRole==='turn-completion','post-target turn continuation is explicit');
assert(turn.variants.every(id=>variantById(id).allowedHarmony.join(',')==='C'),'turn theory does not create extra sounding harmony');
assert(turn.variants.every(id=>endBeat(id)===4),'current turn examples fit the Training 4 scaffold');

const forbiddenTitleTerms=['ornament','passing','neighbor','appoggiatura','turn','chromatic','surface','cell'];
for(const family of [ge,turn]){
  const title=family.title.toLowerCase();
  for(const term of forbiddenTitleTerms)assert(!title.includes(term),`${family.familyId} title leaks internal theory term ${term}`);
}
assert(ge.title==='G → E · Different Routes','G→E family uses an experiential label');
assert(turn.title==='Back to DO','C-return family uses an experiential label');

const plan=buildDailySessionPlan({currentStage:8,eventCount:20});
assert(plan.focusFamilyIds.join(',')==='ornament-to-mi,turn-to-do','Stage 8 session focuses both target-directed families');
for(const id of ['ge-orn-passing','ge-orn-appoggiatura','ge-orn-neighbor','ge-orn-chromatic','ge-orn-pretarget','turn-do-grow'])assert(plan.events.some(e=>e.variantId===id&&e.presentationMode==='BUILD'),`${id} appears as BUILD before later reading`);
assert(plan.events.filter(e=>['ornament-to-mi','turn-to-do'].includes(e.familyId)).every(e=>e.harmonyFieldId==='static-c'),'Stage 8 keeps a neutral C field while ornament direction is learned');
assert(plan.events.every(e=>!('theoryPrompt' in e)&&!('ornamentQuestion' in e)),'Learning Events do not turn ornament names into user tasks');

console.log('OK: Stage 8 preserves declared structural targets while ornament surfaces may begin before or continue beyond those targets');

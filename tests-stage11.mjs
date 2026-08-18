import {STAGES} from './src/curriculum/stages.js';
import {familyById} from './src/curriculum/phraseFamilies.js';
import {variantById,VARIANTS} from './src/curriculum/variants.js';
import {harmonyFieldById} from './src/curriculum/harmonyFields.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,isFamilyMastered} from './src/curriculum/mastery.js';
import {diatonicStep} from './src/notation/layout.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitches=id=>variantById(id).notes.filter(n=>!n.rest).map(n=>n.pitch);
const diff=(a,b)=>a.map((x,i)=>x===b[i]?null:i).filter(i=>i!==null);

assert(validateCurriculum(),'Stage 11 curriculum validates');
const stage=STAGES.find(s=>s.stage===11),shape=familyById('relative-minor-shape'),line=familyById('relative-minor-line');
assert(stage?.id==='relative-minor'&&stage.title==='Relative Minor','Stage 11 roadmap entry');
assert(stage.field==='phrase-8','Stage 11 stays in Phrase 8 world');
assert(stage.unlock.transform.includes('major-to-minor-one-note-change')&&stage.unlock.transform.includes('keep-line-through-mode-change'),'Stage 11 is transformation, not a new scale list');
assert(stage.unlock.notes.includes('Ab3')&&stage.unlock.notes.includes('Ab4'),'Relative Minor unlocks flats only when needed by the transformation');
assert(!stage.unlock.notes.includes('Eb4'),'Stage 11 does not front-load the whole minor collection');

assert(shape?.invariant==='F–B–D remain fixed at the Major→Minor pivot; only A→Ab changes','shape invariant is explicit');
assert(shape.source.hamaseRefs.join(',')==='ex.190,ex.191'&&shape.source.sourcePages.join(',')==='149,150','shape source traceability uses prepared pages 149–150');
assert(shape.source.adaptation,'shape declares pedagogical adaptation');
assert(shape.contextSequence.map(x=>`${x.variantId}@${x.harmonyFieldId}`).join(',')==='rmin-f6@static-f,rmin-f6-flat5@static-f,rmin-fm6-flat5@static-fm,rmin-fm6@static-fm','shape grows Major→flat5→Minor pivot→Minor6');
assert(shape.requiredColdVariantHarmonyKeys.length===4,'shape mastery requires every scaffold-free context');

const f6=pitches('rmin-f6'),f6b5=pitches('rmin-f6-flat5'),fm6b5=pitches('rmin-fm6-flat5'),fm6=pitches('rmin-fm6');
assert(f6.join(',')==='F4,A4,C5,D5','Stage 11 starts from familiar F6-like shape');
assert(f6b5.join(',')==='F4,A4,B4,D5'&&diff(f6,f6b5).join(',')==='2','known flat-fifth operator changes C→B only');
assert(fm6b5.join(',')==='F4,Ab4,B4,D5'&&diff(f6b5,fm6b5).join(',')==='1','Major→Minor pivot changes A→Ab only');
assert(fm6.join(',')==='F4,Ab4,C5,D5'&&diff(fm6b5,fm6).join(',')==='2','Minor shape can release the flat-fifth with one note');
assert(variantById('rmin-fm6-flat5').morphTargets.join(',')==='1','Phrase Morph highlights only the Major→Minor note');
assert(diatonicStep('A4')===diatonicStep('Ab4'),'flat accidental stays on the same staff position');
assert(variantById('rmin-fm6-flat5').notes[1].midi===68,'Ab4 scoring target is chromatically correct');
assert(harmonyFieldById('static-f').timeline[0].chord==='F'&&harmonyFieldById('static-fm').timeline[0].chord==='Fm','ordinary F→Fm background carries the user-facing mode change');

assert(line?.invariant==='F–E–D–C–B descent is unchanged; only the final destination A→Ab moves','line invariant is explicit');
assert(line.source.hamaseRef==='ex.191'&&line.source.sourcePages.join(',')==='149,150','line source traceability');
assert(line.source.adaptation,'line declares short ordinary-notation reduction');
const majorLine=pitches('rmin-line-major'),minorLine=pitches('rmin-line-minor');
assert(majorLine.join(',')==='F4,E4,D4,C4,B3,A3','Major-side descending line');
assert(minorLine.join(',')==='F4,E4,D4,C4,B3,Ab3','Relative Minor connection preserves direction and lowers only endpoint');
assert(diff(majorLine,minorLine).join(',')==='5','line changes exactly one visible pitch');
assert(variantById('rmin-line-minor').morphTargets.join(',')==='5','Morph points only to A→Ab endpoint');
assert(variantById('rmin-line-minor').notes.at(-1).midi===56,'Ab3 scoring target');
assert(line.contextSequence.map(x=>x.harmonyFieldId).join(',')==='static-g7,static-g7-relative-minor','internal Major→Minor context changes while visible baseline remains G7');
assert(harmonyFieldById('static-g7').timeline[0].chord==='G7'&&harmonyFieldById('static-g7-relative-minor').timeline[0].chord==='G7','learner is not forced to decode an altered-dominant theory label');

const plan=buildDailySessionPlan({currentStage:11,eventCount:20,targetSessionBeats:320});
assert(plan.focusFamilyIds.join(',')==='relative-minor-shape,relative-minor-line','Stage 11 focuses both Major→Minor experiences');
const shapeEvents=plan.events.filter(e=>e.familyId===shape.familyId),lineEvents=plan.events.filter(e=>e.familyId===line.familyId);
assert(shapeEvents[0].variantId==='rmin-f6'&&shapeEvents[0].harmonyFieldId==='static-f'&&shapeEvents[0].presentationMode==='TEACHER_CALL','shape starts from familiar Major context');
assert(shapeEvents.some(e=>e.variantId==='rmin-fm6-flat5'&&e.harmonyFieldId==='static-fm'&&e.morph?.type==='CHANGE'),'A→Ab Major→Minor pivot appears as one-note BUILD');
assert(lineEvents[0].variantId==='rmin-line-major'&&lineEvents[0].harmonyFieldId==='static-g7','line establishes Major-side descent');
assert(lineEvents.some(e=>e.variantId==='rmin-line-minor'&&e.harmonyFieldId==='static-g7-relative-minor'&&e.morph?.type==='CHANGE'),'line crosses into Relative Minor without stopping or changing task type');
assert(plan.events.every(e=>!('theoryPrompt' in e)&&!('relativeMinorQuestion' in e)&&!('scaleQuestion' in e)),'Relative Minor remains internal curriculum grammar');
assert(VARIANTS.filter(v=>['relative-minor-shape','relative-minor-line'].includes(v.familyId)).every(v=>!('harmonyFieldId' in v)&&!('harmonyTimeline' in v)),'Stage 11 keeps Variant and Harmony separate');

let shapeMastery=emptyFamilyMastery();
const coldShape=(variantId,harmonyFieldId,time)=>{shapeMastery=applyEventResult(shapeMastery,{familyId:shape.familyId,variantId,harmonyFieldId,presentationMode:'COLD_READ'},{readScore:95,stars:5},time);};
coldShape('rmin-f6','static-f',1000);coldShape('rmin-f6-flat5','static-f',2000);coldShape('rmin-fm6','static-fm',3000);
assert(!isFamilyMastered(shapeMastery,shape.familyId),'Minor mastery cannot skip the A→Ab pivot Variant');
coldShape('rmin-fm6-flat5','static-fm',4000);
assert(isFamilyMastered(shapeMastery,shape.familyId),'shape mastery requires Major, pivot and Minor cold coverage');

let lineMastery=emptyFamilyMastery();
lineMastery=applyEventResult(lineMastery,{familyId:line.familyId,variantId:'rmin-line-major',harmonyFieldId:'static-g7',presentationMode:'COLD_READ'},{readScore:95,stars:5},1000);
assert(!isFamilyMastered(lineMastery,line.familyId),'Major-side line alone cannot master Relative Minor transfer');
lineMastery=applyEventResult(lineMastery,{familyId:line.familyId,variantId:'rmin-line-minor',harmonyFieldId:'static-g7-relative-minor',presentationMode:'COLD_READ'},{readScore:95,stars:5},2000);
assert(isFamilyMastered(lineMastery,line.familyId),'line mastery requires both sides of the Major→Minor connection');

console.log('OK: Stage 11 changes Major→Minor by one voice while ordinary notation and the descending line remain continuous');

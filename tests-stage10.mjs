import {STAGES} from './src/curriculum/stages.js';
import {familyById} from './src/curriculum/phraseFamilies.js';
import {variantById,VARIANTS} from './src/curriculum/variants.js';
import {harmonyFieldById} from './src/curriculum/harmonyFields.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,isFamilyMastered} from './src/curriculum/mastery.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitches=id=>variantById(id).notes.filter(n=>!n.rest).map(n=>n.pitch);
const endBeat=id=>Math.max(...variantById(id).notes.map(n=>n.startBeat+n.duration));

assert(validateCurriculum(),'Stage 10 curriculum validates with context-managed harmony');
const stage=STAGES.find(s=>s.stage===10),family=familyById('relative-major-reinterpret');
assert(stage?.id==='relative-major'&&stage.title==='Relative Major','Stage 10 roadmap entry');
assert(stage.field==='phrase-8','Stage 10 remains in the expanded Phrase 8 world');
assert(stage.unlock.harmony.join(',')==='F,G7','Stage 10 contrasts familiar F with dominant G7');
assert(stage.unlock.transform.includes('harmonic-reinterpretation')&&stage.unlock.transform.includes('flat-fifth-one-note-change'),'Stage 10 unlocks reinterpretation then one-note CHANGE');
assert(stage.unlock.notes.includes('E5'),'Stage 10 explicitly unlocks the register used by FMaj7 growth');

assert(family?.title==='Same Shape · New Background','learner-facing family avoids theory quiz wording');
assert(family.invariant==='F–A–C shape remains unchanged across F → G7 context transfer','Stage 10 invariant is explicit');
assert(family.source.hamaseRefs.join(',')==='ex.118,ex.122,ex.124,ex.129','Relative Major source chain');
assert(family.source.sourcePages.join(',')==='90,92,93,98','prepared source page traceability');
assert(family.source.adaptation,'Hamase-derived Stage 10 declares pedagogical reduction');
assert(family.contextSequence.map(x=>`${x.variantId}@${x.harmonyFieldId}`).join(',')==='rm-f-triad@static-f,rm-f-triad@static-g7,rm-fmaj7@static-g7,rm-fmaj7-flat5@static-g7','same Variant is explicitly reused across harmony contexts');
assert(family.requiredColdVariantHarmonyKeys.length===4,'mastery requires all Variant × Harmony cold contexts');

const triad=variantById('rm-f-triad'),maj7=variantById('rm-fmaj7'),flat5=variantById('rm-fmaj7-flat5');
assert(pitches('rm-f-triad').join(',')==='F4,A4,C5','familiar major-triad shape');
assert(endBeat('rm-f-triad')===4,'triad is an ordinary four-beat phrase');
assert(triad.allowedHarmony.join(',')==='F,G7','one notation Variant permits both contexts');
assert(pitches('rm-fmaj7').join(',')==='F4,A4,C5,E5','shape grows upward to FMaj7');
assert(maj7.parentVariant==='rm-f-triad'&&maj7.morphType==='EXTEND','Maj7 grows from known triad');
assert(pitches('rm-fmaj7-flat5').join(',')==='F4,A4,B4,E5','flat-fifth form changes C to B only');
assert(flat5.parentVariant==='rm-fmaj7'&&flat5.morphType==='CHANGE'&&flat5.morphTargets.join(',')==='2','flatted fifth is one-note CHANGE');
const parentPitches=pitches('rm-fmaj7'),changedPitches=pitches('rm-fmaj7-flat5');
assert(parentPitches.filter((x,i)=>x!==changedPitches[i]).length===1,'exactly one visible pitch changes');
assert(VARIANTS.filter(v=>v.familyId==='relative-major-reinterpret').every(v=>!('harmonyFieldId' in v)&&!('harmonyTimeline' in v)),'Relative Major Variants do not own Harmony Fields');

assert(harmonyFieldById('static-f').timeline[0].chord==='F','familiar F context exists independently');
assert(harmonyFieldById('static-g7').timeline[0].chord==='G7','dominant G7 context exists independently');

const plan=buildDailySessionPlan({currentStage:10,eventCount:20,targetSessionBeats:320});
assert(plan.focusFamilyIds[0]==='relative-major-reinterpret','Stage 10 prioritizes Relative Major family');
const rmEvents=plan.events.filter(e=>e.familyId==='relative-major-reinterpret');
assert(rmEvents.length>=4,'Stage 10 sequence appears at least once');
const [fContext,g7Context,maj7Event,flat5Event]=rmEvents;
assert(fContext.variantId==='rm-f-triad'&&fContext.harmonyFieldId==='static-f'&&fContext.presentationMode==='TEACHER_CALL','first experience establishes familiar F shape');
assert(g7Context.variantId==='rm-f-triad'&&g7Context.harmonyFieldId==='static-g7'&&g7Context.presentationMode==='BUILD','same notation reappears over G7');
assert(g7Context.harmonyTransfer===true,'same-Variant context change is explicit Learning Event metadata');
assert(JSON.stringify(fContext.scoreModel.notes)===JSON.stringify(g7Context.scoreModel.notes),'F→G7 transfer changes background, not the score');
assert(maj7Event.variantId==='rm-fmaj7'&&maj7Event.harmonyFieldId==='static-g7'&&maj7Event.morph?.type==='EXTEND','upper structure grows while G7 remains');
assert(flat5Event.variantId==='rm-fmaj7-flat5'&&flat5Event.harmonyFieldId==='static-g7'&&flat5Event.morph?.type==='CHANGE','flat fifth is a one-note Morph over same dominant');
assert(rmEvents.every(e=>!('theoryPrompt' in e)&&!('relativeMajorQuestion' in e)&&!('chordAnalysisQuestion' in e)),'Relative Major remains internal grammar, not a learner theory task');

let mastery=emptyFamilyMastery();
const cold=(variantId,harmonyFieldId,time)=>{mastery=applyEventResult(mastery,{familyId:family.familyId,variantId,harmonyFieldId,presentationMode:'COLD_READ'},{readScore:95,stars:5},time);};
cold('rm-f-triad','static-f',1000);
cold('rm-fmaj7','static-g7',2000);
cold('rm-fmaj7-flat5','static-g7',3000);
assert(!isFamilyMastered(mastery,family.familyId),'seeing both harmony fields is insufficient if same triad was never cold-read over G7');
cold('rm-f-triad','static-g7',4000);
assert(isFamilyMastered(mastery,family.familyId),'mastery requires the same triad cold-read in both F and G7 contexts plus grown/changed variants');
assert(mastery.coldVariantHarmonyKeys.includes('rm-f-triad@static-f')&&mastery.coldVariantHarmonyKeys.includes('rm-f-triad@static-g7'),'mastery stores context-sensitive cold evidence');

let oneContext=emptyFamilyMastery();
oneContext=applyEventResult(oneContext,{familyId:family.familyId,variantId:'rm-f-triad',harmonyFieldId:'static-f',presentationMode:'COLD_READ'},{readScore:95,stars:5},1000);
const adaptive=buildDailySessionPlan({currentStage:10,eventCount:8,familyMastery:{[family.familyId]:oneContext}}),firstRm=adaptive.events.find(e=>e.familyId===family.familyId);
assert(firstRm.presentationMode==='COLD_READ'&&firstRm.variantId==='rm-f-triad'&&firstRm.harmonyFieldId==='static-g7','known family cold-reappears in the next harmonic context instead of repeating the same background');

console.log('OK: Stage 10 reuses one ordinary staff shape across F→G7, then grows and changes one note without turning Relative Major into a theory quiz');

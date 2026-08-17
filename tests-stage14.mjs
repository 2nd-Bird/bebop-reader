import {STAGES} from './src/curriculum/stages.js';
import {familyById} from './src/curriculum/phraseFamilyRegistry.js';
import {MUSICAL_FORMS,musicalFormById,chordAtFormBeat,expandFormHarmony,sliceFormHarmony} from './src/curriculum/musicalForms.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {sessionHarmonyPulses} from './src/audio/groove.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};

assert(validateCurriculum(),'Stage 14 curriculum/form references validate');
const stage=STAGES.find(s=>s.stage===14),blues=musicalFormById('c-blues-12'),rhythm=musicalFormById('rhythm-changes-32');
assert(stage?.id==='forms-flow'&&stage.title==='Blues / Rhythm Changes','Stage 14 roadmap entry');
assert(stage.unlock.forms.join(',')==='c-blues-12,rhythm-changes-32','Stage 14 unlock graph names both target forms');
assert(MUSICAL_FORMS.length===2,'two roadmap forms are explicitly modeled');
assert(blues.bars===12&&blues.lengthBeats===48&&blues.status==='ACTIVE','C Blues is an active 12-bar / 48-beat field');
assert(rhythm.bars===32&&rhythm.lengthBeats===128&&rhythm.status==='ACTIVE','Rhythm Changes is an active 32-bar / 128-beat field after functional MOVE is available');
assert(blues.source.type==='curriculum'&&/not a Hamase transcription/.test(blues.source.adaptation),'C Blues form is curriculum integration, not fabricated source transcription');

const expectedBlues=['C7','C7','C7','C7','F7','F7','C7','C7','G7','F7','C7','G7'];
const actualBlues=Array.from({length:12},(_,bar)=>chordAtFormBeat(blues,bar*4));
assert(actualBlues.join(',')===expectedBlues.join(','),'C Blues carries the intended I/I/I/I IV/IV I/I V/IV I/V form');
assert(chordAtFormBeat(blues,48)==='C7'&&chordAtFormBeat(blues,64)==='F7','form harmony wraps cleanly into the next chorus');
const twoChoruses=expandFormHarmony(blues,96);
assert(twoChoruses.some(x=>x.beat===48&&x.chord==='C7')&&twoChoruses.some(x=>x.beat===80&&x.chord==='G7'),'global harmony expansion repeats the full chorus');
assert(sliceFormHarmony(blues,20,4)[0].chord==='F7','bar 6 phrase window hears IV');
assert(sliceFormHarmony(blues,44,4)[0].chord==='G7','bar 12 phrase window hears V turnaround');

assert(chordAtFormBeat(rhythm,64)==='E7'&&chordAtFormBeat(rhythm,72)==='A7'&&chordAtFormBeat(rhythm,80)==='D7'&&chordAtFormBeat(rhythm,88)==='G7','Rhythm Changes bridge is the dominant chain E7→A7→D7→G7');

const plan=buildDailySessionPlan({currentStage:14,bpm:60,eventCount:24,targetSessionBeats:320});
assert(plan.form==='c-blues-12'&&plan.musicalFormId==='c-blues-12','Stage 14 defaults to C Blues rather than an exercise field');
assert(plan.totalBeats%48===0&&plan.totalBeats===288,'session ends on a complete Blues chorus boundary');
assert(plan.focusFamilyIds.join(',')==='g-to-f-surfaces,density-g-to-f','Stage 14 reuses known Phrase Families instead of inventing a new lick family');
assert(plan.events.length>=12,'multiple known-family encounters occur across several choruses');
createTimeline(plan).validate();

const contexts=new Set(plan.events.map(e=>e.harmonyContext));
assert(contexts.has('C7')&&contexts.has('F7')&&contexts.has('G7'),'known material is encountered in I / IV / V harmonic contexts');
const positions=new Set(plan.events.map(e=>e.formPosition));
assert(positions.has(2)&&positions.has(5)&&positions.has(11),'events move through bar 3 / 6 / 12 form positions');
assert(plan.events.every(e=>e.form==='c-blues-12'&&e.formTransfer===true),'every Stage 14 event belongs to the active musical form and records form transfer');
assert(plan.events.every(e=>e.modelPolicy==='NONE'&&e.morphPolicy==='NONE'),'form integration does not re-teach known material with model or Morph');
assert(plan.events.every(e=>['COLD_READ','DELAYED_READ'].includes(e.presentationMode)),'Stage 14 keeps sight-reading scaffold removed');
assert(plan.events.every(e=>e.scoreModel.harmonyTimeline[0].chord===e.harmonyContext),'notation harmony matches the actual form slot');
assert(plan.events.every(e=>!('cellQuestion' in e)&&!('chordAnalysisQuestion' in e)&&!('relativeMajorQuestion' in e)),'form integration never becomes a theory quiz');

for(const familyId of plan.focusFamilyIds)assert(familyById(familyId)?.stage<14,'Stage 14 integrates already-learned families');
const firstFamily=plan.focusFamilyIds[0],familyEvents=plan.events.filter(e=>e.familyId===firstFamily);
assert(new Set(familyEvents.map(e=>e.harmonyContext)).size>1,'the same known family moves across more than one harmonic context');
assert(new Set(familyEvents.map(e=>e.formPosition)).size>1,'the same known family moves across more than one form position');

const groove=sessionHarmonyPulses(plan);
assert(groove.map(x=>`${x.beat}:${x.chord}`).slice(0,7).join(',')==='0:C7,16:F7,24:C7,32:G7,36:F7,40:C7,44:G7','groove follows the global 12-bar form even outside SING windows');
assert(groove.some(x=>x.beat===48&&x.chord==='C7'),'groove carries harmony continuously into the next chorus');

console.log('OK: Stage 14 runs known Phrase Families through a continuous 12-bar C Blues field and exposes Rhythm Changes through a separate functional-MOVE program');

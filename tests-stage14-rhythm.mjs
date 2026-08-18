import {musicalFormById,chordAtFormBeat} from './src/curriculum/musicalForms.js';
import {applyFormMove,semitoneShiftForDominant} from './src/curriculum/formMoves.js';
import {variantById} from './src/curriculum/variantRegistry.js';
import {buildDailySessionPlan,recommendedFormIdForStage14} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesFormReady,cBluesConnectReady,cBluesRecallReady,cBluesStageReady} from './src/curriculum/mastery.js';
import {sessionHarmonyPulses} from './src/audio/groove.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitchList=notes=>notes.filter(n=>!n.rest).map(n=>n.pitch).join(',');

const form=musicalFormById('rhythm-changes-32');
assert(form?.status==='ACTIVE'&&form.lengthBeats===128&&form.bars===32,'Rhythm Changes is a full 32-bar field');
assert(form.integrationFamilyIds.join(',')==='g-to-f-surfaces,relative-major-reinterpret','Rhythm Changes integrates existing reading and Relative Major families');
assert(form.slotPrograms?.length===8,'one form-program slot exists per four-bar section');
assert(form.slotPrograms.filter(x=>x.movePolicy==='RELATIVE_MAJOR_OF_DOMINANT').length===2,'bridge chunks explicitly request functional Relative Major MOVE');
assert(chordAtFormBeat(form,64)==='E7'&&chordAtFormBeat(form,72)==='A7'&&chordAtFormBeat(form,80)==='D7'&&chordAtFormBeat(form,88)==='G7','bridge dominant chain remains explicit');

assert(semitoneShiftForDominant('E7')===-3&&semitoneShiftForDominant('A7')===2&&semitoneShiftForDominant('D7')===-5&&semitoneShiftForDominant('G7')===0,'functional MOVE is measured from the verified G7 Relative Major context');
const base=variantById('rm-f-triad');
assert(pitchList(base.notes)==='F4,A4,C5','Stage 10 source Variant remains the familiar F major triad shape');
const expected={E7:'D4,F#4,A4',A7:'G4,B4,D5',D7:'C4,E4,G4',G7:'F4,A4,C5'};
for(const [chord,pitches] of Object.entries(expected))assert(pitchList(applyFormMove(base.notes,{movePolicy:'RELATIVE_MAJOR_OF_DOMINANT',harmonyContext:chord}))===pitches,`${chord} receives the correct relative-major shape`);
assert(pitchList(base.notes)==='F4,A4,C5','Event-time MOVE never mutates the Phrase Variant source');

const plan=buildDailySessionPlan({currentStage:14,formId:'rhythm-changes-32',bpm:60,eventCount:20,targetSessionBeats:320});
assert(plan.form==='rhythm-changes-32'&&plan.musicalFormId==='rhythm-changes-32','Scheduler can run the 32-bar form explicitly');
assert(plan.totalBeats===256&&plan.totalBeats%128===0,'session contains exactly two complete Rhythm Changes choruses rather than ending mid-form');
assert(plan.focusFamilyIds.join(',')==='g-to-f-surfaces,relative-major-reinterpret','form program reuses only known families');
assert(plan.events.length===16,'two choruses contain sixteen four-bar Learning Event fields');
createTimeline(plan).validate();
assert(plan.events.every(e=>e.modelPolicy==='NONE'&&e.morphPolicy==='NONE'&&['COLD_READ','DELAYED_READ'].includes(e.presentationMode)),'Rhythm Changes integration remains scaffold-free sight reading');

const bridge=plan.events.filter(e=>e.movePolicy==='RELATIVE_MAJOR_OF_DOMINANT');
assert(bridge.length===4,'two choruses expose four functional bridge MOVE events');
assert(bridge.map(e=>e.harmonyContext).join(',')==='E7,D7,A7,G7','chorus-position alternation covers all four bridge dominants without adding new Variants');
assert(bridge.every(e=>e.variantId==='rm-f-triad'&&e.scoreModel.sourceVariantId==='rm-f-triad'),'all bridge material keeps one Variant identity');
for(const e of bridge)assert(pitchList(e.scoreModel.notes)===expected[e.harmonyContext],`${e.harmonyContext} score/scoring model is functionally MOVEd`);
assert(new Set(bridge.map(e=>e.formPosition)).size===4,'the same shape is cold-read at four distinct bridge form positions');
assert(bridge.every(e=>e.formTransfer&&e.harmonyTransfer),'bridge events record both form and harmonic transfer');
assert(bridge.every(e=>e.scoreModel.harmonyTimeline[0].chord===e.harmonyContext),'moved notation remains anchored to the actual sounding dominant');

const groove=sessionHarmonyPulses(plan);
assert(groove.some(x=>x.beat===64&&x.chord==='E7')&&groove.some(x=>x.beat===72&&x.chord==='A7')&&groove.some(x=>x.beat===80&&x.chord==='D7')&&groove.some(x=>x.beat===88&&x.chord==='G7'),'groove carries the full bridge harmony independently of Event windows');
assert(groove.some(x=>x.beat===192&&x.chord==='E7'),'global form harmony repeats through chorus two');
assert(plan.events.every(e=>!('relativeMajorQuestion' in e)&&!('analysisPrompt' in e)&&!('nameTheChord' in e)),'Relative Major remains internal generation grammar rather than a learner theory task');

assert(recommendedFormIdForStage14({})==='c-blues-12','Stage 14 starts with C Blues rather than skipping directly to Rhythm Changes');
let weak=emptyFamilyMastery();
weak=applyEventResult(weak,{familyId:'g-to-f-surfaces',variantId:'gf-cell-seed',presentationMode:'COLD_READ',formTransfer:true,form:'c-blues-12',formPosition:2,harmonyContext:'C7',harmonyFieldId:'form:c-blues-12:C7'},{readScore:60,stars:2},1000);
assert(weak.coldFormContextKeys.length===0,'unsuccessful cold form read does not count as transfer evidence');
const evidence={};
for(const [familyId,variantId] of [['g-to-f-surfaces','gf-cell-seed'],['density-g-to-f','density-gf-seed']]){
 let record=emptyFamilyMastery();
 for(const [i,chord] of ['C7','F7','G7'].entries())record=applyEventResult(record,{familyId,variantId,presentationMode:'COLD_READ',formTransfer:true,form:'c-blues-12',formPosition:[2,5,11][i],harmonyContext:chord,harmonyFieldId:`form:c-blues-12:${chord}`},{readScore:90,stars:4},2000+i);
 evidence[familyId]=record;
}
assert(cBluesFormReady(evidence),'successful I / IV / V cold transfer for both integrated families completes the cold form gate');
assert(!cBluesConnectReady(evidence)&&!cBluesRecallReady(evidence)&&!cBluesStageReady(evidence),'cold form transfer alone is not the late-Stage-14 FLOW gate');
assert(recommendedFormIdForStage14(evidence)==='c-blues-12','C Blues continues until Connect and Recall scaffold-removal evidence exists');

const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:7,harmonyContext:'C7',harmonyFieldId:'form:c-blues-12:flow'};
evidence['g-to-f-surfaces']=applyEventResult(evidence['g-to-f-surfaces'],{...flowBase,flowAction:'CONNECT'},{readScore:88,stars:4},3000);
assert(cBluesConnectReady(evidence)&&!cBluesRecallReady(evidence),'successful four-bar Connect is required before partial-score Recall');
assert(recommendedFormIdForStage14(evidence)==='c-blues-12','Connect alone still keeps the learner in C Blues for Recall');
evidence['g-to-f-surfaces']=applyEventResult(evidence['g-to-f-surfaces'],{...flowBase,flowAction:'RECALL'},{readScore:84,stars:4},4000);
assert(cBluesRecallReady(evidence)&&cBluesStageReady(evidence),'successful Recall completes the C Blues Stage 14 gate');
assert(recommendedFormIdForStage14(evidence)==='rhythm-changes-32','next Stage 14 session advances to Rhythm Changes only after cold transfer + Connect + Recall');
const autoPlan=buildDailySessionPlan({currentStage:14,familyMastery:evidence,bpm:60,eventCount:20,targetSessionBeats:320});
assert(autoPlan.musicalFormId==='rhythm-changes-32','normal Scheduler selects Rhythm Changes after the complete C Blues gate');

console.log('OK: Rhythm Changes reuses one known Relative Major Variant through E7/A7/D7/G7 and unlocks only after C Blues cold transfer + Connect + Recall');

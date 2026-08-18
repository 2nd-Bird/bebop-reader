import {musicalFormById,chordAtFormBeat} from './src/curriculum/musicalForms.js';
import {applyFormMove,semitoneShiftForDominant} from './src/curriculum/formMoves.js';
import {variantById} from './src/curriculum/variantRegistry.js';
import {buildDailySessionPlan,recommendedFormIdForStage14} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesFormReady,cBluesRepeatReady,cBluesMutationReady,cBluesConnectReady,cBluesTradeReady,cBluesRecallReady,cBluesOneChorusReady,cBluesStageReady} from './src/curriculum/mastery.js';
import {sessionHarmonyPulses} from './src/audio/groove.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitchList=notes=>notes.filter(n=>!n.rest).map(n=>n.pitch).join(',');
const form=musicalFormById('rhythm-changes-32');
assert(form?.status==='ACTIVE'&&form.lengthBeats===128&&form.bars===32,'Rhythm Changes is a full 32-bar field');
assert(form.integrationFamilyIds.join(',')==='g-to-f-surfaces,relative-major-reinterpret','Rhythm Changes integrates existing reading and Relative Major families');
assert(chordAtFormBeat(form,64)==='E7'&&chordAtFormBeat(form,72)==='A7'&&chordAtFormBeat(form,80)==='D7'&&chordAtFormBeat(form,88)==='G7','bridge dominant chain remains explicit');
assert(semitoneShiftForDominant('E7')===-3&&semitoneShiftForDominant('A7')===2&&semitoneShiftForDominant('D7')===-5&&semitoneShiftForDominant('G7')===0,'functional MOVE stays measured from verified G7 context');
const base=variantById('rm-f-triad'),expected={E7:'D4,F#4,A4',A7:'G4,B4,D5',D7:'C4,E4,G4',G7:'F4,A4,C5'};
assert(pitchList(base.notes)==='F4,A4,C5','Stage 10 source Variant remains one familiar shape');
for(const [chord,pitches] of Object.entries(expected))assert(pitchList(applyFormMove(base.notes,{movePolicy:'RELATIVE_MAJOR_OF_DOMINANT',harmonyContext:chord}))===pitches,`${chord} receives the correct relative-major shape`);

const plan=buildDailySessionPlan({currentStage:14,formId:'rhythm-changes-32',bpm:60,eventCount:20,targetSessionBeats:320});
assert(plan.totalBeats===256&&plan.events.length===16,'explicit Rhythm Changes session spans two complete choruses');
createTimeline(plan).validate();
const bridge=plan.events.filter(e=>e.movePolicy==='RELATIVE_MAJOR_OF_DOMINANT');
assert(bridge.length===4&&bridge.map(e=>e.harmonyContext).join(',')==='E7,D7,A7,G7','two choruses cover all four bridge dominants');
assert(bridge.every(e=>e.variantId==='rm-f-triad'&&e.scoreModel.sourceVariantId==='rm-f-triad'),'bridge MOVE keeps one Variant identity');
for(const e of bridge)assert(pitchList(e.scoreModel.notes)===expected[e.harmonyContext],`${e.harmonyContext} notation/scoring is functionally moved`);
assert(plan.events.every(e=>e.modelPolicy==='NONE'&&e.morphPolicy==='NONE'&&['COLD_READ','DELAYED_READ'].includes(e.presentationMode)),'Rhythm Changes remains scaffold-free sight reading');
const groove=sessionHarmonyPulses(plan);assert(groove.some(x=>x.beat===64&&x.chord==='E7')&&groove.some(x=>x.beat===192&&x.chord==='E7'),'global groove carries bridge harmony through both choruses');

const evidence={};
for(const [familyId,variantId] of [['g-to-f-surfaces','gf-cell-seed'],['density-g-to-f','density-gf-seed']]){let record=emptyFamilyMastery();for(const [i,chord] of ['C7','F7','G7'].entries())record=applyEventResult(record,{familyId,variantId,presentationMode:'COLD_READ',formTransfer:true,form:'c-blues-12',formPosition:[2,5,11][i],harmonyContext:chord,harmonyFieldId:`form:c-blues-12:${chord}`},{readScore:90,stars:4},2000+i);evidence[familyId]=record;}
assert(cBluesFormReady(evidence)&&!cBluesRepeatReady(evidence)&&!cBluesStageReady(evidence),'cold I/IV/V transfer alone does not complete late FLOW');
const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:10,harmonyContext:'F7',harmonyFieldId:'form:c-blues-12:flow'};
const sequence=['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS'];
for(const [i,action] of sequence.entries()){
  evidence['g-to-f-surfaces']=applyEventResult(evidence['g-to-f-surfaces'],{...flowBase,flowAction:action},{readScore:88-i,stars:4},3000+i);
  if(action==='REPEAT')assert(cBluesRepeatReady(evidence)&&!cBluesMutationReady(evidence),'Repeat unlocks Mutation');
  if(action==='MUTATION')assert(cBluesMutationReady(evidence)&&!cBluesConnectReady(evidence),'Mutation unlocks Connect');
  if(action==='CONNECT')assert(cBluesConnectReady(evidence)&&!cBluesTradeReady(evidence),'Connect unlocks Trade');
  if(action==='TRADE')assert(cBluesTradeReady(evidence)&&!cBluesRecallReady(evidence),'Trade unlocks Recall');
  if(action==='RECALL')assert(cBluesRecallReady(evidence)&&!cBluesOneChorusReady(evidence),'Recall unlocks one chorus');
}
assert(cBluesOneChorusReady(evidence)&&cBluesStageReady(evidence),'one chorus completes the C Blues gate only after the whole FLOW sequence');
assert(recommendedFormIdForStage14(evidence)==='rhythm-changes-32','Rhythm Changes unlocks after cold transfer + Repeat + Mutation + Connect + Trade + Recall + one chorus');
const autoPlan=buildDailySessionPlan({currentStage:14,familyMastery:evidence,bpm:60,eventCount:20,targetSessionBeats:320});
assert(autoPlan.musicalFormId==='rhythm-changes-32','normal Scheduler advances to Rhythm Changes after the complete gate');
console.log('OK: Rhythm Changes unlocks only after the full C Blues FLOW sequence and then reuses known material through its bridge');

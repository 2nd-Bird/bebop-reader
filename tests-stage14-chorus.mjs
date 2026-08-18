import fs from 'node:fs';
import {musicalFormById} from './src/curriculum/musicalForms.js';
import {buildOneChorusFlowEvent} from './src/curriculum/flow.js';
import {buildDailySessionPlan,recommendedFormIdForStage14} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesRecallReady,cBluesOneChorusReady,cBluesStageReady} from './src/curriculum/mastery.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const blues=musicalFormById('c-blues-12'),program=blues.closingFlowProgram,fourBarPattern=program.variantIds.join(',');
assert(program.oneChorusRepeats===3&&program.oneChorusPreReadBeats===16,'one-chorus FLOW grows the existing four-bar material by duration, with four bars of pre-read');

const direct=buildOneChorusFlowEvent({musicalForm:blues,startBeat:224,endBeat:288,key:'C',bpm:60,eventId:'chorus-test'});
assert(direct.presentationMode==='FLOW'&&direct.flowAction==='ONE_CHORUS','one chorus is a FLOW presentation rather than a new Phrase Variant');
assert(direct.variantId===null&&direct.familyId==='g-to-f-surfaces','one chorus preserves the known Phrase Family without fabricating a twelve-bar Variant');
assert(direct.startBeat===224&&direct.prepareBeat===224&&direct.singStartBeat===240&&direct.singEndBeat===288,'four bars of pre-read lead into exactly one complete C Blues chorus');
assert(direct.singEndBeat-direct.singStartBeat===48&&direct.scoreModel.totalBeats===48,'the scoring target and visible score span all twelve bars / 48 beats');
assert(direct.formPosition===0&&direct.singStartBeat%blues.lengthBeats===0,'one-chorus singing starts exactly on the Blues form downbeat');
assert(direct.scoreVisibility==='FULL'&&direct.visibleBeats===48,'the first one-chorus step keeps the complete ordinary staff visible');
assert(direct.modelPolicy==='NONE'&&direct.morphPolicy==='NONE','one chorus adds no model or Morph scaffold');
assert(direct.flowSourceVariantIds.length===12,'twelve one-bar chunks fill the chorus');
assert(direct.flowSourceVariantIds.slice(0,4).join(',')===fourBarPattern&&direct.flowSourceVariantIds.slice(4,8).join(',')===fourBarPattern&&direct.flowSourceVariantIds.slice(8,12).join(',')===fourBarPattern,'one chorus repeats the already-known four-bar CONNECT material three times instead of inventing a long lick');
assert(new Set(direct.flowSourceVariantIds).size===3,'one chorus uses only the three already-known Stage 7 surfaces');
assert(direct.scoreModel.notes.some(n=>n.startBeat<4)&&direct.scoreModel.notes.some(n=>n.startBeat>=44),'ordinary notation contains material from the first through the twelfth bar');
assert(direct.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:C7,16:F7,24:C7,32:G7,36:F7,40:C7,44:G7','one-chorus score follows the complete C Blues I/IV/V timeline');
assert(!('analysisPrompt' in direct)&&!('cellQuestion' in direct)&&!('nameTheChord' in direct),'one chorus remains a reading/singing task rather than a theory task');
createTimeline({events:[direct],totalBeats:288}).validate();

const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:10,harmonyContext:'F7',harmonyFieldId:'form:c-blues-12:flow'};
let flowRecord=emptyFamilyMastery();
for(const [i,action] of ['REPEAT','MUTATION','CONNECT','TRADE','RECALL'].entries())flowRecord=applyEventResult(flowRecord,{...flowBase,flowAction:action},{readScore:90-i,stars:4},1000+i);
let flowEvidence={'g-to-f-surfaces':flowRecord};
assert(cBluesRecallReady(flowEvidence)&&!cBluesOneChorusReady(flowEvidence),'full prior FLOW sequence through Recall unlocks one chorus but does not silently complete it');

const plan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:flowEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
const closing=plan.events.at(-1);
assert(closing.flowAction==='ONE_CHORUS','normal Scheduler advances from successful Recall to one complete chorus');
assert(closing.startBeat===224&&closing.prepareBeat===224&&closing.singStartBeat===240&&closing.endBeat===288,'scheduled one chorus replaces the final four 16-beat fields without changing session duration');
assert(plan.events.at(-2).endBeat===closing.startBeat&&plan.totalBeats===288,'one-chorus FLOW introduces no timing gap and preserves the complete-form session boundary');
assert(plan.events.length===15,'four ordinary fields collapse into one 64-beat pre-read + chorus FLOW event');
createTimeline(plan).validate();

flowRecord=applyEventResult(flowRecord,closing,{readScore:84,stars:4},2000);flowEvidence={'g-to-f-surfaces':flowRecord};
assert(cBluesOneChorusReady(flowEvidence),'successful one-chorus read is separate FLOW evidence');
assert(flowRecord.flowActions.join(',')==='REPEAT,MUTATION,CONNECT,TRADE,RECALL,ONE_CHORUS','FLOW history preserves the full implemented progression');
assert(flowRecord.coldReadAttempts===0&&flowRecord.coldVariantIds.length===0&&flowRecord.seenVariantIds.length===0,'one-chorus FLOW does not fabricate Variant or cold-read mastery');
assert(!cBluesStageReady(flowEvidence),'FLOW alone cannot bypass required I/IV/V cold form transfer');

const evidence={...flowEvidence};
for(const [familyId,variantId] of [['g-to-f-surfaces','gf-cell-seed'],['density-g-to-f','density-gf-seed']]){
  let record=evidence[familyId]||emptyFamilyMastery();
  for(const [i,chord] of ['C7','F7','G7'].entries())record=applyEventResult(record,{familyId,variantId,presentationMode:'COLD_READ',formTransfer:true,form:'c-blues-12',formPosition:[2,5,11][i],harmonyContext:chord,harmonyFieldId:`form:c-blues-12:${chord}`},{readScore:90,stars:4},3000+i);
  evidence[familyId]=record;
}
assert(cBluesStageReady(evidence)&&recommendedFormIdForStage14(evidence)==='rhythm-changes-32','cold form transfer plus full FLOW through one chorus unlocks Rhythm Changes');

const debugPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:6,targetSessionBeats:96,flowActionOverride:'ONE_CHORUS'});
assert(debugPlan.totalBeats===96&&debugPlan.events.length===3,'debug one-chorus harness uses two Blues choruses and collapses the final four fields into one FLOW event');
assert(debugPlan.events.at(-1).flowAction==='ONE_CHORUS'&&debugPlan.events.at(-1).startBeat===32&&debugPlan.events.at(-1).singStartBeat===48&&debugPlan.events.at(-1).singEndBeat===96,'debug harness gives four bars pre-read then one complete chorus from the next downbeat');
createTimeline(debugPlan).validate();

const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8'),player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
assert(view.includes("ONE_CHORUS:'1コーラスを読む'"),'one-chorus learner copy stays musical and theory-free');
assert(player.includes("['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS']"),'debug harness can expose one chorus inside the canonical implemented sequence');

console.log('OK: Stage 14 grows the full Repeat→Mutation→Connect→Trade→Recall path into a fully visible twelve-bar C Blues reading task with preserved form/downbeat regressions');

import fs from 'node:fs';
import {musicalFormById} from './src/curriculum/musicalForms.js';
import {buildClosingFlowEvent} from './src/curriculum/flow.js';
import {buildDailySessionPlan,recommendedFormIdForStage14} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesRepeatReady,cBluesMutationReady,cBluesConnectReady,cBluesTradeReady,cBluesRecallReady,cBluesStageReady} from './src/curriculum/mastery.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const blues=musicalFormById('c-blues-12');
const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:10,harmonyContext:'F7',harmonyFieldId:'form:c-blues-12:flow'};

const connect=buildClosingFlowEvent({musicalForm:blues,startBeat:256,endBeat:288,key:'C',bpm:60,flowAction:'CONNECT'});
const recall=buildClosingFlowEvent({musicalForm:blues,startBeat:256,endBeat:288,key:'C',bpm:60,flowAction:'RECALL'});
assert(connect.scoreVisibility==='FULL'&&connect.visibleBeats===16,'Connect keeps all four bars visible');
assert(recall.scoreVisibility==='PARTIAL'&&recall.visibleBeats===8,'Recall hides exactly the final two bars');
assert(recall.scoreModel.totalBeats===16&&recall.singEndBeat-recall.singStartBeat===16,'Recall retains the full four-bar scoring target');
assert(recall.scoreModel.notes.length===connect.scoreModel.notes.length,'score masking does not delete any scoring target notes');
assert(JSON.stringify(recall.scoreModel.notes)===JSON.stringify(connect.scoreModel.notes),'Recall changes visibility only, not expected notes');
assert(recall.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')===connect.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(','),'Recall leaves Blues harmony untouched');
assert(recall.modelPolicy==='NONE'&&recall.morphPolicy==='NONE','Recall does not reintroduce model or Morph scaffold');

let weak=emptyFamilyMastery();
weak=applyEventResult(weak,{...flowBase,flowAction:'REPEAT'},{readScore:90,stars:4},900);
weak=applyEventResult(weak,{...flowBase,flowAction:'MUTATION'},{readScore:89,stars:4},901);
weak=applyEventResult(weak,{...flowBase,flowAction:'CONNECT'},{readScore:62,stars:2},902);
assert(cBluesRepeatReady({'g-to-f-surfaces':weak})&&cBluesMutationReady({'g-to-f-surfaces':weak})&&!cBluesConnectReady({'g-to-f-surfaces':weak}),'weak Connect does not count as FLOW evidence even after valid prerequisites');

let record=emptyFamilyMastery();
for(const [i,action] of ['REPEAT','MUTATION','CONNECT'].entries())record=applyEventResult(record,{...flowBase,flowAction:action},{readScore:90-i,stars:4},1000+i);
let evidence={'g-to-f-surfaces':record};
assert(cBluesConnectReady(evidence)&&!cBluesTradeReady(evidence),'Repeat + Mutation + Connect unlock Trade');
const afterConnectPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:evidence,bpm:60,eventCount:24,targetSessionBeats:320});
assert(afterConnectPlan.events.at(-1).flowAction==='TRADE','after Connect the next FLOW is Trade');
createTimeline(afterConnectPlan).validate();

record=applyEventResult(record,{...flowBase,flowAction:'TRADE'},{readScore:86,stars:4},2000);evidence={'g-to-f-surfaces':record};
assert(cBluesTradeReady(evidence)&&!cBluesRecallReady(evidence),'Trade unlocks Recall but is not Recall evidence');
const recallPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:evidence,bpm:60,eventCount:24,targetSessionBeats:320});
const closing=recallPlan.events.at(-1);
assert(closing.presentationMode==='FLOW'&&closing.flowAction==='RECALL','after successful Trade the next C Blues closing FLOW becomes Recall');
assert(closing.scoreVisibility==='PARTIAL'&&closing.visibleBeats===8&&closing.scoreModel.totalBeats===16,'scheduled Recall masks only the second half while scoring all four bars');
createTimeline(recallPlan).validate();
record=applyEventResult(record,closing,{readScore:85,stars:4},3000);evidence={'g-to-f-surfaces':record};
assert(cBluesRecallReady(evidence),'successful partial-score Recall is recorded after the prior FLOW sequence');
assert(record.flowActions.join(',')==='REPEAT,MUTATION,CONNECT,TRADE,RECALL','FLOW history preserves the canonical order through Recall');

const blankPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:24,targetSessionBeats:320});
assert(blankPlan.events.at(-1).flowAction==='REPEAT','blank C Blues mastery now starts late FLOW at Repeat');

const debugRecallPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'RECALL'});
assert(debugRecallPlan.totalBeats===48&&debugRecallPlan.events.length===2,'short debug C Blues plan stays one chorus while replacing the final two fields with Recall FLOW');
assert(debugRecallPlan.events.at(-1).presentationMode==='FLOW'&&debugRecallPlan.events.at(-1).flowAction==='RECALL'&&debugRecallPlan.events.at(-1).visibleBeats===8,'debug harness exposes the production Recall visibility contract directly');
createTimeline(debugRecallPlan).validate();
const debugConnectPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'CONNECT'});
assert(debugConnectPlan.events.at(-1).flowAction==='CONNECT'&&debugConnectPlan.events.at(-1).scoreVisibility==='FULL','debug override can force Connect independently of mastery');

const css=fs.readFileSync(new URL('./session-v09.css',import.meta.url),'utf8'),view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8'),player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
assert(css.includes('.score-recall-mask')&&css.includes('background:var(--ivory)'),'Recall mask is blank score paper rather than theory overlay');
assert(view.includes("event?.scoreVisibility!=='PARTIAL'")&&view.includes('visibleBeats*g.beatWidth')&&view.includes("RECALL:'後半は思い出して'"),'UI retains partial-score Recall contract and experiential copy');
assert(player.includes("params.get('debug')==='1'")&&player.includes("params.get('flow')")&&player.includes("params.get('events')")&&player.includes("params.get('beats')"),'integration shortcuts remain explicitly gated behind debug=1');
assert(player.includes("['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS']"),'debug harness exposes Recall within the full implemented sequence');
assert(!cBluesStageReady(evidence)&&recommendedFormIdForStage14(evidence)==='c-blues-12','Recall cannot bypass cold form transfer or the later one-chorus step');

console.log('OK: Recall follows Repeat → Mutation → Connect → Trade and removes score scaffold without changing the full target or debug guardrails');

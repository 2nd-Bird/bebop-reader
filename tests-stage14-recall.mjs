import fs from 'node:fs';
import {musicalFormById} from './src/curriculum/musicalForms.js';
import {buildClosingFlowEvent} from './src/curriculum/flow.js';
import {buildDailySessionPlan,recommendedFormIdForStage14} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesConnectReady,cBluesTradeReady,cBluesRecallReady,cBluesStageReady} from './src/curriculum/mastery.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const blues=musicalFormById('c-blues-12');
const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:7,harmonyContext:'C7',harmonyFieldId:'form:c-blues-12:flow'};

const connect=buildClosingFlowEvent({musicalForm:blues,startBeat:256,endBeat:288,key:'C',bpm:60,flowAction:'CONNECT'});
const recall=buildClosingFlowEvent({musicalForm:blues,startBeat:256,endBeat:288,key:'C',bpm:60,flowAction:'RECALL'});
assert(connect.scoreVisibility==='FULL'&&connect.visibleBeats===16,'first connected FLOW keeps all four bars visible');
assert(recall.scoreVisibility==='PARTIAL'&&recall.visibleBeats===8,'Recall hides exactly the final two bars of a four-bar score');
assert(recall.scoreModel.totalBeats===16&&recall.singEndBeat-recall.singStartBeat===16,'Recall retains the full four-bar target and SING window');
assert(recall.scoreModel.notes.length===connect.scoreModel.notes.length,'score masking does not delete any scoring target notes');
assert(JSON.stringify(recall.scoreModel.notes)===JSON.stringify(connect.scoreModel.notes),'Recall presentation changes visibility only, not the expected phrase');
assert(recall.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')===connect.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(','),'Recall leaves actual Blues harmony untouched');
assert(recall.modelPolicy==='NONE'&&recall.morphPolicy==='NONE','Recall does not reintroduce model or Morph scaffold');

let weak=emptyFamilyMastery();
weak=applyEventResult(weak,{...flowBase,flowAction:'CONNECT'},{readScore:62,stars:2},1000);
assert(!cBluesConnectReady({'g-to-f-surfaces':weak}),'weak Connect does not count as FLOW evidence');
let connectRecord=emptyFamilyMastery();
connectRecord=applyEventResult(connectRecord,{...flowBase,flowAction:'CONNECT'},{readScore:88,stars:4},2000);
const connectEvidence={'g-to-f-surfaces':connectRecord};
assert(cBluesConnectReady(connectEvidence),'successful Connect is recorded separately');
assert(!cBluesTradeReady(connectEvidence)&&!cBluesRecallReady(connectEvidence),'Connect cannot skip the canonical Trade step and is not Recall evidence');

const afterConnectPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:connectEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
assert(afterConnectPlan.events.at(-1).flowAction==='TRADE','after successful Connect, the next C Blues closing FLOW is Trade');
createTimeline(afterConnectPlan).validate();

let tradeRecord=applyEventResult(connectRecord,{...flowBase,flowAction:'TRADE'},{readScore:86,stars:4},3000);
const tradeEvidence={'g-to-f-surfaces':tradeRecord};
assert(cBluesTradeReady(tradeEvidence)&&!cBluesRecallReady(tradeEvidence),'successful Trade advances the gate but does not silently become Recall');
const afterTradePlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:tradeEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
const recallClosing=afterTradePlan.events.at(-1);
assert(recallClosing.presentationMode==='FLOW'&&recallClosing.flowAction==='RECALL','after successful Trade, the next C Blues closing FLOW becomes Recall');
assert(recallClosing.scoreVisibility==='PARTIAL'&&recallClosing.visibleBeats===8,'scheduled Recall exposes only its first half');
assert(recallClosing.scoreModel.totalBeats===16,'scheduled Recall still scores the complete four-bar target');
createTimeline(afterTradePlan).validate();

let record=applyEventResult(tradeRecord,{...flowBase,flowAction:'RECALL'},{readScore:85,stars:4},4000);
assert(cBluesRecallReady({'g-to-f-surfaces':record}),'successful partial-score Recall is recorded only after Connect and Trade');
assert(record.flowActions.join(',')==='CONNECT,TRADE,RECALL','FLOW history preserves Connect → Trade → Recall order without Variant fabrication');

const blankPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:24,targetSessionBeats:320});
assert(blankPlan.events.at(-1).flowAction==='CONNECT'&&blankPlan.events.at(-1).scoreVisibility==='FULL','before Connect evidence the Closing FLOW remains fully visible');

// Debug-only integration harness can jump directly to expensive UI states without changing normal mastery behavior.
const debugRecallPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'RECALL'});
assert(debugRecallPlan.totalBeats===48&&debugRecallPlan.events.length===2,'short debug C Blues plan stays one chorus while replacing the final two fields with FLOW');
assert(debugRecallPlan.events.at(-1).presentationMode==='FLOW'&&debugRecallPlan.events.at(-1).flowAction==='RECALL','debug override can directly expose Recall');
assert(debugRecallPlan.events.at(-1).scoreVisibility==='PARTIAL'&&debugRecallPlan.events.at(-1).visibleBeats===8,'debug Recall uses the same production visibility contract');
createTimeline(debugRecallPlan).validate();
const debugConnectPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:tradeEvidence,bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'CONNECT'});
assert(debugConnectPlan.events.at(-1).flowAction==='CONNECT'&&debugConnectPlan.events.at(-1).scoreVisibility==='FULL','debug override can force Connect even when mastery would normally choose Recall');

const css=fs.readFileSync(new URL('./session-v09.css',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
assert(css.includes('.score-recall-mask')&&css.includes('background:var(--ivory)'),'Recall mask is rendered as blank score paper rather than a theory overlay');
assert(view.includes("event?.scoreVisibility!=='PARTIAL'")&&view.includes('visibleBeats*g.beatWidth'),'UI masks the score from the configured beat boundary');
assert(view.includes("event.flowAction==='RECALL'?'後半は思い出して'"),'learner-facing Recall copy stays experiential and minimal');
assert(player.includes("params.get('debug')==='1'")&&player.includes("params.get('flow')")&&player.includes("params.get('events')")&&player.includes("params.get('beats')"),'integration shortcuts are explicitly gated behind debug=1');

// Form progression must still require cold-transfer evidence in addition to the complete late FLOW sequence.
assert(!cBluesStageReady({'g-to-f-surfaces':record}),'FLOW alone cannot bypass the C Blues cold-transfer gate');
assert(recommendedFormIdForStage14({'g-to-f-surfaces':record})==='c-blues-12','Recall without I/IV/V cold evidence does not skip to Rhythm Changes');

console.log('OK: Recall follows Connect → Trade and hides only the final two bars while the full target remains intact');

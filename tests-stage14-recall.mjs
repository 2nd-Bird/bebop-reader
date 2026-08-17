import fs from 'node:fs';
import {musicalFormById} from './src/curriculum/musicalForms.js';
import {buildClosingFlowEvent} from './src/curriculum/flow.js';
import {buildDailySessionPlan,recommendedFormIdForStage14} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesConnectReady,cBluesRecallReady,cBluesStageReady} from './src/curriculum/mastery.js';
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
let record=emptyFamilyMastery();
record=applyEventResult(record,{...flowBase,flowAction:'CONNECT'},{readScore:88,stars:4},2000);
assert(cBluesConnectReady({'g-to-f-surfaces':record}),'successful Connect unlocks the Recall presentation');
assert(!cBluesRecallReady({'g-to-f-surfaces':record}),'Connect is not silently treated as Recall');
record=applyEventResult(record,{...flowBase,flowAction:'RECALL'},{readScore:85,stars:4},3000);
assert(cBluesRecallReady({'g-to-f-surfaces':record}),'successful partial-score Recall is recorded separately');
assert(record.flowActions.join(',')==='CONNECT,RECALL','FLOW history preserves Connect → Recall order without Variant fabrication');

const connectEvidence={'g-to-f-surfaces':{...record,flowActions:['CONNECT']}};
const connectPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:connectEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
const connectClosing=connectPlan.events.at(-1);
assert(connectClosing.presentationMode==='FLOW'&&connectClosing.flowAction==='RECALL','after successful Connect, the next C Blues closing FLOW becomes Recall');
assert(connectClosing.scoreVisibility==='PARTIAL'&&connectClosing.visibleBeats===8,'scheduled Recall exposes only its first half');
assert(connectClosing.scoreModel.totalBeats===16,'scheduled Recall still scores the complete four-bar target');
createTimeline(connectPlan).validate();

const blankPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:24,targetSessionBeats:320});
assert(blankPlan.events.at(-1).flowAction==='CONNECT'&&blankPlan.events.at(-1).scoreVisibility==='FULL','before Connect evidence the Closing FLOW remains fully visible');

const css=fs.readFileSync(new URL('./session-v09.css',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
assert(css.includes('.score-recall-mask')&&css.includes('background:var(--ivory)'),'Recall mask is rendered as blank score paper rather than a theory overlay');
assert(view.includes("event?.scoreVisibility!=='PARTIAL'")&&view.includes('visibleBeats*g.beatWidth'),'UI masks the score from the configured beat boundary');
assert(view.includes("event.flowAction==='RECALL'?'後半は思い出して'"),'learner-facing Recall copy stays experiential and minimal');

// Form progression must still require cold-transfer evidence in addition to Recall.
assert(!cBluesStageReady({'g-to-f-surfaces':record}),'FLOW alone cannot bypass the C Blues cold-transfer gate');
assert(recommendedFormIdForStage14({'g-to-f-surfaces':record})==='c-blues-12','Recall without I/IV/V cold evidence does not skip to Rhythm Changes');

console.log('OK: Recall hides only the final two bars while the full four-bar target, form harmony and scoring window remain intact');

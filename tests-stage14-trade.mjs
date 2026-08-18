import fs from 'node:fs';
import {musicalFormById} from './src/curriculum/musicalForms.js';
import {buildClosingTradeEvent} from './src/curriculum/flow.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesConnectReady,cBluesTradeReady,cBluesRecallReady} from './src/curriculum/mastery.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const blues=musicalFormById('c-blues-12'),program=blues.closingFlowProgram;
assert(program.tradeCallVariantId==='gf-cell-fan'&&program.tradeResponseVariantId==='gf-cell-return','TRADE reuses two already-known Stage 7 variants');
assert(program.tradeCallVariantId!==program.tradeResponseVariantId,'TRADE is a musical call and response, not a blind echo-copy task');

const trade=buildClosingTradeEvent({musicalForm:blues,startBeat:272,endBeat:288,key:'C',bpm:60,eventId:'trade-test'});
assert(trade.presentationMode==='FLOW'&&trade.flowAction==='TRADE','TRADE is a FLOW presentation rather than a new Variant');
assert(trade.variantId===null&&trade.familyId==='g-to-f-surfaces','TRADE preserves Phrase Family identity without fabricating a composite Variant');
assert(trade.modelPolicy==='TRADE_CALL'&&trade.morphPolicy==='NONE','TRADE has a deliberate model call but no theory/Morph scaffold');
assert(trade.modelStartBeat===272&&trade.modelEndBeat===276,'model occupies one four-beat musical call slot');
assert(trade.prepareBeat===276&&trade.singStartBeat===280&&trade.singEndBeat===284&&trade.endBeat===288,'call is followed by four beats to see/audiate, four beats to answer, then four beats of space');
assert(trade.singStartBeat-trade.prepareBeat===4,'TRADE preserves a silent audiation window after the model instead of asking for immediate imitation');
assert(trade.modelScoreModel.sourceVariantId==='gf-cell-fan'&&trade.scoreModel.sourceVariantId==='gf-cell-return','call and response score models retain their known source Variant identities');
assert(trade.modelScoreModel.harmonyTimeline[0].chord==='G7','call sounds in the actual bar-9 Blues dominant context');
assert(trade.scoreModel.harmonyTimeline[0].chord==='C7','user reads the response in the actual bar-11 tonic context');
assert(trade.scoreVisibility==='FULL'&&trade.visibleBeats===4,'TRADE response remains ordinary fully visible staff notation');
assert(!('analysisPrompt' in trade)&&!('cellQuestion' in trade)&&!('nameTheChord' in trade),'TRADE never turns internal grammar into a learner theory task');
createTimeline({events:[trade],totalBeats:288}).validate();

const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:7,harmonyContext:'C7',harmonyFieldId:'form:c-blues-12:flow'};
let record=emptyFamilyMastery();
record=applyEventResult(record,{...flowBase,flowAction:'CONNECT'},{readScore:88,stars:4},1000);
const connectEvidence={'g-to-f-surfaces':record};
assert(cBluesConnectReady(connectEvidence)&&!cBluesTradeReady(connectEvidence),'successful Connect unlocks Trade but is not Trade evidence itself');
const plan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:connectEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
const closing=plan.events.at(-1);
assert(closing.flowAction==='TRADE'&&closing.modelPolicy==='TRADE_CALL','normal Scheduler inserts TRADE after successful Connect');
assert(closing.startBeat===272&&closing.endBeat===288,'TRADE replaces only the final 16-beat field and keeps the session on its form boundary');
assert(plan.events.at(-2).endBeat===closing.startBeat&&plan.totalBeats===288,'TRADE introduces no timing gap and does not extend the session');
createTimeline(plan).validate();

record=applyEventResult(record,closing,{readScore:86,stars:4},2000);
const tradeEvidence={'g-to-f-surfaces':record};
assert(cBluesTradeReady(tradeEvidence),'successful TRADE is recorded as separate FLOW evidence');
assert(!cBluesRecallReady(tradeEvidence),'Connect + Trade does not silently count as the later Recall step');
assert(record.flowActions.join(',')==='CONNECT,TRADE','FLOW history preserves Connect → Trade order');
assert(record.coldReadAttempts===0&&record.coldVariantIds.length===0&&record.seenVariantIds.length===0,'TRADE does not create fake cold-read or Variant mastery');
const nextPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:tradeEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
assert(nextPlan.events.at(-1).flowAction==='RECALL','after successful Trade the next closing FLOW advances to Recall');

const debugPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'TRADE'});
assert(debugPlan.totalBeats===48&&debugPlan.events.at(-1).flowAction==='TRADE','debug harness can expose TRADE in one C Blues chorus');
assert(debugPlan.events.at(-1).startBeat===32&&debugPlan.events.at(-1).singStartBeat===40,'one-chorus debug TRADE uses the same call/audiate/response timing contract');
createTimeline(debugPlan).validate();

const engine=fs.readFileSync(new URL('./src/session/engine.js',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
assert(engine.includes('event.modelScoreModel || event.scoreModel'),'engine can schedule a distinct TRADE call while scoring the visible response phrase');
assert(view.includes("event.flowAction==='TRADE'?'聴いて、返す'"),'learner-facing TRADE copy stays experiential and minimal');
assert(player.includes("['CONNECT','TRADE','RECALL','ONE_CHORUS']"),'debug harness keeps TRADE available while adding the later one-chorus state');

console.log('OK: Stage 14 TRADE is a four-beat call → silent audiate/read → four-beat staff response, reusing known material inside the continuous C Blues form');

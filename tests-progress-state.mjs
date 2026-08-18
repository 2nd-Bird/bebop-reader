import fs from 'node:fs';
import {emptyFamilyMastery,applyEventResult,nextCBluesFlowAction,cBluesStageReady} from './src/curriculum/mastery.js';
import {defaultKeyProgress,normalizeKeyProgress} from './src/storage-v3.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};

const expected=['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS'];
const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:10,harmonyContext:'F7',harmonyFieldId:'form:c-blues-12:flow'};
let record=emptyFamilyMastery(),mastery={};
for(const [i,action] of expected.entries()){
  assert(nextCBluesFlowAction(mastery)===action,`shared progression exposes ${action} as the next C Blues FLOW action`);
  const plan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:mastery,bpm:60,eventCount:24,targetSessionBeats:320});
  assert(plan.events.at(-1).flowAction===action,`Scheduler consumes the same shared progression at ${action}`);
  record=applyEventResult(record,{...flowBase,flowAction:action},{readScore:90-i,stars:4},1000+i);mastery={'g-to-f-surfaces':record};
}
assert(nextCBluesFlowAction(mastery)===null,'shared progression reports no remaining implemented C Blues FLOW after one chorus');
assert(!cBluesStageReady(mastery),'FLOW completion alone still does not bypass the separate cold-form transfer gate');

const base=defaultKeyProgress();
assert(base.C.unlocked===true&&base.F.unlocked===false&&base.Bb.unlocked===false,'key progress has an explicit C/F/B-flat axis with no invented unlock');
const migrated=normalizeKeyProgress({F:{unlocked:true}});
assert(migrated.C.unlocked===true&&migrated.F.unlocked===true&&migrated.Bb.unlocked===false,'stored F unlock can be displayed without implicitly opening B-flat');
const booleanLegacy=normalizeKeyProgress({C:false,F:true,Bb:true});
assert(booleanLegacy.C.unlocked===true&&booleanLegacy.F.unlocked===true&&booleanLegacy.Bb.unlocked===true,'normalizer accepts simple historical booleans while C can never become locked');

const dashboard=fs.readFileSync(new URL('./src/ui/dashboardV09.js',import.meta.url),'utf8');
const scheduler=fs.readFileSync(new URL('./src/curriculum/scheduler.js',import.meta.url),'utf8');
assert(dashboard.includes("REPEAT:'同じ動きを2小節続ける'")&&dashboard.includes("ONE_CHORUS:'1コーラスを読み切る'"),'dashboard copy covers the full implemented FLOW sequence rather than Connect/Recall only');
assert(dashboard.includes('nextCBluesFlowAction')&&!dashboard.includes('cBluesConnectReady'),'dashboard reads the shared FLOW state instead of maintaining a stale binary progression');
assert(dashboard.includes('KEY UNLOCK')&&dashboard.includes("['C','F','Bb']"),'Progress renders Key Unlock as a separate C/F/B-flat axis');
assert(scheduler.includes("nextCBluesFlowAction(familyMastery)||'ONE_CHORUS'"),'Scheduler and dashboard share one next-FLOW authority');

console.log('OK: Dashboard/Scheduler share the canonical implemented C Blues FLOW state, while Progress shows a separate normalized C/F/B-flat key axis without inventing unlock thresholds');

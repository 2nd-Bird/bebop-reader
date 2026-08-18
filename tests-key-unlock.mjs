import fs from 'node:fs';
import {familyById} from './src/curriculum/phraseFamilyRegistry.js';
import {variantById} from './src/curriculum/variantRegistry.js';
import {emptyFamilyMastery,applyEventResult,isFamilyMastered,schedulerSignals} from './src/curriculum/mastery.js';
import {defaultKeyProgress,deriveKeyProgress,applyKeyTransferResult,isKeyFamilyTransferred,nextKeyTransferRequest,FOUNDATION_TRANSFER_FAMILY_IDS} from './src/curriculum/keyMastery.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {createTimeline} from './src/session/timeline.js';
import {saveStateV3,loadStateV3,beginSessionV3,recordSessionEventV3,storageKeyV3} from './src/storage-v3.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const coldIds=familyId=>familyById(familyId).variants.filter(id=>variantById(id)?.coldReadEligible!==false);
const masterFamily=familyId=>{
 let record=emptyFamilyMastery();
 for(const [i,variantId] of coldIds(familyId).entries())record=applyEventResult(record,{familyId,variantId,presentationMode:'COLD_READ',harmonyFieldId:'static-c'},{readScore:95,stars:5},1000+i);
 assert(isFamilyMastered(record,familyId),`${familyId}: C Family mastery fixture is valid`);return record;
};
const transferEvent=(key,familyId,variantId)=>({familyId,variantId,key,sourceKey:'C',keyTransfer:true,presentationMode:'COLD_READ',harmonyFieldId:`static-c@key:${key}`});

let progress=defaultKeyProgress();
assert(progress.C.unlocked&&!progress.F.unlocked&&!progress.Bb.unlocked,'key axis starts C-only');
progress=deriveKeyProgress(progress,{stageProgress:{currentStage:3},familyMastery:{}});
assert(!progress.F.unlocked,'Stage 3 in progress does not unlock F');
progress=deriveKeyProgress(progress,{stageProgress:{currentStage:4},familyMastery:{}});
assert(progress.F.unlocked&&!progress.Bb.unlocked,'completing C Stage 3 globally unlocks F but not B-flat');

const familyMastery={};
for(const id of FOUNDATION_TRANSFER_FAMILY_IDS)familyMastery[id]=masterFamily(id);
const request=nextKeyTransferRequest({keyProgress:progress,familyMastery,currentStage:4});
assert(request?.key==='F'&&request.keyTransfer===true,'normal key review first requests F');
assert(request.mode==='COLD_READ'&&request.family.familyId==='anchor-do-sol','transfer is scaffold-free and starts from mastered foundation material');
assert(request.variant.familyId===request.family.familyId,'target key does not fabricate a new Phrase Variant identity');

const anchorIds=coldIds('anchor-do-sol');
let anchorProgress=progress;
anchorProgress=applyKeyTransferResult(anchorProgress,transferEvent('F','anchor-do-sol',anchorIds[0]),{readScore:90,stars:4},'session-a',2000);
assert(!isKeyFamilyTransferred(anchorProgress,'F','anchor-do-sol'),'one successful transfer Session is not mastery');
anchorProgress=applyKeyTransferResult(anchorProgress,transferEvent('F','anchor-do-sol',anchorIds[1]||anchorIds[0]),{readScore:90,stars:4},'session-a',2100);
assert(!isKeyFamilyTransferred(anchorProgress,'F','anchor-do-sol'),'two Variants inside one Session are still not retained transfer mastery');
anchorProgress=applyKeyTransferResult(anchorProgress,transferEvent('F','anchor-do-sol',anchorIds[1]||anchorIds[0]),{readScore:77,stars:4},'session-b',2200);
assert(!isKeyFamilyTransferred(anchorProgress,'F','anchor-do-sol'),'readScore below 78 does not count');
anchorProgress=applyKeyTransferResult(anchorProgress,transferEvent('F','anchor-do-sol',anchorIds[1]||anchorIds[0]),{readScore:90,stars:4},'session-b',2300);
assert(isKeyFamilyTransferred(anchorProgress,'F','anchor-do-sol'),'two distinct successful Sessions plus Variant coverage establish F transfer mastery');

let allF=progress;
for(const familyId of FOUNDATION_TRANSFER_FAMILY_IDS){
 const ids=coldIds(familyId),first=ids[0],second=ids[1]||ids[0];
 allF=applyKeyTransferResult(allF,transferEvent('F',familyId,first),{readScore:92,stars:4},`${familyId}-f-1`,3000);
 allF=applyKeyTransferResult(allF,transferEvent('F',familyId,second),{readScore:92,stars:4},`${familyId}-f-2`,4000);
 assert(isKeyFamilyTransferred(allF,'F',familyId),`${familyId}: F transfer mastery reaches the canonical two-session gate`);
}
allF=deriveKeyProgress(allF,{stageProgress:{currentStage:4},familyMastery});
assert(allF.Bb.unlocked,'B-flat opens only after all five foundation Families are stable in F');
const bbRequest=nextKeyTransferRequest({keyProgress:allF,familyMastery,currentStage:4});
assert(bbRequest?.key==='Bb'&&bbRequest.family.familyId==='anchor-do-sol','after global B-flat unlock, per-Family C→F→B-flat ordering begins on known material');

const normalPlan=buildDailySessionPlan({currentStage:4,key:'C',bpm:60,eventCount:20,targetSessionBeats:320,familyMastery,keyProgress:progress});
createTimeline(normalPlan).validate();
const transfers=normalPlan.events.filter(e=>e.keyTransfer);
assert(normalPlan.key==='C'&&transfers.length===1,'a normal C Session contains at most one target-key transfer Event');
const transfer=transfers[0];
assert(transfer.key==='F'&&transfer.sourceKey==='C','transfer Event alone moves to F while the Session base remains C');
assert(transfer.presentationMode==='COLD_READ'&&transfer.modelPolicy==='NONE'&&transfer.morphPolicy==='NONE','production key transfer is scaffold-free, with no Teacher Call or BUILD');
assert(transfer.scoreModel.key==='F'&&transfer.scoreModel.sourceKey==='C','visible notation and scoring model use the transferred key');
assert(transfer.harmonyFieldId.endsWith('@key:F')&&transfer.harmonyContext==='F','event harmony/tonal orientation moves with the ordinary staff');
assert(normalPlan.events.filter(e=>!e.keyTransfer).every(e=>e.key==='C'),'other Learning Events stay in the source C curriculum world');
assert(normalPlan.keyTransferEventId===transfer.eventId,'Session Plan exposes the one inserted transfer slot without making it the session key');

const stage14Plan=buildDailySessionPlan({currentStage:14,key:'C',formId:'c-blues-12',bpm:60,eventCount:12,targetSessionBeats:192,familyMastery,keyProgress:progress});
createTimeline(stage14Plan).validate();
assert(!stage14Plan.events.some(e=>e.keyTransfer),'key review never switches key inside a C Blues / Rhythm Changes form session');

// Storage: transferred reads update only keyProgress, never C Family/Variant mastery.
const memory=new Map();
globalThis.localStorage={getItem:key=>memory.has(key)?memory.get(key):null,setItem:(key,value)=>memory.set(key,String(value)),removeItem:key=>memory.delete(key),clear:()=>memory.clear()};
const anchorMastery=masterFamily('anchor-do-sol'),storageProgress=deriveKeyProgress(defaultKeyProgress(),{stageProgress:{currentStage:4},familyMastery:{'anchor-do-sol':anchorMastery}});
saveStateV3({version:3,familyMastery:{'anchor-do-sol':anchorMastery},variantHistory:{},stageProgress:{currentStage:4,unlockedStages:[0,1,2,3,4],advanced:false},keyProgress:storageProgress,reviewQueue:[],streak:0,lastPracticeDate:null,totalSessions:0,settings:{solfege:false,preferredBpm:72,latencyMs:0},currentSession:null,lastSessionResult:null});
beginSessionV3({sessionId:'storage-transfer-1',stage:4,key:'C',focusFamilyIds:[]});
const attemptsBefore=loadStateV3().familyMastery['anchor-do-sol'].attempts;
recordSessionEventV3(transferEvent('F','anchor-do-sol',anchorIds[0]),{readScore:91,stars:4});
const stored=loadStateV3();
assert(stored.familyMastery['anchor-do-sol'].attempts===attemptsBefore,'F transfer evidence does not fabricate a C Family attempt');
assert(Object.keys(stored.variantHistory).length===0,'F transfer evidence does not fabricate C Variant history');
assert(stored.keyProgress.F.families['anchor-do-sol'].successfulSessionIds.includes('storage-transfer-1'),'transfer evidence is persisted under the separate Key axis');

// Existing saved users already beyond Stage 3 receive the F world on hydration without replaying a C session.
localStorage.setItem(storageKeyV3,JSON.stringify({version:3,familyMastery:{},variantHistory:{},stageProgress:{currentStage:4,unlockedStages:[0,1,2,3,4]},keyProgress:{C:{unlocked:true}},reviewQueue:[],settings:{}}));
assert(loadStateV3().keyProgress.F.unlocked,'state migration/hydration derives F unlock from already-completed Stage 3 progress');
assert(schedulerSignals({familyMastery,keyProgress:progress}).keyProgress.F.unlocked,'Scheduler signals carry the separate Key axis');

const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
const dashboard=fs.readFileSync(new URL('./src/ui/dashboardV09.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(view.includes('activeKey=event?.key||key')&&view.includes('keyPill.textContent=labelForKey(activeKey)'),'session UI follows the Event key instead of hard-coding the Session key');
assert(dashboard.includes("progress?.[key]?.unlocked")&&dashboard.includes("unlocked?'OPEN':'LOCKED'"),'Home/Progress key worlds follow persisted unlock state');
assert(sw.includes("'./src/curriculum/keyMastery.js'"),'PWA cache contains Key Unlock mastery runtime');

console.log('OK: production Key Unlock remains a separate axis: Stage 3 opens F, retained F foundation transfer opens B-flat, and normal sessions insert one scaffold-free transferred read without contaminating C Stage/Family mastery');

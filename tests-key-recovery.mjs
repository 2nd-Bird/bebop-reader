import {scheduleDelayedRetry} from './src/curriculum/recovery.js';
import {beginSessionV3,loadStateV3,recordSessionEventV3,saveStateV3,storageKeyV3} from './src/storage-v3.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};

const missed={
  eventId:'event-01',familyId:'anchor-do-sol',variantId:'anchor-cg-01',key:'F',sourceKey:'C',keyTransfer:true,
  sourceHarmonyFieldId:'static-c',sourceHarmonyContext:'C',harmonyFieldId:'static-c@key:F',harmonyContext:'F',harmonyTimeline:[{beat:0,chord:'F'}],tonalFieldId:null,
  startBeat:0,singStartBeat:8,singEndBeat:12,endBeat:16,presentationMode:'COLD_READ',modelPolicy:'NONE',morphPolicy:'NONE',
  scoreModel:{id:'anchor-cg-01-f',sourceVariantId:'anchor-cg-01',key:'F',sourceKey:'C',totalBeats:4,notes:[{pitch:'F4',midi:65,startBeat:0,duration:2},{pitch:'C5',midi:72,startBeat:2,duration:2}]},
};
const filler=(id,start,familyId='do-sol-in-time')=>({eventId:id,familyId,variantId:'do-sol-q-01',key:'C',sourceKey:'C',keyTransfer:false,startBeat:start,singStartBeat:start+8,singEndBeat:start+12,endBeat:start+16,presentationMode:'COLD_READ',modelPolicy:'NONE',morphPolicy:'NONE',scoreModel:{totalBeats:4}});
const target=filler('event-04',48,'anchor-do-sol');
const events=[missed,filler('event-02',16),filler('event-03',32),target];
const retry=scheduleDelayedRetry(events,missed);

assert(retry===target,'delayed recovery reuses a later compatible event slot');
assert(retry.presentationMode==='DELAYED_READ'&&retry.retryOfEventId===missed.eventId,'retry remains the canonical delayed-read recovery');
assert(retry.key==='F'&&retry.sourceKey==='C'&&retry.keyTransfer===true,'retry preserves F key-transfer identity instead of falling back to C');
assert(retry.sourceHarmonyFieldId==='static-c'&&retry.sourceHarmonyContext==='C','retry preserves canonical C-source harmony identity');
assert(retry.harmonyFieldId==='static-c@key:F'&&retry.harmonyContext==='F'&&retry.harmonyTimeline[0].chord==='F','retry preserves sounding F harmony');
assert(retry.scoreModel===missed.scoreModel&&retry.scoreModel.key==='F','retry scores the same transferred ordinary-staff target');

saveStateV3({stageProgress:{currentStage:4,unlockedStages:[0,1,2,3,4],advanced:false},familyMastery:{},variantHistory:{},keyProgress:{C:{unlocked:true,families:{}},F:{unlocked:true,families:{}},Bb:{unlocked:false,families:{}}}});
beginSessionV3({sessionId:'recovery-session',stage:4,key:'C',focusFamilyIds:['anchor-do-sol']});
recordSessionEventV3(retry,{readScore:90,stars:4,pitch:90,time:90,flow:90});
const state=loadStateV3(),evidence=state.keyProgress.F.families['anchor-do-sol'];
assert(evidence?.successfulSessionIds?.includes('recovery-session')&&evidence?.successfulVariantIds?.includes('anchor-cg-01'),'successful F delayed retry records F transfer evidence');
assert(!state.familyMastery['anchor-do-sol']&&!state.variantHistory['anchor-cg-01'],'F delayed retry does not contaminate C Family or Variant mastery');
assert(localStorage.getItem(storageKeyV3),'recovery result remains persisted in storage v3');

console.log('OK: delayed recovery preserves transferred key/source harmony identity and records only key-transfer mastery');

import {applyEventResult,deriveStageProgress} from './curriculum/mastery.js';
import {STAGES} from './curriculum/stages.js';
const KEY='bebop-reader-state-v3',LEGACY_KEY='bebop-reader-state-v2';
const defaults={version:3,familyMastery:{},variantHistory:{},stageProgress:{currentStage:0,unlockedStages:[0],advanced:false},keyProgress:{C:{unlocked:true}},reviewQueue:[],streak:0,lastPracticeDate:null,totalSessions:0,settings:{solfege:false,preferredBpm:72,latencyMs:0},currentSession:null,lastSessionResult:null,migratedFromV2:false};
const clone=x=>JSON.parse(JSON.stringify(x));
export function migrateV2State(v2={}){return{...clone(defaults),streak:Number(v2.streak)||0,lastPracticeDate:v2.lastPracticeDate||null,settings:{...defaults.settings,...(v2.settings||{})},migratedFromV2:true};}
export function loadStateV3(){
 try{
  const saved=localStorage.getItem(KEY);if(saved){const raw=JSON.parse(saved);return{...clone(defaults),...raw,settings:{...defaults.settings,...(raw.settings||{})},stageProgress:{...defaults.stageProgress,...(raw.stageProgress||{})}};}
  const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'{}'),migrated=migrateV2State(legacy);saveStateV3(migrated);return migrated;
 }catch{return clone(defaults);}
}
export function saveStateV3(state){localStorage.setItem(KEY,JSON.stringify(state));}
export function mutateV3(fn){const s=loadStateV3();fn(s);saveStateV3(s);return s;}
const todayTokyo=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function rebuildReviewQueue(s){s.reviewQueue=Object.entries(s.familyMastery||{}).filter(([,r])=>r?.dueAt).map(([familyId,r])=>({familyId,dueAt:r.dueAt,reason:r.coldReadAttempts<2?'cold-read':'spaced-review'})).sort((a,b)=>a.dueAt-b.dueAt);}
export function beginSessionV3(plan){return mutateV3(s=>{s.currentSession={sessionId:plan.sessionId,startedAt:Date.now(),stage:plan.stage??s.stageProgress.currentStage,key:plan.key,focusFamilyIds:plan.focusFamilyIds||[],musicalFormId:plan.musicalFormId||null};});}
export function recordSessionEventV3(event,result){return mutateV3(s=>{
 const now=Date.now(),id=event.familyId;if(id)s.familyMastery[id]=applyEventResult(s.familyMastery[id],event,result,now);
 if(event.variantId){const v=s.variantHistory[event.variantId]||{attempts:0};s.variantHistory[event.variantId]={...v,attempts:v.attempts+1,lastSeenAt:now,lastMode:event.presentationMode,lastReadScore:result.readScore??null,lastStars:result.stars??0};}
 rebuildReviewQueue(s);
 });}
export function completeSessionV3(plan,summary){return mutateV3(s=>{
 const today=todayTokyo();if(s.lastPracticeDate!==today){if(s.lastPracticeDate){const d=(new Date(today)-new Date(s.lastPracticeDate))/86400000;s.streak=d===1?s.streak+1:1;}else s.streak=1;s.lastPracticeDate=today;}
 s.totalSessions=(s.totalSessions||0)+1;s.lastSessionResult={...summary,sessionId:plan.sessionId,completedAt:Date.now(),focusFamilyIds:plan.focusFamilyIds||[],musicalFormId:plan.musicalFormId||null};s.currentSession=null;s.stageProgress=deriveStageProgress(s.familyMastery,s.stageProgress.currentStage,STAGES.length-1);rebuildReviewQueue(s);
 });}
export const storageKeyV3=KEY;

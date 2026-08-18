import {familiesForStage,familyById} from './phraseFamilyRegistry.js';
import {variantById} from './variantRegistry.js';
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const emptyFamilyMastery=()=>({familyId:null,reading:0,coldRead:0,flowRead:0,attempts:0,coldReadAttempts:0,flowAttempts:0,successes:0,lastSeenAt:null,lastColdReadAt:null,lastFlowAt:null,dueAt:null,seenVariantIds:[],coldVariantIds:[],coldHarmonyFieldIds:[],coldVariantHarmonyKeys:[],coldFormIds:[],coldFormContextKeys:[],coldFormPositionKeys:[],flowFormIds:[],flowActions:[]});
const qualityOf=r=>clamp(((r?.readScore??(.7*(r?.pitch||0)+.2*(r?.flow||0)+.1*(r?.time||0)))/100));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
export function applyEventResult(record,event,result,now=Date.now()){
 const prev={...emptyFamilyMastery(),...(record||{})},q=qualityOf(result),cold=['COLD_READ','DELAYED_READ'].includes(event?.presentationMode),flow=event?.presentationMode==='FLOW';
 const attempts=prev.attempts+1,reading=prev.attempts?prev.reading*.72+q*.28:q;
 let coldRead=prev.coldRead,coldReadAttempts=prev.coldReadAttempts,lastColdReadAt=prev.lastColdReadAt;
 let flowRead=prev.flowRead,flowAttempts=prev.flowAttempts,lastFlowAt=prev.lastFlowAt,flowFormIds=uniq(prev.flowFormIds||[]),flowActions=uniq(prev.flowActions||[]);
 const seenVariantIds=uniq([...(prev.seenVariantIds||[]),event?.variantId]);
 let coldVariantIds=uniq(prev.coldVariantIds||[]),coldHarmonyFieldIds=uniq(prev.coldHarmonyFieldIds||[]),coldVariantHarmonyKeys=uniq(prev.coldVariantHarmonyKeys||[]),coldFormIds=uniq(prev.coldFormIds||[]),coldFormContextKeys=uniq(prev.coldFormContextKeys||[]),coldFormPositionKeys=uniq(prev.coldFormPositionKeys||[]);
 if(cold){
  coldRead=prev.coldReadAttempts?prev.coldRead*.62+q*.38:q;coldReadAttempts++;lastColdReadAt=now;coldVariantIds=uniq([...coldVariantIds,event?.variantId]);
  if(event?.harmonyFieldId)coldHarmonyFieldIds=uniq([...coldHarmonyFieldIds,event.harmonyFieldId]);
  if(event?.variantId&&event?.harmonyFieldId)coldVariantHarmonyKeys=uniq([...coldVariantHarmonyKeys,`${event.variantId}@${event.harmonyFieldId}`]);
  if(q>=.78&&event?.formTransfer&&event?.form){
   coldFormIds=uniq([...coldFormIds,event.form]);
   if(event?.harmonyContext)coldFormContextKeys=uniq([...coldFormContextKeys,`${event.form}@${event.familyId}@${event.harmonyContext}`]);
   if(Number.isFinite(event?.formPosition))coldFormPositionKeys=uniq([...coldFormPositionKeys,`${event.form}@${event.familyId}@${event.formPosition}`]);
  }
 }
 if(flow){
  flowRead=prev.flowAttempts?prev.flowRead*.62+q*.38:q;flowAttempts++;lastFlowAt=now;
  if(q>=.7&&event?.form)flowFormIds=uniq([...flowFormIds,event.form]);
  if(q>=.7&&event?.flowAction)flowActions=uniq([...flowActions,event.flowAction]);
 }
 const basis=cold?coldRead:flow?flowRead:reading,days=basis<.6?1:basis<.78?2:basis<.9?4:7;
 return{...prev,familyId:event?.familyId||prev.familyId,reading:clamp(reading),coldRead:clamp(coldRead),flowRead:clamp(flowRead),attempts,coldReadAttempts,flowAttempts,successes:prev.successes+(result?.stars>=3?1:0),lastSeenAt:now,lastColdReadAt,lastFlowAt,dueAt:now+days*86400000,seenVariantIds,coldVariantIds,coldHarmonyFieldIds,coldVariantHarmonyKeys,coldFormIds,coldFormContextKeys,coldFormPositionKeys,flowFormIds,flowActions};
}
function requiredColdVariants(familyId){
 const family=familyById(familyId);if(!family)return[];
 return family.variants.filter(id=>variantById(id)?.coldReadEligible!==false);
}
export function isFamilyMastered(r,familyId=r?.familyId){
 if(!r)return false;
 const family=familyById(familyId),required=requiredColdVariants(familyId),coldSet=new Set(r.coldVariantIds||[]),variantCoverage=required.length?required.every(id=>coldSet.has(id)):r.coldReadAttempts>=2;
 const requiredHarmony=family?.requiredColdHarmonyFieldIds||[],harmonySet=new Set(r.coldHarmonyFieldIds||[]),harmonyCoverage=requiredHarmony.every(id=>harmonySet.has(id));
 const requiredPairs=family?.requiredColdVariantHarmonyKeys||[],pairSet=new Set(r.coldVariantHarmonyKeys||[]),pairCoverage=requiredPairs.every(key=>pairSet.has(key));
 const minimum=Math.max(2,required.length,requiredPairs.length);
 return variantCoverage&&harmonyCoverage&&pairCoverage&&r.coldReadAttempts>=minimum&&r.coldRead>=.78&&r.reading>=.75;
}
export function hasColdFormContext(record,formId,familyId,harmonyContext){return new Set(record?.coldFormContextKeys||[]).has(`${formId}@${familyId}@${harmonyContext}`);}
export function cBluesFormReady(familyMastery={}){
 const familyIds=['g-to-f-surfaces','density-g-to-f'],contexts=['C7','F7','G7'];
 return familyIds.every(familyId=>contexts.every(chord=>hasColdFormContext(familyMastery?.[familyId], 'c-blues-12', familyId, chord)));
}
export function hasFlowAction(record,formId,action,minFlow=.7){return Boolean(record?.flowRead>=minFlow&&new Set(record?.flowFormIds||[]).has(formId)&&new Set(record?.flowActions||[]).has(action));}
export function cBluesRepeatReady(familyMastery={}){return hasFlowAction(familyMastery?.['g-to-f-surfaces'],'c-blues-12','REPEAT');}
export function cBluesMutationReady(familyMastery={}){const r=familyMastery?.['g-to-f-surfaces'];return cBluesRepeatReady(familyMastery)&&hasFlowAction(r,'c-blues-12','MUTATION');}
export function cBluesConnectReady(familyMastery={}){const r=familyMastery?.['g-to-f-surfaces'];return cBluesMutationReady(familyMastery)&&hasFlowAction(r,'c-blues-12','CONNECT');}
export function cBluesTradeReady(familyMastery={}){const r=familyMastery?.['g-to-f-surfaces'];return cBluesConnectReady(familyMastery)&&hasFlowAction(r,'c-blues-12','TRADE');}
export function cBluesRecallReady(familyMastery={}){const r=familyMastery?.['g-to-f-surfaces'];return cBluesTradeReady(familyMastery)&&hasFlowAction(r,'c-blues-12','RECALL');}
export function cBluesOneChorusReady(familyMastery={}){const r=familyMastery?.['g-to-f-surfaces'];return cBluesRecallReady(familyMastery)&&hasFlowAction(r,'c-blues-12','ONE_CHORUS');}
export function cBluesStageReady(familyMastery={}){return cBluesFormReady(familyMastery)&&cBluesOneChorusReady(familyMastery);}
export function deriveStageProgress(familyMastery,currentStage=0,maxStage=3){
 let stage=clamp(Number(currentStage)||0,0,maxStage),advanced=false;
 const required=familiesForStage(stage);
 if(required.length&&required.every(f=>isFamilyMastered(familyMastery?.[f.familyId],f.familyId))&&stage<maxStage){stage++;advanced=true;}
 return{currentStage:stage,unlockedStages:Array.from({length:stage+1},(_,i)=>i),advanced};
}
export function schedulerSignals(state,now=Date.now()){
 const mastery=state?.familyMastery||{};
 const dueFromQueue=(state?.reviewQueue||[]).filter(x=>!x.dueAt||x.dueAt<=now).map(x=>x.familyId);
 const dueFromMastery=Object.entries(mastery).filter(([,r])=>r?.dueAt&&r.dueAt<=now).map(([id])=>id);
 const weakFamilyIds=Object.entries(mastery).filter(([,r])=>r?.attempts>0&&(r.reading<.68||r.coldReadAttempts>0&&r.coldRead<.68)).map(([id])=>id);
 return{dueFamilyIds:[...new Set([...dueFromQueue,...dueFromMastery])],weakFamilyIds:[...new Set(weakFamilyIds)],familyMastery:mastery};
}

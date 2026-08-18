import {familiesForStage,familyById} from './phraseFamilies.js';
import {variantById} from './variants.js';
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const emptyFamilyMastery=()=>({familyId:null,reading:0,coldRead:0,attempts:0,coldReadAttempts:0,successes:0,lastSeenAt:null,lastColdReadAt:null,dueAt:null,seenVariantIds:[],coldVariantIds:[],coldHarmonyFieldIds:[],coldVariantHarmonyKeys:[]});
const qualityOf=r=>clamp(((r?.readScore??(.7*(r?.pitch||0)+.2*(r?.flow||0)+.1*(r?.time||0)))/100));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
export function applyEventResult(record,event,result,now=Date.now()){
 const prev={...emptyFamilyMastery(),...(record||{})},q=qualityOf(result),cold=['COLD_READ','DELAYED_READ'].includes(event?.presentationMode);
 const attempts=prev.attempts+1,reading=prev.attempts?prev.reading*.72+q*.28:q;
 let coldRead=prev.coldRead,coldReadAttempts=prev.coldReadAttempts,lastColdReadAt=prev.lastColdReadAt;
 const seenVariantIds=uniq([...(prev.seenVariantIds||[]),event?.variantId]);
 let coldVariantIds=uniq(prev.coldVariantIds||[]),coldHarmonyFieldIds=uniq(prev.coldHarmonyFieldIds||[]),coldVariantHarmonyKeys=uniq(prev.coldVariantHarmonyKeys||[]);
 if(cold){
  coldRead=prev.coldReadAttempts?prev.coldRead*.62+q*.38:q;coldReadAttempts++;lastColdReadAt=now;coldVariantIds=uniq([...coldVariantIds,event?.variantId]);
  if(event?.harmonyFieldId)coldHarmonyFieldIds=uniq([...coldHarmonyFieldIds,event.harmonyFieldId]);
  if(event?.variantId&&event?.harmonyFieldId)coldVariantHarmonyKeys=uniq([...coldVariantHarmonyKeys,`${event.variantId}@${event.harmonyFieldId}`]);
 }
 const basis=cold?coldRead:reading,days=basis<.6?1:basis<.78?2:basis<.9?4:7;
 return{...prev,familyId:event?.familyId||prev.familyId,reading:clamp(reading),coldRead:clamp(coldRead),attempts,coldReadAttempts,successes:prev.successes+(result?.stars>=3?1:0),lastSeenAt:now,lastColdReadAt,dueAt:now+days*86400000,seenVariantIds,coldVariantIds,coldHarmonyFieldIds,coldVariantHarmonyKeys};
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

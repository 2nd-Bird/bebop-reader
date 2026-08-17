import {familiesForStage} from './phraseFamilies.js';
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const emptyFamilyMastery=()=>({reading:0,coldRead:0,attempts:0,coldReadAttempts:0,successes:0,lastSeenAt:null,lastColdReadAt:null,dueAt:null});
const qualityOf=r=>clamp(((r?.readScore??(.7*(r?.pitch||0)+.2*(r?.flow||0)+.1*(r?.time||0)))/100));
export function applyEventResult(record,event,result,now=Date.now()){
 const prev={...emptyFamilyMastery(),...(record||{})},q=qualityOf(result),cold=['COLD_READ','DELAYED_READ'].includes(event?.presentationMode);
 const attempts=prev.attempts+1,reading=prev.attempts?prev.reading*.72+q*.28:q;
 let coldRead=prev.coldRead,coldReadAttempts=prev.coldReadAttempts,lastColdReadAt=prev.lastColdReadAt;
 if(cold){coldRead=prev.coldReadAttempts?prev.coldRead*.62+q*.38:q;coldReadAttempts++;lastColdReadAt=now;}
 const basis=cold?coldRead:reading,days=basis<.6?1:basis<.78?2:basis<.9?4:7;
 return{...prev,reading:clamp(reading),coldRead:clamp(coldRead),attempts,coldReadAttempts,successes:prev.successes+(result?.stars>=3?1:0),lastSeenAt:now,lastColdReadAt,dueAt:now+days*86400000};
}
export const isFamilyMastered=r=>!!r&&r.coldReadAttempts>=2&&r.coldRead>=.78&&r.reading>=.75;
export function deriveStageProgress(familyMastery,currentStage=0,maxStage=3){
 let stage=clamp(Number(currentStage)||0,0,maxStage),advanced=false;
 const required=familiesForStage(stage);
 if(required.length&&required.every(f=>isFamilyMastered(familyMastery?.[f.familyId]))&&stage<maxStage){stage++;advanced=true;}
 return{currentStage:stage,unlockedStages:Array.from({length:stage+1},(_,i)=>i),advanced};
}
export function schedulerSignals(state,now=Date.now()){
 const mastery=state?.familyMastery||{};
 const dueFromQueue=(state?.reviewQueue||[]).filter(x=>!x.dueAt||x.dueAt<=now).map(x=>x.familyId);
 const dueFromMastery=Object.entries(mastery).filter(([,r])=>r?.dueAt&&r.dueAt<=now).map(([id])=>id);
 const weakFamilyIds=Object.entries(mastery).filter(([,r])=>r?.attempts>0&&(r.reading<.68||r.coldReadAttempts>0&&r.coldRead<.68)).map(([id])=>id);
 return{dueFamilyIds:[...new Set([...dueFromQueue,...dueFromMastery])],weakFamilyIds:[...new Set(weakFamilyIds)],familyMastery:mastery};
}

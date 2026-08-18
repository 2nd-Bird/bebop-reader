import {familyById,familiesThroughStage} from './phraseFamilyRegistry.js';
import {variantById} from './variantRegistry.js';
import {isFamilyMastered} from './mastery.js';

export const KEY_TRANSFER_SUCCESS_SCORE=78;
export const FOUNDATION_TRANSFER_FAMILY_IDS=['anchor-do-sol','do-sol-in-time','tonic-shape','descend-to-mi','descend-to-do'];

const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const emptyKey=unlocked=>({unlocked:Boolean(unlocked),families:{}});
export const defaultKeyProgress=()=>({C:emptyKey(true),F:emptyKey(false),Bb:emptyKey(false)});

export function normalizeKeyProgress(raw={}){
  const base=defaultKeyProgress(),out={};
  for(const key of ['C','F','Bb']){
    const source=raw?.[key]||{};out[key]={...base[key],...source,families:{}};
    for(const [familyId,evidence] of Object.entries(source.families||{})){
      out[key].families[familyId]={
        successfulReads:Number(evidence?.successfulReads)||0,
        successfulSessionIds:uniq(evidence?.successfulSessionIds),
        successfulVariantIds:uniq(evidence?.successfulVariantIds),
        lastSuccessAt:evidence?.lastSuccessAt||null,
      };
    }
  }
  out.C.unlocked=true;
  return out;
}

function coldVariantIdsFor(familyId){
  const family=familyById(familyId);if(!family)return[];
  return family.variants.filter(id=>{
    const variant=variantById(id);return variant&&variant.coldReadEligible!==false&&variant.allowedPresentation?.includes('COLD_READ');
  });
}

export function keyFamilyEvidence(keyProgress,key,familyId){return normalizeKeyProgress(keyProgress)?.[key]?.families?.[familyId]||{successfulReads:0,successfulSessionIds:[],successfulVariantIds:[],lastSuccessAt:null};}

export function isKeyFamilyTransferred(keyProgress,key,familyId){
  if(key==='C')return true;
  const evidence=keyFamilyEvidence(keyProgress,key,familyId),eligible=coldVariantIdsFor(familyId),requiredVariants=eligible.length>=2?2:Math.min(1,eligible.length);
  return evidence.successfulSessionIds.length>=2&&evidence.successfulVariantIds.length>=requiredVariants;
}

export function applyKeyTransferResult(keyProgress,event,result,sessionId,now=Date.now()){
  const next=normalizeKeyProgress(keyProgress),key=event?.key,familyId=event?.familyId,variantId=event?.variantId;
  if(!event?.keyTransfer||!key||key==='C'||!familyId||!variantId)return next;
  if(!['COLD_READ','DELAYED_READ'].includes(event.presentationMode))return next;
  if(Number(result?.readScore)<KEY_TRANSFER_SUCCESS_SCORE||!sessionId)return next;
  const keyState=next[key];if(!keyState?.unlocked)return next;
  const prior=keyState.families[familyId]||{successfulReads:0,successfulSessionIds:[],successfulVariantIds:[],lastSuccessAt:null};
  keyState.families[familyId]={
    successfulReads:prior.successfulReads+1,
    successfulSessionIds:uniq([...prior.successfulSessionIds,sessionId]),
    successfulVariantIds:uniq([...prior.successfulVariantIds,variantId]),
    lastSuccessAt:now,
  };
  return next;
}

export function deriveKeyProgress(keyProgress,{stageProgress={},familyMastery={}}={}){
  const next=normalizeKeyProgress(keyProgress);
  if(Number(stageProgress.currentStage)>=4)next.F.unlocked=true;
  if(FOUNDATION_TRANSFER_FAMILY_IDS.every(id=>isFamilyMastered(familyMastery?.[id],id))&&FOUNDATION_TRANSFER_FAMILY_IDS.every(id=>isKeyFamilyTransferred(next,'F',id)))next.Bb.unlocked=true;
  return next;
}

function nextVariantFor(keyProgress,key,familyId){
  const eligible=coldVariantIdsFor(familyId),evidence=keyFamilyEvidence(keyProgress,key,familyId);if(!eligible.length)return null;
  const unseen=eligible.find(id=>!evidence.successfulVariantIds.includes(id));
  return unseen||eligible[evidence.successfulSessionIds.length%eligible.length];
}

function contextFor(family,variantId){
  if(!family?.contextSequence?.length)return{sequenceIndex:Math.max(0,family?.variants?.indexOf(variantId)||0),harmonyFieldId:null,tonalFieldId:null};
  const index=family.contextSequence.findIndex(x=>x.variantId===variantId),entry=family.contextSequence[index>=0?index:0];
  return{sequenceIndex:index>=0?index:0,harmonyFieldId:entry?.harmonyFieldId||null,tonalFieldId:entry?.tonalFieldId||null};
}

export function nextKeyTransferRequest({keyProgress={},familyMastery={},currentStage=0}={}){
  if(Number(currentStage)>=14)return null; // never switch key inside an active form chorus.
  const progress=normalizeKeyProgress(keyProgress),families=familiesThroughStage(currentStage).filter(f=>isFamilyMastered(familyMastery?.[f.familyId],f.familyId)).sort((a,b)=>a.stage-b.stage||a.familyId.localeCompare(b.familyId));
  for(const family of families){
    let key=null;
    if(progress.F.unlocked&&!isKeyFamilyTransferred(progress,'F',family.familyId))key='F';
    else if(progress.Bb.unlocked&&isKeyFamilyTransferred(progress,'F',family.familyId)&&!isKeyFamilyTransferred(progress,'Bb',family.familyId))key='Bb';
    if(!key)continue;
    const variantId=nextVariantFor(progress,key,family.familyId),variant=variantById(variantId);if(!variant)continue;
    const context=contextFor(family,variantId);
    return{key,keyTransfer:true,family,variant,mode:'COLD_READ',...context,harmonyTransfer:false,tonalFieldTransfer:false,formProgram:null};
  }
  return null;
}

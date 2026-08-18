import{familiesForStage,familiesThroughStage,familyById}from'./phraseFamilyRegistry.js';
import{variantById}from'./variantRegistry.js';
import{defaultHarmonyFieldFor,harmonyFieldById}from'./harmonyFields.js';
import{tonalFieldById}from'./tonalFields.js';
import{musicalFormById,expandFormHarmony,sliceFormHarmony}from'./musicalForms.js';
import{buildClosingFlowEvent,buildClosingTradeEvent,buildOneChorusFlowEvent}from'./flow.js';
import{buildPairFlowEvent}from'./flowPair.js';
import{cBluesRepeatReady,cBluesMutationReady,cBluesConnectReady,cBluesTradeReady,cBluesRecallReady,cBluesStageReady}from'./mastery.js';
import{nextKeyTransferRequest}from'./keyMastery.js';
import{keyTransferSupported,transposeHarmonyTimelineFromC}from'./keyTransfer.js';
import{materializeScoreModel}from'./materialize.js';
import{validateCurriculum}from'./validate.js';

const uniq=a=>[...new Set(a.filter(Boolean))];
const variantBeats=v=>Math.max(4,...v.notes.map(n=>n.startBeat+n.duration));
const fieldBeatsFor=scoreBeats=>{if(scoreBeats<=8)return 16;if(scoreBeats<=16)return 32;throw new Error(`phrase ${scoreBeats} beats exceeds Phrase 8 field support`)};
const fieldNameFor=fieldBeats=>fieldBeats===32?'phrase-8':'training-4';

function chooseFamilies({currentStage,dueFamilyIds=[],weakFamilyIds=[],preferredFamilyIds=[]}){
 const eligible=new Set(familiesThroughStage(currentStage).map(f=>f.familyId));
 const due=dueFamilyIds.filter(id=>eligible.has(id)),weak=weakFamilyIds.filter(id=>eligible.has(id));
 if(preferredFamilyIds.length){
  const preferred=preferredFamilyIds.filter(id=>eligible.has(id));
  const duePreferred=due.filter(id=>preferred.includes(id)),weakPreferred=weak.filter(id=>preferred.includes(id));
  return uniq([...duePreferred,...weakPreferred,...preferred]).slice(0,2).map(familyById).filter(Boolean);
 }
 const current=familiesForStage(currentStage).map(f=>f.familyId),prior=familiesThroughStage(currentStage-1).slice().reverse().map(f=>f.familyId);
 return uniq([...due,...weak,...current,...prior]).slice(0,2).map(familyById);
}

const sequenceFor=family=>family.contextSequence?.length?family.contextSequence:family.variants.map(variantId=>({variantId,harmonyFieldId:null,tonalFieldId:null}));
function buildSlots(families,eventCount,{familyMastery={},dueFamilyIds=[],formIntegration=false}={}){
 const state=new Map(families.map(f=>[f.familyId,0])),due=new Set(dueFamilyIds),out=[];
 for(let i=0;i<eventCount;i++){
  const family=families[i%families.length],sequence=sequenceFor(family),n=state.get(family.familyId)||0,record=familyMastery[family.familyId]||null,known=(record?.attempts||0)>0;
  let sequenceIndex=n%sequence.length;
  if(n===0&&known)sequenceIndex=(record?.coldReadAttempts||0)%sequence.length;
  const entry=sequence[sequenceIndex],variant=variantById(entry.variantId),previous=n>0?sequence[(n-1)%sequence.length]:null;
  state.set(family.familyId,n+1);
  let mode='COLD_READ';
  if(formIntegration){
   if(n%3===1&&variant.allowedPresentation.includes('DELAYED_READ'))mode='DELAYED_READ';
  }else if(n===0&&(due.has(family.familyId)||known))mode='COLD_READ';
  else if(n===0&&variant.allowedPresentation.includes('TEACHER_CALL'))mode='TEACHER_CALL';
  else if(n<sequence.length&&variant.morphType!=='NONE'&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n<sequence.length&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n%3===1&&variant.allowedPresentation.includes('DELAYED_READ'))mode='DELAYED_READ';
  const harmonyTransfer=Boolean(previous&&previous.variantId===entry.variantId&&previous.harmonyFieldId&&entry.harmonyFieldId&&previous.harmonyFieldId!==entry.harmonyFieldId);
  const tonalFieldTransfer=Boolean(previous&&previous.variantId===entry.variantId&&previous.tonalFieldId&&entry.tonalFieldId&&previous.tonalFieldId!==entry.tonalFieldId);
  out.push({family,variant,mode,sequenceIndex,harmonyFieldId:entry.harmonyFieldId||null,tonalFieldId:entry.tonalFieldId||null,harmonyTransfer,tonalFieldTransfer,formProgram:null});
 }
 return out;
}
function buildProgramSlots(form,eventCount){
 const program=form.slotPrograms||[];if(!program.length)return[];
 const out=[];
 for(let i=0;i<eventCount;i++){
  const p=program[i%program.length],family=familyById(p.familyId),variant=variantById(p.variantId),chorusIndex=Math.floor(i/program.length);
  if(!family||!variant||variant.familyId!==family.familyId)throw new Error(`${form.formId}: invalid programmed slot ${p.familyId}/${p.variantId}`);
  let mode='COLD_READ';if(i%3===1&&variant.allowedPresentation.includes('DELAYED_READ'))mode='DELAYED_READ';
  out.push({family,variant,mode,sequenceIndex:i%program.length,harmonyFieldId:null,tonalFieldId:null,harmonyTransfer:true,tonalFieldTransfer:false,formProgram:{...p,chorusIndex}});
 }
 return out;
}
function warmupSlotFor(families,{currentStage=0,familyMastery={}}={}){
 if(Number(currentStage)<=0)return null;
 const focusedPrior=families.filter(f=>Number(f?.stage)<Number(currentStage));
 const candidates=uniq([...focusedPrior,...familiesThroughStage(currentStage-1).slice().reverse()]).filter(f=>Number(familyMastery?.[f.familyId]?.attempts)>0);
 for(const family of candidates){
  const sequence=sequenceFor(family),index=sequence.findIndex(entry=>{const variant=variantById(entry.variantId);return variant?.coldReadEligible!==false&&variant?.allowedPresentation?.includes('COLD_READ');});
  if(index<0)continue;
  const entry=sequence[index],variant=variantById(entry.variantId);
  return{family,variant,mode:'COLD_READ',sequenceIndex:index,harmonyFieldId:entry.harmonyFieldId||null,tonalFieldId:entry.tonalFieldId||null,harmonyTransfer:false,tonalFieldTransfer:false,formProgram:null,warmup:true};
 }
 return null;
}
function injectKeyTransferSlot(slots,request){
 if(!request||!slots.length)return null;
 const needed=fieldBeatsFor(variantBeats(request.variant));let index=-1;
 for(let i=slots.length-1;i>=0;i--){if(fieldBeatsFor(variantBeats(slots[i].variant))>=needed){index=i;break;}}
 if(index<0)index=Math.max(0,slots.length-2);
 slots[index]=request;return index;
}
export function recommendedFormIdForStage14(familyMastery={},explicitFormId=null){return explicitFormId||(cBluesStageReady(familyMastery)?'rhythm-changes-32':'c-blues-12');}

export function buildDailySessionPlan({currentStage=0,key='C',bpm=60,eventCount=20,targetSessionBeats=320,dueFamilyIds=[],weakFamilyIds=[],familyMastery={},keyProgress={},harmonyFieldOverrides={},formId=null,flowActionOverride=null}={}){
 validateCurriculum();
 if(!keyTransferSupported(key,currentStage))throw new Error(`key ${key} is not enabled for Stage ${currentStage}`);
 const resolvedFormId=currentStage>=14?recommendedFormIdForStage14(familyMastery,formId):null;
 const musicalForm=currentStage>=14?musicalFormById(resolvedFormId):null;
 if(currentStage>=14&&!musicalForm)throw new Error(`unknown musical form ${resolvedFormId}`);
 if(musicalForm&&musicalForm.status!=='ACTIVE')throw new Error(`${musicalForm.formId} is defined but not active yet`);
 const programmedFamilyIds=musicalForm?.slotPrograms?.length?uniq(musicalForm.slotPrograms.map(x=>x.familyId)):[];
 const families=programmedFamilyIds.length?programmedFamilyIds.map(familyById).filter(Boolean):chooseFamilies({currentStage,dueFamilyIds,weakFamilyIds,preferredFamilyIds:musicalForm?.integrationFamilyIds||[]});
 if(!families.length)throw new Error('no eligible phrase families');
 const formTargetBeats=musicalForm?Math.max(musicalForm.lengthBeats,Math.floor(targetSessionBeats/musicalForm.lengthBeats)*musicalForm.lengthBeats):targetSessionBeats;
 const slots=musicalForm?.slotPrograms?.length?buildProgramSlots(musicalForm,eventCount):buildSlots(families,eventCount,{familyMastery,dueFamilyIds,formIntegration:Boolean(musicalForm)});
 const warmupSlot=!musicalForm?warmupSlotFor(families,{currentStage,familyMastery}):null;
 if(warmupSlot&&slots.length)slots[0]=warmupSlot;
 const keyTransferRequest=key==='C'&&!musicalForm?nextKeyTransferRequest({keyProgress,familyMastery,currentStage}):null,keyTransferSlotIndex=injectKeyTransferSlot(slots,keyTransferRequest);
 const sessionForm=musicalForm?.formId||(currentStage>=9?'phrase-8':'training-4');
 const baseSeed={sessionId:`stage-${currentStage}-${Date.now()}`,stage:currentStage,bpm,key,sourceKey:'C',form:sessionForm,musicalFormId:musicalForm?.formId||null,formLengthBeats:musicalForm?.lengthBeats||null,beatsPerBar:4,countInBars:1};
 const events=[];let cursor=0;
 for(let i=0;i<slots.length;i++){
  const {family,variant,mode,sequenceIndex,harmonyFieldId:sequenceHarmonyFieldId,tonalFieldId,harmonyTransfer,tonalFieldTransfer,formProgram,key:slotKey=null,keyTransfer=false,warmup=false}=slots[i],eventKey=slotKey||key,scoreBeats=variantBeats(variant),fieldBeats=fieldBeatsFor(scoreBeats);
  if(cursor+fieldBeats>formTargetBeats&&events.length>=8)break;
  const startBeat=cursor,endBeat=startBeat+fieldBeats,isTeacher=mode==='TEACHER_CALL',isBuild=mode==='BUILD'&&variant.morphType!=='NONE';
  let singStartBeat;
  if(musicalForm){
    let offset=null;
    if(formProgram?.singOffsetByChorus?.length)offset=formProgram.singOffsetByChorus[formProgram.chorusIndex%formProgram.singOffsetByChorus.length];
    else if(Number.isFinite(formProgram?.singOffset))offset=formProgram.singOffset;
    else{const offsets=musicalForm.eventSingOffsets?.length?musicalForm.eventSingOffsets:[8];offset=offsets[i%offsets.length];}
    singStartBeat=startBeat+offset;
  }else if(fieldBeats===32)singStartBeat=isTeacher?startBeat+16:startBeat+8;
  else singStartBeat=startBeat+8;
  if(singStartBeat+scoreBeats>endBeat)singStartBeat=endBeat-scoreBeats;
  const singEndBeat=singStartBeat+scoreBeats;

  let harmonyField=null,harmonyFieldId=null,sourceHarmonyFieldId=null,sourceHarmonyContext=null,harmonyTimeline,harmonyContext;
  if(musicalForm){
    const sourceTimeline=sliceFormHarmony(musicalForm,singStartBeat,scoreBeats);sourceHarmonyContext=sourceTimeline[0]?.chord||'C';
    harmonyTimeline=transposeHarmonyTimelineFromC(sourceTimeline,eventKey);harmonyContext=harmonyTimeline[0]?.chord||eventKey;
    sourceHarmonyFieldId=`form:${musicalForm.formId}:${sourceHarmonyContext}`;harmonyFieldId=eventKey==='C'?sourceHarmonyFieldId:`${sourceHarmonyFieldId}@key:${eventKey}`;
  }else{
    const overrideId=harmonyFieldOverrides[variant.variantId]||harmonyFieldOverrides[family.familyId]||null;
    harmonyField=overrideId?harmonyFieldById(overrideId):sequenceHarmonyFieldId?harmonyFieldById(sequenceHarmonyFieldId):defaultHarmonyFieldFor(variant.allowedHarmony,{scoreBeats});
    if(!harmonyField)throw new Error(`${variant.variantId}: harmony field not found for ${scoreBeats} beats`);
    const sourceTimeline=harmonyField.timeline.map(x=>({...x}));
    if(sourceTimeline.some(x=>!variant.allowedHarmony.includes(x.chord)))throw new Error(`${variant.variantId}: harmony field ${harmonyField.harmonyFieldId} is outside allowed scope`);
    sourceHarmonyContext=sourceTimeline[0]?.chord||'C';sourceHarmonyFieldId=harmonyField.harmonyFieldId;harmonyFieldId=eventKey==='C'?sourceHarmonyFieldId:`${sourceHarmonyFieldId}@key:${eventKey}`;
    harmonyTimeline=transposeHarmonyTimelineFromC(sourceTimeline,eventKey);harmonyContext=harmonyTimeline[0]?.chord||eventKey;
  }

  const tonalField=tonalFieldId?tonalFieldById(tonalFieldId):null;
  if(tonalFieldId&&!tonalField)throw new Error(`${variant.variantId}: tonal field ${tonalFieldId} not found`);
  if(tonalFieldId&&family.allowedTonalFieldIds?.length&&!family.allowedTonalFieldIds.includes(tonalFieldId))throw new Error(`${variant.variantId}: tonal field ${tonalFieldId} outside family scope`);
  let prepareBeat;
  if(musicalForm)prepareBeat=Math.max(startBeat,singStartBeat-4);
  else if(isTeacher)prepareBeat=Math.min(startBeat+scoreBeats,singStartBeat);
  else prepareBeat=scoreBeats>4?startBeat:startBeat+4;
  const formPosition=musicalForm?Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4):0;
  const event={eventId:`event-${String(events.length+1).padStart(2,'0')}`,familyId:family.familyId,variantId:variant.variantId,title:family.title,key:eventKey,sourceKey:'C',keyTransfer:Boolean(keyTransfer),warmup:Boolean(warmup),sourceHarmonyFieldId,sourceHarmonyContext,harmonyFieldId,harmonyContext,harmonyTimeline,tonalFieldId:tonalField?.tonalFieldId||null,harmonyTransfer:musicalForm?true:harmonyTransfer,tonalFieldTransfer,formTransfer:Boolean(musicalForm),movePolicy:formProgram?.movePolicy||'NONE',contextSequenceIndex:sequenceIndex,form:musicalForm?.formId||fieldNameFor(fieldBeats),fieldBeats,formPosition,startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:mode,modelPolicy:isTeacher?'TEACHER_CALL':'NONE',morphPolicy:isBuild?variant.morphType:'NONE',scoringPolicy:'READING'};
  if(isTeacher){event.modelStartBeat=startBeat;event.modelEndBeat=startBeat+scoreBeats;}
  if(isBuild)event.morph={active:true,type:variant.morphType,indices:[...(variant.morphTargets||[])],parentVariantId:variant.parentVariant||null};
  event.scoreModel=materializeScoreModel(variant,event,baseSeed);
  events.push(event);cursor=endBeat;
 }
 if(!events.length)throw new Error('session has no events');
 if(musicalForm?.closingFlowProgram){
   const requestedFlow=['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS'].includes(flowActionOverride)?flowActionOverride:null;
   const flowAction=requestedFlow||(!cBluesRepeatReady(familyMastery)?'REPEAT':!cBluesMutationReady(familyMastery)?'MUTATION':!cBluesConnectReady(familyMastery)?'CONNECT':!cBluesTradeReady(familyMastery)?'TRADE':!cBluesRecallReady(familyMastery)?'RECALL':'ONE_CHORUS');
   if(['REPEAT','MUTATION'].includes(flowAction)&&events.length>=1){
     const last=events.at(-1),span=last.endBeat-last.startBeat;
     if(Math.abs(span-16)<.001){
       const pair=buildPairFlowEvent({musicalForm,startBeat:last.startBeat,endBeat:last.endBeat,key,bpm,eventId:`${last.eventId}-${flowAction.toLowerCase()}`,flowAction});
       if(pair)events.splice(events.length-1,1,pair);
     }
   }else if(flowAction==='ONE_CHORUS'&&events.length>=4){
     const first=events.at(-4),last=events.at(-1),span=last.endBeat-first.startBeat;
     if(Math.abs(span-64)<.001){
       const chorus=buildOneChorusFlowEvent({musicalForm,startBeat:first.startBeat,endBeat:last.endBeat,key,bpm,eventId:`${first.eventId}-one-chorus`});
       if(chorus)events.splice(events.length-4,4,chorus);
     }
   }else if(flowAction==='TRADE'&&events.length>=1){
     const last=events.at(-1),span=last.endBeat-last.startBeat;
     if(Math.abs(span-16)<.001){
       const trade=buildClosingTradeEvent({musicalForm,startBeat:last.startBeat,endBeat:last.endBeat,key,bpm,eventId:`${last.eventId}-trade`});
       if(trade)events.splice(events.length-1,1,trade);
     }
   }else if(events.length>=2){
     const secondLast=events.at(-2),last=events.at(-1),span=last.endBeat-secondLast.startBeat;
     if(Math.abs(span-32)<.001){
       const flow=buildClosingFlowEvent({musicalForm,startBeat:secondLast.startBeat,endBeat:last.endBeat,key,bpm,eventId:`event-${String(events.length-1).padStart(2,'0')}-flow`,flowAction});
       if(flow)events.splice(events.length-2,2,flow);
     }
   }
 }
 const totalBeats=cursor,totalBars=totalBeats/4,formHarmonyTimeline=musicalForm?transposeHarmonyTimelineFromC(expandFormHarmony(musicalForm,totalBeats),key):null;
 return{...baseSeed,totalBars,totalBeats,targetSessionBeats:formTargetBeats,requestedEventCount:eventCount,events,focusFamilyIds:families.map(f=>f.familyId),warmupEventId:events.find(e=>e.warmup)?.eventId||null,keyTransferEventId:keyTransferSlotIndex==null?null:events.find(e=>e.keyTransfer)?.eventId||null,formHarmonyTimeline};
}

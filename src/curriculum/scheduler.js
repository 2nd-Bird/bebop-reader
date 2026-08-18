import{familiesForStage,familiesThroughStage,familyById}from'./phraseFamilyRegistry.js';
import{variantById}from'./variantRegistry.js';
import{defaultHarmonyFieldFor,harmonyFieldById}from'./harmonyFields.js';
import{tonalFieldById}from'./tonalFields.js';
import{musicalFormById,expandFormHarmony,sliceFormHarmony}from'./musicalForms.js';
import{buildClosingFlowEvent,buildClosingTradeEvent}from'./flow.js';
import{cBluesConnectReady,cBluesTradeReady,cBluesStageReady}from'./mastery.js';
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
export function recommendedFormIdForStage14(familyMastery={},explicitFormId=null){return explicitFormId||(cBluesStageReady(familyMastery)?'rhythm-changes-32':'c-blues-12');}

export function buildDailySessionPlan({currentStage=0,key='C',bpm=60,eventCount=20,targetSessionBeats=320,dueFamilyIds=[],weakFamilyIds=[],familyMastery={},harmonyFieldOverrides={},formId=null,flowActionOverride=null}={}){
 validateCurriculum();
 const resolvedFormId=currentStage>=14?recommendedFormIdForStage14(familyMastery,formId):null;
 const musicalForm=currentStage>=14?musicalFormById(resolvedFormId):null;
 if(currentStage>=14&&!musicalForm)throw new Error(`unknown musical form ${resolvedFormId}`);
 if(musicalForm&&musicalForm.status!=='ACTIVE')throw new Error(`${musicalForm.formId} is defined but not active yet`);
 const programmedFamilyIds=musicalForm?.slotPrograms?.length?uniq(musicalForm.slotPrograms.map(x=>x.familyId)):[];
 const families=programmedFamilyIds.length?programmedFamilyIds.map(familyById).filter(Boolean):chooseFamilies({currentStage,dueFamilyIds,weakFamilyIds,preferredFamilyIds:musicalForm?.integrationFamilyIds||[]});
 if(!families.length)throw new Error('no eligible phrase families');
 const formTargetBeats=musicalForm?Math.max(musicalForm.lengthBeats,Math.floor(targetSessionBeats/musicalForm.lengthBeats)*musicalForm.lengthBeats):targetSessionBeats;
 const slots=musicalForm?.slotPrograms?.length?buildProgramSlots(musicalForm,eventCount):buildSlots(families,eventCount,{familyMastery,dueFamilyIds,formIntegration:Boolean(musicalForm)});
 const sessionForm=musicalForm?.formId||(currentStage>=9?'phrase-8':'training-4');
 const baseSeed={sessionId:`stage-${currentStage}-${Date.now()}`,stage:currentStage,bpm,key,form:sessionForm,musicalFormId:musicalForm?.formId||null,formLengthBeats:musicalForm?.lengthBeats||null,beatsPerBar:4,countInBars:1};
 const events=[];let cursor=0;
 for(let i=0;i<slots.length;i++){
  const {family,variant,mode,sequenceIndex,harmonyFieldId:sequenceHarmonyFieldId,tonalFieldId,harmonyTransfer,tonalFieldTransfer,formProgram}=slots[i],scoreBeats=variantBeats(variant),fieldBeats=fieldBeatsFor(scoreBeats);
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

  let harmonyField=null,harmonyFieldId=null,harmonyTimeline,harmonyContext;
  if(musicalForm){
    harmonyTimeline=sliceFormHarmony(musicalForm,singStartBeat,scoreBeats);
    harmonyContext=harmonyTimeline[0]?.chord||key;
    harmonyFieldId=`form:${musicalForm.formId}:${harmonyContext}`;
  }else{
    const overrideId=harmonyFieldOverrides[variant.variantId]||harmonyFieldOverrides[family.familyId]||null;
    harmonyField=overrideId?harmonyFieldById(overrideId):sequenceHarmonyFieldId?harmonyFieldById(sequenceHarmonyFieldId):defaultHarmonyFieldFor(variant.allowedHarmony,{scoreBeats});
    if(!harmonyField)throw new Error(`${variant.variantId}: harmony field not found for ${scoreBeats} beats`);
    harmonyFieldId=harmonyField.harmonyFieldId;
    harmonyTimeline=harmonyField.timeline.map(x=>({...x}));harmonyContext=harmonyTimeline[0]?.chord||'C';
    if(harmonyTimeline.some(x=>!variant.allowedHarmony.includes(x.chord)))throw new Error(`${variant.variantId}: harmony field ${harmonyField.harmonyFieldId} is outside allowed scope`);
  }

  const tonalField=tonalFieldId?tonalFieldById(tonalFieldId):null;
  if(tonalFieldId&&!tonalField)throw new Error(`${variant.variantId}: tonal field ${tonalFieldId} not found`);
  if(tonalFieldId&&family.allowedTonalFieldIds?.length&&!family.allowedTonalFieldIds.includes(tonalFieldId))throw new Error(`${variant.variantId}: tonal field ${tonalFieldId} outside family scope`);
  let prepareBeat;
  if(musicalForm)prepareBeat=Math.max(startBeat,singStartBeat-4);
  else if(isTeacher)prepareBeat=Math.min(startBeat+scoreBeats,singStartBeat);
  else prepareBeat=scoreBeats>4?startBeat:startBeat+4;
  const formPosition=musicalForm?Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4):0;
  const event={eventId:`event-${String(events.length+1).padStart(2,'0')}`,familyId:family.familyId,variantId:variant.variantId,title:family.title,key,harmonyFieldId,harmonyContext,harmonyTimeline,tonalFieldId:tonalField?.tonalFieldId||null,harmonyTransfer:musicalForm?true:harmonyTransfer,tonalFieldTransfer,formTransfer:Boolean(musicalForm),movePolicy:formProgram?.movePolicy||'NONE',contextSequenceIndex:sequenceIndex,form:musicalForm?.formId||fieldNameFor(fieldBeats),fieldBeats,formPosition,startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:mode,modelPolicy:isTeacher?'TEACHER_CALL':'NONE',morphPolicy:isBuild?variant.morphType:'NONE',scoringPolicy:'READING'};
  if(isTeacher){event.modelStartBeat=startBeat;event.modelEndBeat=startBeat+scoreBeats;}
  if(isBuild)event.morph={active:true,type:variant.morphType,indices:[...(variant.morphTargets||[])],parentVariantId:variant.parentVariant||null};
  event.scoreModel=materializeScoreModel(variant,event,baseSeed);
  events.push(event);cursor=endBeat;
 }
 if(!events.length)throw new Error('session has no events');
 if(musicalForm?.closingFlowProgram){
   const requestedFlow=['CONNECT','TRADE','RECALL'].includes(flowActionOverride)?flowActionOverride:null;
   const flowAction=requestedFlow||(!cBluesConnectReady(familyMastery)?'CONNECT':!cBluesTradeReady(familyMastery)?'TRADE':'RECALL');
   if(flowAction==='TRADE'&&events.length>=1){
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
 const totalBeats=cursor,totalBars=totalBeats/4,formHarmonyTimeline=musicalForm?expandFormHarmony(musicalForm,totalBeats):null;
 return{...baseSeed,totalBars,totalBeats,targetSessionBeats:formTargetBeats,requestedEventCount:eventCount,events,focusFamilyIds:families.map(f=>f.familyId),formHarmonyTimeline};
}

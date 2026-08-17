import{familiesForStage,familiesThroughStage,familyById}from'./phraseFamilies.js';
import{variantById}from'./variants.js';
import{defaultHarmonyFieldFor,harmonyFieldById}from'./harmonyFields.js';
import{materializeScoreModel}from'./materialize.js';
import{validateCurriculum}from'./validate.js';

const uniq=a=>[...new Set(a.filter(Boolean))];
const variantBeats=v=>Math.max(4,...v.notes.map(n=>n.startBeat+n.duration));
const fieldBeatsFor=scoreBeats=>{if(scoreBeats<=8)return 16;if(scoreBeats<=16)return 32;throw new Error(`phrase ${scoreBeats} beats exceeds Phrase 8 field support`)};
const fieldNameFor=fieldBeats=>fieldBeats===32?'phrase-8':'training-4';

function chooseFamilies({currentStage,dueFamilyIds=[],weakFamilyIds=[]}){
 const eligible=new Set(familiesThroughStage(currentStage).map(f=>f.familyId));
 const due=dueFamilyIds.filter(id=>eligible.has(id)),weak=weakFamilyIds.filter(id=>eligible.has(id));
 const current=familiesForStage(currentStage).map(f=>f.familyId),prior=familiesThroughStage(currentStage-1).slice().reverse().map(f=>f.familyId);
 return uniq([...due,...weak,...current,...prior]).slice(0,2).map(familyById);
}

const sequenceFor=family=>family.contextSequence?.length?family.contextSequence:family.variants.map(variantId=>({variantId,harmonyFieldId:null}));
function buildSlots(families,eventCount,{familyMastery={},dueFamilyIds=[]}={}){
 const state=new Map(families.map(f=>[f.familyId,0])),due=new Set(dueFamilyIds),out=[];
 for(let i=0;i<eventCount;i++){
  const family=families[i%families.length],sequence=sequenceFor(family),n=state.get(family.familyId)||0,record=familyMastery[family.familyId]||null,known=(record?.attempts||0)>0;
  let sequenceIndex=n%sequence.length;
  if(n===0&&known)sequenceIndex=(record?.coldReadAttempts||0)%sequence.length;
  const entry=sequence[sequenceIndex],variant=variantById(entry.variantId),previous=n>0?sequence[(n-1)%sequence.length]:null;
  state.set(family.familyId,n+1);
  let mode='COLD_READ';
  if(n===0&&(due.has(family.familyId)||known))mode='COLD_READ';
  else if(n===0&&variant.allowedPresentation.includes('TEACHER_CALL'))mode='TEACHER_CALL';
  else if(n<sequence.length&&variant.morphType!=='NONE'&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n<sequence.length&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n%3===1&&variant.allowedPresentation.includes('DELAYED_READ'))mode='DELAYED_READ';
  const harmonyTransfer=Boolean(previous&&previous.variantId===entry.variantId&&previous.harmonyFieldId&&entry.harmonyFieldId&&previous.harmonyFieldId!==entry.harmonyFieldId);
  out.push({family,variant,mode,sequenceIndex,harmonyFieldId:entry.harmonyFieldId||null,harmonyTransfer});
 }
 return out;
}

export function buildDailySessionPlan({currentStage=0,key='C',bpm=60,eventCount=20,targetSessionBeats=320,dueFamilyIds=[],weakFamilyIds=[],familyMastery={},harmonyFieldOverrides={}}={}){
 validateCurriculum();
 const families=chooseFamilies({currentStage,dueFamilyIds,weakFamilyIds});
 if(!families.length)throw new Error('no eligible phrase families');
 const slots=buildSlots(families,eventCount,{familyMastery,dueFamilyIds});
 const sessionForm=currentStage>=9?'phrase-8':'training-4';
 const baseSeed={sessionId:`stage-${currentStage}-${Date.now()}`,stage:currentStage,bpm,key,form:sessionForm,beatsPerBar:4,countInBars:1};
 const events=[];let cursor=0;
 for(let i=0;i<slots.length;i++){
  const {family,variant,mode,sequenceIndex,harmonyFieldId:sequenceHarmonyFieldId,harmonyTransfer}=slots[i],scoreBeats=variantBeats(variant),fieldBeats=fieldBeatsFor(scoreBeats);
  if(cursor+fieldBeats>targetSessionBeats&&events.length>=8)break;
  const startBeat=cursor,endBeat=startBeat+fieldBeats,isTeacher=mode==='TEACHER_CALL',isBuild=mode==='BUILD'&&variant.morphType!=='NONE';
  const overrideId=harmonyFieldOverrides[variant.variantId]||harmonyFieldOverrides[family.familyId]||null;
  const harmonyField=overrideId?harmonyFieldById(overrideId):sequenceHarmonyFieldId?harmonyFieldById(sequenceHarmonyFieldId):defaultHarmonyFieldFor(variant.allowedHarmony,{scoreBeats});
  if(!harmonyField)throw new Error(`${variant.variantId}: harmony field not found for ${scoreBeats} beats`);
  const harmonyTimeline=harmonyField.timeline.map(x=>({...x})),harmonyContext=harmonyTimeline[0]?.chord||'C';
  if(harmonyTimeline.some(x=>!variant.allowedHarmony.includes(x.chord)))throw new Error(`${variant.variantId}: harmony field ${harmonyField.harmonyFieldId} is outside allowed scope`);
  let singStartBeat;
  if(fieldBeats===32)singStartBeat=isTeacher?startBeat+16:startBeat+8;
  else singStartBeat=startBeat+8;
  if(singStartBeat+scoreBeats>endBeat)singStartBeat=endBeat-scoreBeats;
  const singEndBeat=singStartBeat+scoreBeats;
  let prepareBeat;
  if(isTeacher)prepareBeat=Math.min(startBeat+scoreBeats,singStartBeat);
  else prepareBeat=scoreBeats>4?startBeat:startBeat+4;
  const event={eventId:`event-${String(events.length+1).padStart(2,'0')}`,familyId:family.familyId,variantId:variant.variantId,title:family.title,key,harmonyFieldId:harmonyField.harmonyFieldId,harmonyContext,harmonyTimeline,harmonyTransfer,contextSequenceIndex:sequenceIndex,form:fieldNameFor(fieldBeats),fieldBeats,formPosition:0,startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:mode,modelPolicy:isTeacher?'TEACHER_CALL':'NONE',morphPolicy:isBuild?variant.morphType:'NONE',scoringPolicy:'READING'};
  if(isTeacher){event.modelStartBeat=startBeat;event.modelEndBeat=startBeat+scoreBeats;}
  if(isBuild)event.morph={active:true,type:variant.morphType,indices:[...(variant.morphTargets||[])],parentVariantId:variant.parentVariant||null};
  event.scoreModel=materializeScoreModel(variant,event,baseSeed);
  events.push(event);cursor=endBeat;
 }
 if(!events.length)throw new Error('session has no events');
 const totalBeats=cursor,totalBars=totalBeats/4;
 return{...baseSeed,totalBars,totalBeats,targetSessionBeats,requestedEventCount:eventCount,events,focusFamilyIds:families.map(f=>f.familyId)};
}

import{familiesForStage,familiesThroughStage,familyById}from'./phraseFamilies.js';import{variantById}from'./variants.js';import{defaultHarmonyFieldFor,harmonyFieldById}from'./harmonyFields.js';import{materializeScoreModel}from'./materialize.js';import{validateCurriculum}from'./validate.js';
const uniq=a=>[...new Set(a.filter(Boolean))];
const variantBeats=v=>Math.max(4,...v.notes.map(n=>n.startBeat+n.duration));
function chooseFamilies({currentStage,dueFamilyIds=[],weakFamilyIds=[]}){
 const eligible=new Set(familiesThroughStage(currentStage).map(f=>f.familyId));
 const due=dueFamilyIds.filter(id=>eligible.has(id)),weak=weakFamilyIds.filter(id=>eligible.has(id));
 const current=familiesForStage(currentStage).map(f=>f.familyId),prior=familiesThroughStage(currentStage-1).slice().reverse().map(f=>f.familyId);
 return uniq([...due,...weak,...current,...prior]).slice(0,2).map(familyById);
}
function buildSlots(families,eventCount,{familyMastery={},dueFamilyIds=[]}={}){
 const state=new Map(families.map(f=>[f.familyId,0])),due=new Set(dueFamilyIds),out=[];
 for(let i=0;i<eventCount;i++){
  const family=families[i%families.length],vs=family.variants.map(variantById),n=state.get(family.familyId)||0,record=familyMastery[family.familyId]||null,known=(record?.attempts||0)>0;
  let variant=vs[n%vs.length];
  if(n===0&&known)variant=vs[(record?.coldReadAttempts||0)%vs.length];
  state.set(family.familyId,n+1);
  let mode='COLD_READ';
  if(n===0&&(due.has(family.familyId)||known))mode='COLD_READ';
  else if(n===0&&variant.allowedPresentation.includes('TEACHER_CALL'))mode='TEACHER_CALL';
  else if(n<vs.length&&variant.morphType!=='NONE'&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n<vs.length&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n%3===1&&variant.allowedPresentation.includes('DELAYED_READ'))mode='DELAYED_READ';
  out.push({family,variant,mode});
 }
 return out;
}
export function buildDailySessionPlan({currentStage=0,key='C',bpm=60,eventCount=20,dueFamilyIds=[],weakFamilyIds=[],familyMastery={},harmonyFieldOverrides={}}={}){
 validateCurriculum();
 const families=chooseFamilies({currentStage,dueFamilyIds,weakFamilyIds});if(!families.length)throw new Error('no eligible phrase families');
 const slots=buildSlots(families,eventCount,{familyMastery,dueFamilyIds});
 const base={sessionId:`stage-${currentStage}-${Date.now()}`,stage:currentStage,bpm,key,form:'training-4',beatsPerBar:4,countInBars:1,totalBars:eventCount*4,totalBeats:eventCount*16};
 const events=slots.map(({family,variant,mode},i)=>{
  const startBeat=i*16,isTeacher=mode==='TEACHER_CALL',isBuild=mode==='BUILD'&&variant.morphType!=='NONE',scoreBeats=variantBeats(variant);
  const overrideId=harmonyFieldOverrides[variant.variantId]||harmonyFieldOverrides[family.familyId]||null;
  const harmonyField=overrideId?harmonyFieldById(overrideId):defaultHarmonyFieldFor(variant.allowedHarmony);
  if(scoreBeats>8)throw new Error(`${variant.variantId}: training-4 supports score phrases up to 8 beats`);if(!harmonyField)throw new Error(`${variant.variantId}: harmony field not found`);
  const longPhrase=scoreBeats>4,singStartBeat=startBeat+8,singEndBeat=singStartBeat+scoreBeats,prepareBeat=longPhrase?(isTeacher?startBeat+scoreBeats:startBeat):startBeat+4,harmonyTimeline=harmonyField.timeline.map(x=>({...x})),harmonyContext=harmonyTimeline[0]?.chord||'C';
  if(harmonyTimeline.some(x=>!variant.allowedHarmony.includes(x.chord)))throw new Error(`${variant.variantId}: harmony field ${harmonyField.harmonyFieldId} is outside allowed scope`);
  const event={eventId:`event-${String(i+1).padStart(2,'0')}`,familyId:family.familyId,variantId:variant.variantId,title:family.title,key,harmonyFieldId:harmonyField.harmonyFieldId,harmonyContext,harmonyTimeline,form:'training-4',formPosition:i%4,startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat:startBeat+16,presentationMode:mode,modelPolicy:isTeacher?'TEACHER_CALL':'NONE',morphPolicy:isBuild?variant.morphType:'NONE',scoringPolicy:'READING'};
  if(isTeacher){event.modelStartBeat=startBeat;event.modelEndBeat=startBeat+scoreBeats;}
  if(isBuild)event.morph={active:true,type:variant.morphType,indices:[...(variant.morphTargets||[])],parentVariantId:variant.parentVariant||null};
  event.scoreModel=materializeScoreModel(variant,event,base);return event;
 });
 return{...base,events,focusFamilyIds:families.map(f=>f.familyId)};
}

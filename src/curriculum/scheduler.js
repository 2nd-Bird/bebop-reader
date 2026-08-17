import{familiesForStage,familiesThroughStage,familyById}from'./phraseFamilies.js';import{variantById}from'./variants.js';import{materializeScoreModel}from'./materialize.js';import{validateCurriculum}from'./validate.js';
const uniq=a=>[...new Set(a.filter(Boolean))];
function chooseFamilies({currentStage,dueFamilyIds=[],weakFamilyIds=[]}){
 const eligible=new Set(familiesThroughStage(currentStage).map(f=>f.familyId));
 const due=dueFamilyIds.filter(id=>eligible.has(id)),weak=weakFamilyIds.filter(id=>eligible.has(id));
 const current=familiesForStage(currentStage).map(f=>f.familyId),prior=familiesThroughStage(currentStage-1).slice().reverse().map(f=>f.familyId);
 return uniq([...due,...weak,...current,...prior]).slice(0,2).map(familyById);
}
function buildSlots(families,eventCount){
 const state=new Map(families.map(f=>[f.familyId,0])),out=[];
 for(let i=0;i<eventCount;i++){
  const family=families[i%families.length],vs=family.variants.map(variantById),n=state.get(family.familyId)||0,variant=vs[n%vs.length];
  state.set(family.familyId,n+1);
  let mode='COLD_READ';
  if(n===0&&variant.allowedPresentation.includes('TEACHER_CALL'))mode='TEACHER_CALL';
  else if(n<vs.length&&variant.morphType!=='NONE'&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n<vs.length&&variant.allowedPresentation.includes('BUILD'))mode='BUILD';
  else if(n%3===1&&variant.allowedPresentation.includes('DELAYED_READ'))mode='DELAYED_READ';
  out.push({family,variant,mode});
 }
 return out;
}
export function buildDailySessionPlan({currentStage=3,key='C',bpm=60,eventCount=20,dueFamilyIds=[],weakFamilyIds=[]}={}){
 validateCurriculum();
 const families=chooseFamilies({currentStage,dueFamilyIds,weakFamilyIds});if(!families.length)throw new Error('no eligible phrase families');
 const slots=buildSlots(families,eventCount);
 const base={sessionId:`stage-${currentStage}-${Date.now()}`,bpm,key,form:'training-4',beatsPerBar:4,countInBars:1,totalBars:eventCount*4,totalBeats:eventCount*16};
 const events=slots.map(({family,variant,mode},i)=>{
  const startBeat=i*16,isTeacher=mode==='TEACHER_CALL',isBuild=mode==='BUILD'&&variant.morphType!=='NONE';
  const event={eventId:`event-${String(i+1).padStart(2,'0')}`,familyId:family.familyId,variantId:variant.variantId,title:family.title,key,harmonyContext:'C',form:'training-4',formPosition:i%4,startBeat,prepareBeat:startBeat+4,singStartBeat:startBeat+8,singEndBeat:startBeat+12,endBeat:startBeat+16,presentationMode:mode,modelPolicy:isTeacher?'TEACHER_CALL':'NONE',morphPolicy:isBuild?variant.morphType:'NONE',scoringPolicy:'READING'};
  if(isTeacher){event.modelStartBeat=startBeat;event.modelEndBeat=startBeat+4;}
  if(isBuild)event.morph={active:true,type:variant.morphType,indices:[...(variant.morphTargets||[])],parentVariantId:variant.parentVariant||null};
  event.scoreModel=materializeScoreModel(variant,event,base);return event;
 });
 return{...base,events,focusFamilyIds:families.map(f=>f.familyId)};
}

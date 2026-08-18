import {variantById} from './variantRegistry.js';
import {sliceFormHarmony} from './musicalForms.js';
import {transposeHarmonyTimelineFromC,transposeNotesFromC} from './keyTransfer.js';

const cloneNote=(n,offset=0)=>({...n,startBeat:Number(n.startBeat)+offset});
const variantSpan=variant=>Math.max(0,...variant.notes.map(n=>n.startBeat+n.duration));
const keyedFieldId=(base,key)=>key==='C'?base:`${base}@key:${key}`;
function realizeHarmony(musicalForm,absoluteBeat,totalBeats,key){
  const sourceHarmonyTimeline=sliceFormHarmony(musicalForm,absoluteBeat,totalBeats),sourceHarmonyContext=sourceHarmonyTimeline[0]?.chord||'C';
  const harmonyTimeline=transposeHarmonyTimelineFromC(sourceHarmonyTimeline,key),harmonyContext=harmonyTimeline[0]?.chord||key;
  return{sourceHarmonyTimeline,sourceHarmonyContext,harmonyTimeline,harmonyContext};
}

function scoreFromVariant(variantId,{musicalForm,absoluteBeat,key='C',bpm=60,title=null}={}){
  const variant=variantById(variantId);if(!variant)throw new Error(`FLOW missing variant ${variantId}`);
  const totalBeats=variantSpan(variant);
  if(Math.abs(totalBeats-4)>.001)throw new Error(`FLOW trade ${variantId} must span 4 beats`);
  const harmony=realizeHarmony(musicalForm,absoluteBeat,totalBeats,key),notes=transposeNotesFromC(variant.notes.map(n=>cloneNote(n)),key);
  return{
    id:`${variantId}-flow-${absoluteBeat}`,title:title||variantId,sourceKey:'C',key,bpm,meter:variant.meter||[4,4],notes,
    chords:harmony.harmonyTimeline.map(x=>x.chord),...harmony,totalBeats,unitBeats:4,movePolicy:'NONE',sourceVariantId:variantId,
  };
}

export function connectVariants(variantIds,{beatsPerPart=4}={}){
  const notes=[],sources=[];
  for(const [i,id] of variantIds.entries()){
    const variant=variantById(id);if(!variant)throw new Error(`FLOW missing variant ${id}`);
    const end=variantSpan(variant);
    if(Math.abs(end-beatsPerPart)>.001)throw new Error(`FLOW ${id} must span ${beatsPerPart} beats`);
    notes.push(...variant.notes.map(n=>cloneNote(n,i*beatsPerPart)));sources.push({variantId:id,familyId:variant.familyId});
  }
  return{notes,sources,totalBeats:variantIds.length*beatsPerPart};
}

export function buildClosingTradeEvent({musicalForm,startBeat,endBeat,key='C',bpm=60,eventId='flow-trade'}={}){
  const program=musicalForm?.closingFlowProgram;if(!program)return null;
  const callVariantId=program.tradeCallVariantId,responseVariantId=program.tradeResponseVariantId;
  if(!callVariantId||!responseVariantId)throw new Error(`${musicalForm.formId}: trade call/response variants are required`);
  const callVariant=variantById(callVariantId),responseVariant=variantById(responseVariantId);
  if(!callVariant||!responseVariant||callVariant.familyId!==program.familyId||responseVariant.familyId!==program.familyId)throw new Error(`${musicalForm.formId}: invalid trade family`);
  const callBeats=program.tradeCallBeats??4,audiateBeats=program.tradeAudiateBeats??4,singBeats=program.tradeSingBeats??4,spaceBeats=program.tradeSpaceBeats??4;
  const required=callBeats+audiateBeats+singBeats+spaceBeats,fieldBeats=endBeat-startBeat;
  if(Math.abs(required-fieldBeats)>.001)throw new Error(`${musicalForm.formId}: trade field must be ${required} beats`);
  if(Math.abs(variantSpan(callVariant)-callBeats)>.001||Math.abs(variantSpan(responseVariant)-singBeats)>.001)throw new Error(`${musicalForm.formId}: trade variants must match their musical slots`);
  const modelStartBeat=startBeat,modelEndBeat=modelStartBeat+callBeats,prepareBeat=modelEndBeat,singStartBeat=prepareBeat+audiateBeats,singEndBeat=singStartBeat+singBeats;
  const modelScoreModel=scoreFromVariant(callVariantId,{musicalForm,absoluteBeat:modelStartBeat,key,bpm,title:'Trade Call'});
  const scoreModel=scoreFromVariant(responseVariantId,{musicalForm,absoluteBeat:singStartBeat,key,bpm,title:'Trade Response'});
  const {harmonyTimeline,harmonyContext,sourceHarmonyTimeline,sourceHarmonyContext}=scoreModel,modelHarmonyTimeline=modelScoreModel.harmonyTimeline,modelSourceHarmonyTimeline=modelScoreModel.sourceHarmonyTimeline;
  const formPosition=Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4),baseField=`form:${musicalForm.formId}:trade`;
  return{
    eventId,familyId:program.familyId,variantId:null,title:'Trade · Listen and Answer',sourceKey:'C',key,
    sourceHarmonyFieldId:baseField,sourceHarmonyContext,sourceHarmonyTimeline,harmonyFieldId:keyedFieldId(baseField,key),harmonyContext,harmonyTimeline,modelHarmonyTimeline,modelSourceHarmonyTimeline,tonalFieldId:null,
    harmonyTransfer:true,tonalFieldTransfer:false,formTransfer:true,movePolicy:'NONE',form:musicalForm.formId,fieldBeats,formPosition,
    startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,modelStartBeat,modelEndBeat,
    presentationMode:'FLOW',modelPolicy:'TRADE_CALL',morphPolicy:'NONE',scoringPolicy:'FLOW',flowAction:'TRADE',scoreVisibility:'FULL',visibleBeats:scoreModel.totalBeats,
    flowSourceVariantIds:[callVariantId,responseVariantId],tradeCallVariantId:callVariantId,tradeResponseVariantId:responseVariantId,
    modelScoreModel,scoreModel,
  };
}

export function buildClosingFlowEvent({musicalForm,startBeat,endBeat,key='C',bpm=60,eventId='flow-closing',flowAction='CONNECT'}={}){
  if(!musicalForm?.closingFlowProgram)return null;
  if(!['CONNECT','RECALL'].includes(flowAction))throw new Error(`unsupported closing FLOW action ${flowAction}`);
  const program=musicalForm.closingFlowProgram,connected=connectVariants(program.variantIds,{beatsPerPart:program.beatsPerPart||4});
  const fieldBeats=endBeat-startBeat;
  if(fieldBeats<connected.totalBeats+4)throw new Error(`${musicalForm.formId}: closing FLOW field too short`);
  const singStartBeat=endBeat-(program.responseBeats??4)-connected.totalBeats,singEndBeat=singStartBeat+connected.totalBeats,prepareBeat=Math.max(startBeat,singStartBeat-(program.audiateBeats??8));
  const harmony=realizeHarmony(musicalForm,singStartBeat,connected.totalBeats,key),formPosition=Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4);
  const recall=flowAction==='RECALL',scoreVisibility=recall?'PARTIAL':'FULL',visibleBeats=recall?connected.totalBeats/2:connected.totalBeats,notes=transposeNotesFromC(connected.notes,key),baseField=`form:${musicalForm.formId}:flow`;
  return{
    eventId,familyId:program.familyId,variantId:null,title:program.title||'Connect the Move',sourceKey:'C',key,
    sourceHarmonyFieldId:baseField,sourceHarmonyContext:harmony.sourceHarmonyContext,sourceHarmonyTimeline:harmony.sourceHarmonyTimeline,harmonyFieldId:keyedFieldId(baseField,key),harmonyContext:harmony.harmonyContext,harmonyTimeline:harmony.harmonyTimeline,tonalFieldId:null,
    harmonyTransfer:true,tonalFieldTransfer:false,formTransfer:true,movePolicy:'NONE',form:musicalForm.formId,fieldBeats,formPosition,
    startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:'FLOW',modelPolicy:'NONE',morphPolicy:'NONE',scoringPolicy:'FLOW',
    flowAction,scoreVisibility,visibleBeats,flowSourceVariantIds:[...program.variantIds],
    scoreModel:{id:`${musicalForm.formId}-closing-flow`,title:program.title||'Connect the Move',sourceKey:'C',key,sourceHarmonyContext:harmony.sourceHarmonyContext,harmonyContext:harmony.harmonyContext,bpm,meter:[4,4],notes,chords:harmony.harmonyTimeline.map(x=>x.chord),harmonyTimeline:harmony.harmonyTimeline,totalBeats:connected.totalBeats,unitBeats:4,movePolicy:'NONE',sourceVariantIds:[...program.variantIds]}
  };
}

export function buildOneChorusFlowEvent({musicalForm,startBeat,endBeat,key='C',bpm=60,eventId='flow-one-chorus'}={}){
  const program=musicalForm?.closingFlowProgram;if(!program)return null;
  const repeats=Number(program.oneChorusRepeats??3),beatsPerPart=program.beatsPerPart||4,preReadBeats=Number(program.oneChorusPreReadBeats??16);
  if(!Number.isInteger(repeats)||repeats<1)throw new Error(`${musicalForm.formId}: one-chorus repeats must be a positive integer`);
  const variantIds=Array.from({length:repeats},()=>program.variantIds).flat(),connected=connectVariants(variantIds,{beatsPerPart});
  if(connected.sources.some(source=>source.familyId!==program.familyId))throw new Error(`${musicalForm.formId}: one-chorus FLOW must stay inside ${program.familyId}`);
  if(Math.abs(connected.totalBeats-musicalForm.lengthBeats)>.001)throw new Error(`${musicalForm.formId}: one-chorus score must span exactly ${musicalForm.lengthBeats} beats`);
  const fieldBeats=endBeat-startBeat;if(fieldBeats+1e-9<preReadBeats+connected.totalBeats)throw new Error(`${musicalForm.formId}: one-chorus field needs ${preReadBeats+connected.totalBeats} beats`);
  const singEndBeat=endBeat,singStartBeat=singEndBeat-connected.totalBeats,prepareBeat=singStartBeat-preReadBeats;
  if(prepareBeat<startBeat-1e-9)throw new Error(`${musicalForm.formId}: one-chorus pre-read starts before its field`);
  const localStart=((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats;if(Math.abs(localStart)>.001)throw new Error(`${musicalForm.formId}: one-chorus SING must begin on the form downbeat`);
  const harmony=realizeHarmony(musicalForm,singStartBeat,connected.totalBeats,key),title=program.oneChorusTitle||'1 Chorus · Keep the Form',notes=transposeNotesFromC(connected.notes,key),baseField=`form:${musicalForm.formId}:one-chorus`;
  return{
    eventId,familyId:program.familyId,variantId:null,title,sourceKey:'C',key,
    sourceHarmonyFieldId:baseField,sourceHarmonyContext:harmony.sourceHarmonyContext,sourceHarmonyTimeline:harmony.sourceHarmonyTimeline,harmonyFieldId:keyedFieldId(baseField,key),harmonyContext:harmony.harmonyContext,harmonyTimeline:harmony.harmonyTimeline,tonalFieldId:null,
    harmonyTransfer:true,tonalFieldTransfer:false,formTransfer:true,movePolicy:'NONE',form:musicalForm.formId,fieldBeats,formPosition:0,
    startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:'FLOW',modelPolicy:'NONE',morphPolicy:'NONE',scoringPolicy:'FLOW',
    flowAction:'ONE_CHORUS',scoreVisibility:'FULL',visibleBeats:connected.totalBeats,flowSourceVariantIds:variantIds,
    scoreModel:{id:`${musicalForm.formId}-one-chorus-flow`,title,sourceKey:'C',key,sourceHarmonyContext:harmony.sourceHarmonyContext,harmonyContext:harmony.harmonyContext,bpm,meter:[4,4],notes,chords:harmony.harmonyTimeline.map(x=>x.chord),harmonyTimeline:harmony.harmonyTimeline,totalBeats:connected.totalBeats,unitBeats:4,movePolicy:'NONE',sourceVariantIds:variantIds}
  };
}

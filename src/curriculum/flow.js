import {variantById} from './variantRegistry.js';
import {sliceFormHarmony} from './musicalForms.js';

const cloneNote=(n,offset=0)=>({...n,startBeat:Number(n.startBeat)+offset});
const variantSpan=variant=>Math.max(0,...variant.notes.map(n=>n.startBeat+n.duration));

function scoreFromVariant(variantId,{musicalForm,absoluteBeat,key='C',bpm=60,title=null}={}){
  const variant=variantById(variantId);if(!variant)throw new Error(`FLOW missing variant ${variantId}`);
  const totalBeats=variantSpan(variant);
  if(Math.abs(totalBeats-4)>.001)throw new Error(`FLOW trade ${variantId} must span 4 beats`);
  const harmonyTimeline=sliceFormHarmony(musicalForm,absoluteBeat,totalBeats);
  return{
    id:`${variantId}-flow-${absoluteBeat}`,
    title:title||variantId,
    key,bpm,meter:variant.meter||[4,4],notes:variant.notes.map(n=>cloneNote(n)),
    chords:harmonyTimeline.map(x=>x.chord),harmonyTimeline,totalBeats,unitBeats:4,movePolicy:'NONE',sourceVariantId:variantId,
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
  const harmonyTimeline=scoreModel.harmonyTimeline,harmonyContext=harmonyTimeline[0]?.chord||key,modelHarmonyTimeline=modelScoreModel.harmonyTimeline;
  const formPosition=Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4);
  return{
    eventId,familyId:program.familyId,variantId:null,title:'Trade · Listen and Answer',key,
    harmonyFieldId:`form:${musicalForm.formId}:trade`,harmonyContext,harmonyTimeline,modelHarmonyTimeline,tonalFieldId:null,
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
  const harmonyTimeline=sliceFormHarmony(musicalForm,singStartBeat,connected.totalBeats),harmonyContext=harmonyTimeline[0]?.chord||key,formPosition=Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4);
  const recall=flowAction==='RECALL',scoreVisibility=recall?'PARTIAL':'FULL',visibleBeats=recall?connected.totalBeats/2:connected.totalBeats;
  return{
    eventId,familyId:program.familyId,variantId:null,title:program.title||'Connect the Move',key,
    harmonyFieldId:`form:${musicalForm.formId}:flow`,harmonyContext,harmonyTimeline,tonalFieldId:null,
    harmonyTransfer:true,tonalFieldTransfer:false,formTransfer:true,movePolicy:'NONE',form:musicalForm.formId,fieldBeats,formPosition,
    startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:'FLOW',modelPolicy:'NONE',morphPolicy:'NONE',scoringPolicy:'FLOW',
    flowAction,scoreVisibility,visibleBeats,flowSourceVariantIds:[...program.variantIds],
    scoreModel:{id:`${musicalForm.formId}-closing-flow`,title:program.title||'Connect the Move',key,bpm,meter:[4,4],notes:connected.notes,chords:harmonyTimeline.map(x=>x.chord),harmonyTimeline,totalBeats:connected.totalBeats,unitBeats:4,movePolicy:'NONE',sourceVariantIds:[...program.variantIds]}
  };
}

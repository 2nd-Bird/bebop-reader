import {variantById} from './variantRegistry.js';
import {sliceFormHarmony} from './musicalForms.js';

const cloneNote=(n,offset)=>({...n,startBeat:Number(n.startBeat)+offset});

export function connectVariants(variantIds,{beatsPerPart=4}={}){
  const notes=[],sources=[];
  for(const [i,id] of variantIds.entries()){
    const variant=variantById(id);if(!variant)throw new Error(`FLOW missing variant ${id}`);
    const end=Math.max(0,...variant.notes.map(n=>n.startBeat+n.duration));
    if(Math.abs(end-beatsPerPart)>.001)throw new Error(`FLOW ${id} must span ${beatsPerPart} beats`);
    notes.push(...variant.notes.map(n=>cloneNote(n,i*beatsPerPart)));sources.push({variantId:id,familyId:variant.familyId});
  }
  return{notes,sources,totalBeats:variantIds.length*beatsPerPart};
}

export function buildClosingFlowEvent({musicalForm,startBeat,endBeat,key='C',bpm=60,eventId='flow-closing',flowAction='CONNECT'}={}){
  if(!musicalForm?.closingFlowProgram)return null;
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

import {connectVariants} from './flow.js';
import {sliceFormHarmony} from './musicalForms.js';
import {transposeHarmonyTimelineFromC,transposeNotesFromC} from './keyTransfer.js';

const keyedFieldId=(base,key)=>key==='C'?base:`${base}@key:${key}`;
export function buildPairFlowEvent({musicalForm,startBeat,endBeat,key='C',bpm=60,eventId='flow-pair',flowAction='REPEAT'}={}){
  const program=musicalForm?.closingFlowProgram;if(!program)return null;
  if(!['REPEAT','MUTATION'].includes(flowAction))throw new Error(`unsupported pair FLOW action ${flowAction}`);
  const baseIds=program.variantIds||[];
  if(baseIds.length<2)throw new Error(`${musicalForm.formId}: pair FLOW needs at least two known variants`);
  const variantIds=flowAction==='REPEAT'?[baseIds[0],baseIds[0]]:[baseIds[0],baseIds[1]];
  const connected=connectVariants(variantIds,{beatsPerPart:program.beatsPerPart||4});
  if(connected.sources.some(source=>source.familyId!==program.familyId))throw new Error(`${musicalForm.formId}: pair FLOW must stay inside ${program.familyId}`);
  if(Math.abs(connected.totalBeats-8)>.001)throw new Error(`${musicalForm.formId}: pair FLOW must span two bars`);
  const fieldBeats=endBeat-startBeat,preReadBeats=4,responseBeats=4;
  if(Math.abs(fieldBeats-(preReadBeats+connected.totalBeats+responseBeats))>.001)throw new Error(`${musicalForm.formId}: pair FLOW must fit one 16-beat field`);
  const prepareBeat=startBeat,singStartBeat=startBeat+preReadBeats,singEndBeat=singStartBeat+connected.totalBeats;
  const sourceHarmonyTimeline=sliceFormHarmony(musicalForm,singStartBeat,connected.totalBeats),sourceHarmonyContext=sourceHarmonyTimeline[0]?.chord||'C';
  const harmonyTimeline=transposeHarmonyTimelineFromC(sourceHarmonyTimeline,key),harmonyContext=harmonyTimeline[0]?.chord||key,notes=transposeNotesFromC(connected.notes,key);
  const formPosition=Math.floor((((singStartBeat%musicalForm.lengthBeats)+musicalForm.lengthBeats)%musicalForm.lengthBeats)/4),title=flowAction==='REPEAT'?'Repeat · Keep the Move':'Mutation · Let It Change',baseField=`form:${musicalForm.formId}:${flowAction.toLowerCase()}`;
  return{
    eventId,familyId:program.familyId,variantId:null,title,sourceKey:'C',key,
    sourceHarmonyFieldId:baseField,sourceHarmonyContext,sourceHarmonyTimeline,harmonyFieldId:keyedFieldId(baseField,key),harmonyContext,harmonyTimeline,tonalFieldId:null,
    harmonyTransfer:true,tonalFieldTransfer:false,formTransfer:true,movePolicy:'NONE',form:musicalForm.formId,fieldBeats,formPosition,
    startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:'FLOW',modelPolicy:'NONE',morphPolicy:'NONE',scoringPolicy:'FLOW',
    flowAction,scoreVisibility:'FULL',visibleBeats:connected.totalBeats,flowSourceVariantIds:variantIds,
    scoreModel:{id:`${musicalForm.formId}-${flowAction.toLowerCase()}-flow`,title,sourceKey:'C',key,sourceHarmonyContext,harmonyContext,bpm,meter:[4,4],notes,chords:harmonyTimeline.map(x=>x.chord),harmonyTimeline,totalBeats:connected.totalBeats,unitBeats:4,movePolicy:'NONE',sourceVariantIds:variantIds}
  };
}

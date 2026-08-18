import {variantById} from './variantRegistry.js';
import {sliceFormHarmony} from './musicalForms.js';
import {transposeHarmonyTimelineFromC,transposeNotesFromC} from './keyTransfer.js';

const cloneNote=(note,offset=0)=>({...note,startBeat:Number(note.startBeat)+offset});
const variantSpan=variant=>Math.max(0,...variant.notes.map(n=>n.startBeat+n.duration));
const keyedFieldId=(base,key)=>key==='C'?base:`${base}@key:${key}`;

function candidateModel(variantId,{key='C',bpm=60}={}){
 const variant=variantById(variantId);if(!variant)throw new Error(`FREE_FLOW missing variant ${variantId}`);
 if(Math.abs(variantSpan(variant)-4)>.001)throw new Error(`FREE_FLOW ${variantId} must span one four-beat bar`);
 return{id:`free-flow-candidate-${variantId}`,title:variantId,sourceKey:'C',key,bpm,meter:variant.meter||[4,4],notes:transposeNotesFromC(variant.notes.map(n=>cloneNote(n)),key),totalBeats:4,unitBeats:4,sourceVariantId:variantId};
}

export function buildCBluesFreeFlowEvent({musicalForm,startBeat,endBeat,key='C',bpm=60,eventId='flow-free-flow'}={}){
 const program=musicalForm?.closingFlowProgram;if(!program||musicalForm.formId!=='c-blues-12')return null;
 const familyId=program.familyId,candidateVariantIds=[...new Set(program.variantIds||[])],cueVariantId=candidateVariantIds[0];
 if(!cueVariantId||candidateVariantIds.length<2)throw new Error(`${musicalForm.formId}: FREE_FLOW needs a cue plus multiple known variants`);
 for(const id of candidateVariantIds){const variant=variantById(id);if(!variant||variant.familyId!==familyId)throw new Error(`${musicalForm.formId}: FREE_FLOW candidate ${id} must stay inside ${familyId}`);if(Math.abs(variantSpan(variant)-4)>.001)throw new Error(`${musicalForm.formId}: FREE_FLOW candidate ${id} must span four beats`);}
 const preReadBeats=16,chorusBeats=musicalForm.lengthBeats,fieldBeats=endBeat-startBeat;
 if(Math.abs(chorusBeats-48)>.001)throw new Error(`${musicalForm.formId}: v1 FREE_FLOW expects 48-beat C Blues`);
 if(fieldBeats+1e-9<preReadBeats+chorusBeats)throw new Error(`${musicalForm.formId}: FREE_FLOW field needs ${preReadBeats+chorusBeats} beats`);
 const singEndBeat=endBeat,singStartBeat=singEndBeat-chorusBeats,prepareBeat=singStartBeat-preReadBeats;
 if(prepareBeat<startBeat-1e-9)throw new Error(`${musicalForm.formId}: FREE_FLOW pre-read starts before its field`);
 const localStart=((singStartBeat%chorusBeats)+chorusBeats)%chorusBeats;if(Math.abs(localStart)>.001)throw new Error(`${musicalForm.formId}: FREE_FLOW SING must begin on the form downbeat`);
 const sourceHarmonyTimeline=sliceFormHarmony(musicalForm,singStartBeat,chorusBeats),sourceHarmonyContext=sourceHarmonyTimeline[0]?.chord||'C',harmonyTimeline=transposeHarmonyTimelineFromC(sourceHarmonyTimeline,key),harmonyContext=harmonyTimeline[0]?.chord||key;
 const cueVariant=variantById(cueVariantId),cueBars=[0,4,8],notes=[];
 for(const barIndex of cueBars)notes.push(...transposeNotesFromC(cueVariant.notes.map(n=>cloneNote(n,barIndex*4)),key));
 const freeFlowSlots=Array.from({length:12},(_,barIndex)=>({
  barIndex,beat:barIndex*4,cue:cueBars.includes(barIndex),visibleVariantId:cueBars.includes(barIndex)?cueVariantId:null,
  candidateModels:(cueBars.includes(barIndex)?[cueVariantId]:candidateVariantIds).map(variantId=>candidateModel(variantId,{key,bpm})),
 }));
 const baseField=`form:${musicalForm.formId}:free-flow`,title='Free Flow · Cue and Connect';
 return{
  eventId,familyId,variantId:null,title,sourceKey:'C',key,
  sourceHarmonyFieldId:baseField,sourceHarmonyContext,sourceHarmonyTimeline,harmonyFieldId:keyedFieldId(baseField,key),harmonyContext,harmonyTimeline,tonalFieldId:null,
  harmonyTransfer:true,tonalFieldTransfer:false,formTransfer:true,movePolicy:'NONE',form:musicalForm.formId,fieldBeats,formPosition:0,
  startBeat,prepareBeat,singStartBeat,singEndBeat,endBeat,presentationMode:'FLOW',modelPolicy:'NONE',morphPolicy:'NONE',scoringPolicy:'FREE_FLOW',
  flowAction:'FREE_FLOW',scoreVisibility:'CUE_BARS',visibleBeats:chorusBeats,flowSourceVariantIds:candidateVariantIds,freeFlowCueVariantId:cueVariantId,freeFlowCandidateVariantIds:candidateVariantIds,freeFlowSlots,
  scoreModel:{id:`${musicalForm.formId}-free-flow`,title,sourceKey:'C',key,bpm,meter:[4,4],notes,chords:harmonyTimeline.map(x=>x.chord),harmonyTimeline,totalBeats:chorusBeats,unitBeats:4,movePolicy:'NONE',sourceVariantIds:candidateVariantIds}
 };
}

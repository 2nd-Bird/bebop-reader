const cloneNote=(note,offset=0)=>({...note,startBeat:Number(note.startBeat)+offset});
const cloneHarmony=(entry,offset=0)=>({...entry,beat:Number(entry.beat)+offset});

export function buildTrainingClosingFlowEvent({sourceEvent,startBeat=sourceEvent?.startBeat,endBeat=sourceEvent?.endBeat,bpm=60,eventId=null}={}){
  if(!sourceEvent?.scoreModel||sourceEvent.keyTransfer||sourceEvent.presentationMode==='FLOW')return null;
  const model=sourceEvent.scoreModel,sourceBeats=Number(model.totalBeats),fieldBeats=Number(endBeat)-Number(startBeat);
  if(!Number.isFinite(sourceBeats)||sourceBeats<=0||!Number.isFinite(fieldBeats)||fieldBeats<=0)return null;
  const repeats=sourceBeats*2+8<=fieldBeats?2:1,flowBeats=sourceBeats*repeats;
  if(flowBeats+8>fieldBeats)return null;
  const remaining=fieldBeats-flowBeats,preReadBeats=Math.min(8,remaining-4),singStartBeat=Number(startBeat)+preReadBeats,singEndBeat=singStartBeat+flowBeats;
  if(preReadBeats<4||Number(endBeat)-singEndBeat<4)return null;
  const audiateBeats=Math.min(4,preReadBeats),prepareBeat=singStartBeat-audiateBeats,notes=[],harmonyTimeline=[],sourceVariantIds=[];
  for(let i=0;i<repeats;i++){
    const offset=i*sourceBeats;
    notes.push(...(model.notes||[]).map(note=>cloneNote(note,offset)));
    harmonyTimeline.push(...(model.harmonyTimeline||[{beat:0,chord:sourceEvent.harmonyContext||sourceEvent.key||'C'}]).map(entry=>cloneHarmony(entry,offset)));
    if(sourceEvent.variantId)sourceVariantIds.push(sourceEvent.variantId);
  }
  const flowAction=repeats===2?'REPEAT':'CONNECT',title=repeats===2?'Closing FLOW · Repeat the Move':'Closing FLOW · Keep the Line',key=sourceEvent.key||model.key||'C';
  return{
    eventId:eventId||`${sourceEvent.eventId||'event'}-closing-flow`,familyId:sourceEvent.familyId,variantId:null,title,sourceKey:sourceEvent.sourceKey||'C',key,keyTransfer:false,warmup:false,
    sourceHarmonyFieldId:sourceEvent.sourceHarmonyFieldId||sourceEvent.harmonyFieldId||null,sourceHarmonyContext:sourceEvent.sourceHarmonyContext||model.sourceHarmonyContext||sourceEvent.harmonyContext,
    harmonyFieldId:sourceEvent.harmonyFieldId||null,harmonyContext:harmonyTimeline[0]?.chord||sourceEvent.harmonyContext||key,harmonyTimeline,tonalFieldId:sourceEvent.tonalFieldId||null,
    harmonyTransfer:false,tonalFieldTransfer:false,formTransfer:false,movePolicy:sourceEvent.movePolicy||'NONE',form:sourceEvent.form,fieldBeats,formPosition:sourceEvent.formPosition??0,
    startBeat:Number(startBeat),prepareBeat,singStartBeat,singEndBeat,endBeat:Number(endBeat),presentationMode:'FLOW',modelPolicy:'NONE',morphPolicy:'NONE',scoringPolicy:'FLOW',
    flowAction,scoreVisibility:'FULL',visibleBeats:flowBeats,flowSourceVariantIds:sourceVariantIds,
    scoreModel:{...model,id:`${model.id||sourceEvent.eventId}-closing-flow`,title,sourceKey:sourceEvent.sourceKey||model.sourceKey||'C',key,bpm:Number(bpm)||model.bpm||60,notes,harmonyTimeline,chords:harmonyTimeline.map(x=>x.chord),totalBeats:flowBeats,sourceVariantId:null,sourceVariantIds}
  };
}

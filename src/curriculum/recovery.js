const scoreBeats=e=>e?.scoreModel?.totalBeats??Math.max(0,(e?.singEndBeat||0)-(e?.singStartBeat||0));
export function findEchoSlot(events,missedEvent,occupied=new Set()){
  const sourceBeats=scoreBeats(missedEvent);
  return (events||[]).find(e=>{
    if(e.startBeat<=missedEvent.endBeat||occupied.has(e.eventId)||e.modelPolicy!=='NONE')return false;
    const naturalLead=Math.max(0,e.singStartBeat-e.startBeat);
    if(naturalLead>=sourceBeats)return true;
    const targetBeats=scoreBeats(e),fieldBeats=(e.endBeat||0)-(e.startBeat||0);
    return fieldBeats>=sourceBeats+targetBeats;
  })||null;
}

export function scheduleDelayedRetry(events,missedEvent,{minGapEvents=2}={}){
  if(!missedEvent)return null;
  const list=events||[],sourceIndex=list.findIndex(e=>e.eventId===missedEvent.eventId);
  if(sourceIndex<0)return null;
  const requiredBeats=scoreBeats(missedEvent);
  const target=list.slice(sourceIndex+minGapEvents+1).find(e=>e.familyId===missedEvent.familyId&&e.modelPolicy==='NONE'&&!e.echoOfEventId&&(e.endBeat-e.singStartBeat)>=requiredBeats);
  if(!target)return null;
  target.variantId=missedEvent.variantId;
  target.scoreModel=missedEvent.scoreModel;
  target.singEndBeat=target.singStartBeat+requiredBeats;
  target.key=missedEvent.key||target.key;
  target.sourceKey=missedEvent.sourceKey||target.sourceKey||'C';
  target.keyTransfer=Boolean(missedEvent.keyTransfer);
  target.sourceHarmonyFieldId=missedEvent.sourceHarmonyFieldId||null;
  target.sourceHarmonyContext=missedEvent.sourceHarmonyContext||null;
  target.harmonyFieldId=missedEvent.harmonyFieldId;
  target.harmonyContext=missedEvent.harmonyContext;
  target.harmonyTimeline=(missedEvent.harmonyTimeline||[]).map(x=>({...x}));
  target.tonalFieldId=missedEvent.tonalFieldId||null;
  target.presentationMode='DELAYED_READ';
  target.modelPolicy='NONE';
  target.morphPolicy='NONE';
  target.morph=null;
  target.retryOfEventId=missedEvent.eventId;
  return target;
}

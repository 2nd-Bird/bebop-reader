export function findEchoSlot(events,missedEvent,occupied=new Set()){
  return (events||[]).find(e=>e.startBeat>missedEvent.endBeat&&!occupied.has(e.eventId)&&e.modelPolicy==='NONE')||null;
}

export function scheduleDelayedRetry(events,missedEvent,{minGapEvents=2}={}){
  if(!missedEvent)return null;
  const list=events||[],sourceIndex=list.findIndex(e=>e.eventId===missedEvent.eventId);
  if(sourceIndex<0)return null;
  const requiredBeats=missedEvent.scoreModel?.totalBeats??(missedEvent.singEndBeat-missedEvent.singStartBeat);
  const target=list.slice(sourceIndex+minGapEvents+1).find(e=>e.familyId===missedEvent.familyId&&e.modelPolicy==='NONE'&&(e.endBeat-e.singStartBeat)>=requiredBeats);
  if(!target)return null;
  target.variantId=missedEvent.variantId;
  target.scoreModel=missedEvent.scoreModel;
  target.singEndBeat=target.singStartBeat+requiredBeats;
  target.harmonyFieldId=missedEvent.harmonyFieldId;
  target.harmonyContext=missedEvent.harmonyContext;
  target.harmonyTimeline=(missedEvent.harmonyTimeline||[]).map(x=>({...x}));
  target.presentationMode='DELAYED_READ';
  target.modelPolicy='NONE';
  target.morphPolicy='NONE';
  target.morph=null;
  target.retryOfEventId=missedEvent.eventId;
  return target;
}

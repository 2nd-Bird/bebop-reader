export function findEchoSlot(events,missedEvent,occupied=new Set()){
  return (events||[]).find(e=>e.startBeat>missedEvent.endBeat&&!occupied.has(e.eventId)&&e.modelPolicy==='NONE')||null;
}

export function scheduleDelayedRetry(events,missedEvent,{minGapEvents=2}={}){
  if(!missedEvent)return null;
  const list=events||[];
  const sourceIndex=list.findIndex(e=>e.eventId===missedEvent.eventId);
  if(sourceIndex<0)return null;
  const target=list.slice(sourceIndex+minGapEvents+1).find(e=>e.familyId===missedEvent.familyId&&e.modelPolicy==='NONE');
  if(!target)return null;
  target.variantId=missedEvent.variantId;
  target.scoreModel=missedEvent.scoreModel;
  target.presentationMode='DELAYED_READ';
  target.modelPolicy='NONE';
  target.morphPolicy='NONE';
  target.morph=null;
  target.retryOfEventId=missedEvent.eventId;
  return target;
}

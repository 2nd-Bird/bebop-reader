export function echoAtBeat(echoWindows=[],beat){
  return echoWindows.find(x=>beat>=x.startBeat&&beat<x.endBeat)||null;
}

export function recoveryDisplayState({event,beat,echoWindows=[],events=[]}={}){
  const echo=echoAtBeat(echoWindows,beat);
  if(!echo)return{echo:null,event,displayToken:event?.eventId||null,progress:null};
  const source=events.find(candidate=>candidate.eventId===echo.sourceEventId)||event;
  const span=Math.max(.000001,Number(echo.endBeat)-Number(echo.startBeat));
  const progress=Math.max(0,Math.min(1,(Number(beat)-Number(echo.startBeat))/span));
  return{echo,event:source,displayToken:`echo:${echo.sourceEventId}`,progress};
}

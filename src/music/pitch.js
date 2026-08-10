export const foldMidiToTarget=(midi,targetMidi)=>{
  if(!Number.isFinite(midi)||!Number.isFinite(targetMidi))return midi;
  return midi+12*Math.round((targetMidi-midi)/12);
};

export const centsFromMidi=(midi,targetMidi)=>(foldMidiToTarget(midi,targetMidi)-targetMidi)*100;

export function targetAtTime(ex,t){
  const spb=60/ex.bpm;
  return ex.notes.find(n=>!n.rest&&t>=n.startBeat*spb&&t<(n.startBeat+n.duration)*spb)||null;
}

export function normalizeTraceToMovableDo(ex,trace){
  return (trace||[]).map(p=>{
    const target=targetAtTime(ex,p.t);
    if(!target||!Number.isFinite(p.midi))return {...p,displayMidi:p.midi,targetMidi:null};
    return {...p,displayMidi:foldMidiToTarget(p.midi,target.midi),targetMidi:target.midi};
  });
}

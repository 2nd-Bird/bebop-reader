import {getAudioContext,getMasterBus} from './context.js';
import {midiToFreq} from '../pitchDetector.js';

export function modelSchedule({scoreModel,startBeat=0}={}){
  if(!scoreModel)return [];
  return (scoreModel.notes||[]).filter(n=>!n.rest&&Number.isFinite(n.midi)).map(n=>({
    beat:startBeat+n.startBeat,
    durationBeats:n.duration,
    midi:n.midi,
    freq:midiToFreq(n.midi),
  }));
}

export function scheduleModelPhrase({transport,scoreModel,startBeat=0,volume=0.11,type='sine'}={}){
  const ctx=getAudioContext(),out=getMasterBus(),nodes=[];
  for(const note of modelSchedule({scoreModel,startBeat})){
    const scheduled=transport.timeAtBeat(note.beat);
    const start=Math.max(scheduled,ctx.currentTime+0.012);
    const duration=Math.max(0.04,note.durationBeats*transport.secondsPerBeat*0.88);
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(note.freq,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.exponentialRampToValueAtTime(volume,start+0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    osc.connect(gain);gain.connect(out);osc.start(start);osc.stop(start+duration+0.02);
    nodes.push(osc);
  }
  return ()=>{for(const node of nodes){try{node.stop();}catch{}}};
}

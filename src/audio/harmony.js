import {getAudioContext,getMasterBus} from './context.js';
import {midiToFreq} from '../pitchDetector.js';

const VOICINGS={
  C:[48,52,55],
  C7:[48,52,55,58],
  FMaj7:[53,57,60,64],
  G7sus4:[55,60,62,65],
  Dm7:[50,53,57,60],
};

export function harmonyCueSchedule({scoreModel,startBeat=0}={}){
  return (scoreModel?.harmonyTimeline||[]).map(h=>({beat:startBeat+h.beat,chord:h.chord,midis:[...(VOICINGS[h.chord]||[])]})).filter(x=>x.midis.length);
}

export function scheduleHarmonyCues({transport,scoreModel,startBeat=0,volume=.022,durationBeats=.42}={}){
  const ctx=getAudioContext(),out=getMasterBus(),nodes=[];
  for(const cue of harmonyCueSchedule({scoreModel,startBeat})){
    const scheduled=transport.timeAtBeat(cue.beat),start=Math.max(scheduled,ctx.currentTime+.012),duration=Math.max(.08,durationBeats*transport.secondsPerBeat);
    for(const midi of cue.midis){
      const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(midiToFreq(midi),start);
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.018);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      osc.connect(gain);gain.connect(out);osc.start(start);osc.stop(start+duration+.03);nodes.push(osc);
    }
  }
  return()=>{for(const node of nodes){try{node.stop();}catch{}}};
}

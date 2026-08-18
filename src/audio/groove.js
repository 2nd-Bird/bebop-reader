import { getAudioContext, getMasterBus } from './context.js';
import { scheduleClickAtTime } from './countIn.js';

const NOTE_PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function chordRootFreq(chord,key='C'){
  const m=String(chord||key).match(/^([A-G])([#b]?)/);if(!m)return 261.63;
  let pc=NOTE_PC[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0),midi=60+((pc%12)+12)%12;
  // Keep the tonal orientation in a phone-speaker-safe register. C–G live in octave 4;
  // A/B wrap to octave 3 so every root remains roughly 220–392 Hz instead of dropping to G2/C3.
  if(midi>67)midi-=12;
  return 440*Math.pow(2,(midi-69)/12);
}
function scheduleTone({ time, freq, duration, volume, type = 'sine' }) {
  const ctx = getAudioContext(),out = getMasterBus(),osc = ctx.createOscillator(),gain = ctx.createGain();
  osc.type = type;osc.frequency.setValueAtTime(freq, time);gain.gain.setValueAtTime(0.0001, time);gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), time + 0.006);gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);osc.connect(gain);gain.connect(out);osc.start(time);osc.stop(time + duration + 0.02);
  return () => { try { osc.stop(); } catch {} };
}

const pushHarmony=(out,event,anchor)=>{
  for(const h of event.harmonyTimeline||[]){const beat=anchor+Number(h.beat||0);if(beat<(event.endBeat??Infinity))out.push({beat,chord:h.chord});}
};
export function sessionHarmonyPulses(plan){
  if(plan?.formHarmonyTimeline?.length){
    const byBeat=new Map();
    for(const x of plan.formHarmonyTimeline.slice().sort((a,b)=>a.beat-b.beat))byBeat.set(Number(x.beat),{beat:Number(x.beat),chord:x.chord});
    return [...byBeat.values()].sort((a,b)=>a.beat-b.beat);
  }
  const out=[];
  for(const event of plan?.events||[]){
    const local=event.harmonyTimeline?.length?event.harmonyTimeline:[{beat:0,chord:event.harmonyContext||plan.key||'C'}];
    const firstChord=local[0]?.chord||plan.key||'C';
    if(!event.harmonyTimeline?.length)event.harmonyTimeline=local;
    out.push({beat:event.startBeat,chord:firstChord});
    if(event.modelPolicy==='TEACHER_CALL'&&event.modelStartBeat!=null)pushHarmony(out,event,event.modelStartBeat);
    pushHarmony(out,event,event.singStartBeat);
  }
  const byBeat=new Map();for(const x of out.sort((a,b)=>a.beat-b.beat))byBeat.set(`${x.beat}:${x.chord}`,x);
  return [...byBeat.values()].sort((a,b)=>a.beat-b.beat);
}
function activeChordAtBeat(pulses,beat,fallback='C'){
  let chord=fallback;for(const p of pulses){if(p.beat>beat+1e-9)break;chord=p.chord||chord;}return chord;
}
export function grooveEvents({ fromBeat = 0, toBeat = 16, key = 'C', beatsPerBar = 4, harmonyPulses=[] } = {}) {
  const events = [];
  for (let beat = Math.max(0, Math.ceil(fromBeat)); beat < toBeat; beat += 1) {
    const beatInBar = beat % beatsPerBar,chord=activeChordAtBeat(harmonyPulses,beat,key),root=chordRootFreq(chord,key),change=harmonyPulses.find(x=>Math.abs(x.beat-beat)<1e-6);
    events.push({ kind: 'click', beat, accent: beatInBar === 0, level: beatInBar === 0 ? 0.95 : 0.72 });
    if(change||beatInBar===0)events.push({ kind:'tone',beat,freq:root,durationBeats:.58,volume:.13,type:'triangle',chord });
    else if(beatInBar===2)events.push({ kind:'tone',beat,freq:root*1.5,durationBeats:.42,volume:.075,type:'triangle',chord });
  }
  return events;
}

export function startGroove({ transport, key = 'C', plan=null, totalBeats = Infinity, fromBeat = 0, lookaheadSec = 8, intervalMs = 500, primeBeats = 16 } = {}) {
  const ctx = getAudioContext(),harmonyPulses=sessionHarmonyPulses(plan);
  let nextBeat = Math.max(0, Math.ceil(fromBeat)),stopped = false,scheduledBeats = nextBeat;
  const cancelNodes = [];
  const scheduleThroughBeat = beatLimit => {
    const endBeat = Math.min(totalBeats, Math.max(nextBeat, Math.ceil(beatLimit)));if (endBeat <= nextBeat) return;
    for (const event of grooveEvents({ fromBeat: nextBeat, toBeat: endBeat, key, beatsPerBar: transport.beatsPerBar, harmonyPulses })) {
      const scheduledTime = transport.timeAtBeat(event.beat);if (scheduledTime < ctx.currentTime - 0.03) continue;const time = Math.max(scheduledTime, ctx.currentTime + 0.008);
      if (event.kind === 'click') cancelNodes.push(scheduleClickAtTime(time, { accent: event.accent, level: event.level }));
      else cancelNodes.push(scheduleTone({time,freq:event.freq,duration:Math.max(0.04,event.durationBeats*transport.secondsPerBeat),volume:event.volume,type:event.type}));
    }
    scheduledBeats = Math.max(scheduledBeats, endBeat);nextBeat = endBeat;
  };
  scheduleThroughBeat(Math.min(totalBeats, nextBeat + primeBeats));
  const schedule = () => {if (stopped || transport.state === 'stopped' || transport.state === 'paused') return;const horizonBeat = transport.beatAtTime(ctx.currentTime + lookaheadSec);scheduleThroughBeat(horizonBeat);};
  const timer = setInterval(schedule, intervalMs);
  const stop = () => {if(stopped)return;stopped=true;clearInterval(timer);for(const cancel of cancelNodes)cancel();};
  stop.status = () => ({ nextBeat, scheduledBeats, lookaheadSec, contextState: ctx.state });return stop;
}

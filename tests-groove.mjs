import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {sessionHarmonyPulses,grooveEvents} from './src/audio/groove.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const plan=buildDailySessionPlan({currentStage:5,eventCount:4});
const first=plan.events[0];
assert(first.familyId==='ii-v-i-voice-line','Stage 5 first event should be ii-V-I');
const pulses=sessionHarmonyPulses(plan).filter(x=>x.beat>=first.startBeat&&x.beat<first.endBeat);
const expected=[
  [first.startBeat,'Dm7'],[first.startBeat+2,'G7'],[first.startBeat+4,'Cmaj7'],
  [first.startBeat+8,'Dm7'],[first.startBeat+10,'G7'],[first.startBeat+12,'Cmaj7'],
];
for(const [beat,chord] of expected)assert(pulses.some(x=>x.beat===beat&&x.chord===chord),`missing ${chord} pulse at ${beat}`);
const tones=grooveEvents({fromBeat:first.startBeat,toBeat:first.startBeat+5,key:'C',beatsPerBar:4,harmonyPulses:pulses}).filter(x=>x.kind==='tone');
assert(tones.some(x=>x.beat===first.startBeat&&x.chord==='Dm7'),'groove should cue Dm7 root');
assert(tones.some(x=>x.beat===first.startBeat+2&&x.chord==='G7'),'groove should cue G7 root at change');
assert(tones.some(x=>x.beat===first.startBeat+4&&x.chord==='Cmaj7'),'groove should cue Cmaj7 root at resolution');
console.log('OK: groove follows Learning Event Harmony Field without theory-specific UI');

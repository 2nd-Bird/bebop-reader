import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {sessionHarmonyPulses,grooveEvents} from './src/audio/groove.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const stage3=buildDailySessionPlan({currentStage:3,eventCount:4,targetSessionBeats:64});
const teacherCalls=stage3.events.filter(e=>e.modelPolicy==='TEACHER_CALL');
assert(teacherCalls.length>=2,'Stage 3 introduces both current line families with audible Teacher Call');
assert(teacherCalls[0].scoreModel.notes.filter(n=>!n.rest).map(n=>n.pitch).join(',')==='G4,E4','first Stage 3 Teacher Call models G→E before user reading');
assert(teacherCalls[1].scoreModel.notes.filter(n=>!n.rest).map(n=>n.pitch).join(',')==='E4,C4','second Stage 3 Teacher Call models E→C before user reading');
for(const event of teacherCalls){
  assert(Number.isFinite(event.modelStartBeat)&&Number.isFinite(event.modelEndBeat)&&event.modelEndBeat>event.modelStartBeat,`${event.eventId}: Teacher Call must have a real model window`);
  assert(event.modelEndBeat<=event.prepareBeat,`${event.eventId}: model must finish before the score/audiate slot`);
}

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
assert(Math.min(...tones.map(x=>x.freq))>=220,'tonal-center roots must stay in a phone-speaker-safe register (roughly A3 or above)');
assert(Math.max(...tones.filter(x=>x.chord==='G7').map(x=>x.freq))>=390,'G7 orientation must not fall back to the old near-inaudible G2 register');
console.log('OK: Stage 3 Teacher Call is scheduled and groove harmony stays audible on phone speakers');

import {EXERCISES} from './src/exercises.js';
import {yin,midiToFreq} from './src/pitchDetector.js';
import {scoreAttempt} from './src/scoring.js';
import {scoreEvent} from './src/scoring/eventScoring.js';
import {createTransport} from './src/session/transport.js';
import {createTimeline} from './src/session/timeline.js';
import {PHRASE_FAMILIES} from './src/curriculum/phraseFamilies.js';
import {VARIANTS,variantById} from './src/curriculum/variants.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
assert(EXERCISES.length>=24,'need >=24 exercises');
for(const e of EXERCISES){
  const end=Math.max(...e.notes.map(n=>n.startBeat+n.duration));
  assert(end<=e.totalBeats+1e-9,`${e.id} exceeds totalBeats`);
  let cursor=0;
  for(const n of e.notes){assert(Math.abs(n.startBeat-cursor)<1e-8,`${e.id} has unsupported gap at ${cursor}->${n.startBeat}`);cursor=n.startBeat+n.duration;}
  assert(Math.abs(cursor-e.totalBeats)<1e-8,`${e.id} duration sum ${cursor} != ${e.totalBeats}`);
  for(const n of e.notes)assert([0.5,1,2,4].includes(n.duration),`${e.id} unsupported duration ${n.duration}`);
}
const sr=44100, hz=440, size=2048; const b=new Float32Array(size);for(let i=0;i<size;i++)b[i]=.3*Math.sin(2*Math.PI*hz*i/sr);
const d=yin(b,sr);assert(d.hz && Math.abs(d.hz-hz)<2,`YIN failed ${d.hz}`);
const e=EXERCISES.find(x=>x.id==='s01'); const spb=60/e.bpm; const samples=[];
for(const n of e.notes){if(n.rest)continue;for(let t=n.startBeat*spb;t<(n.startBeat+n.duration)*spb;t+=.05)samples.push({t:t+.02,hz:midiToFreq(n.midi),clarity:.95,rms:.1});}
const sc=scoreAttempt(e,samples,0);assert(sc.pitch>95,`pitch score ${sc.pitch}`);assert(sc.time>90,`time ${sc.time}`);assert(sc.flow>90,`flow ${sc.flow}`);

const fakeCtx={currentTime:10};
const transport=createTransport({audioContext:fakeCtx,bpm:60,beatsPerBar:4});
transport.startAt(14);
assert(transport.currentBeat()===-4,'transport count-in origin');
assert(transport.timeAtBeat(0)===14,'transport beat zero');
fakeCtx.currentTime=314;
assert(Math.abs(transport.currentBeat()-300)<1e-9,'transport drift over five minutes');
assert(transport.position().bar===76,'transport bar calculation');
transport.pause();fakeCtx.currentTime=320;assert(Math.abs(transport.currentBeat()-300)<1e-9,'transport pause');
assert(transport.resumeAtBoundary()===300,'transport resume boundary');

const timeline=createTimeline({totalBeats:32,events:[
  {eventId:'e1',startBeat:0,prepareBeat:4,singStartBeat:8,singEndBeat:12,endBeat:16},
  {eventId:'e2',startBeat:16,prepareBeat:20,singStartBeat:24,singEndBeat:28,endBeat:32},
]});
assert(timeline.phaseAtBeat(2).phase==='SPACE','timeline space');
assert(timeline.phaseAtBeat(6).phase==='AUDIATE','timeline audiate');
assert(timeline.phaseAtBeat(9).phase==='SING','timeline sing');
assert(timeline.phaseAtBeat(13).phase==='FEEDBACK','timeline feedback');

const p01=EXERCISES.find(x=>x.id==='p01');
const scoringCtx={currentTime:96};
const scoringTransport=createTransport({audioContext:scoringCtx,bpm:60,beatsPerBar:4});
scoringTransport.startAt(100);
const event={eventId:'score-1',singStartBeat:8,singEndBeat:12};
const absoluteSamples=[];
for(const n of p01.notes){if(n.rest)continue;for(let t=n.startBeat;t<n.startBeat+n.duration;t+=.05)absoluteSamples.push({t:scoringTransport.timeAtBeat(8+t)+.02,hz:midiToFreq(n.midi),clarity:.95,rms:.1});}
const eventScore=scoreEvent({event,scoreModel:p01,samples:absoluteSamples,transport:scoringTransport,latencyMs:0});
assert(eventScore.pitch>95,`event pitch ${eventScore.pitch}`);assert(eventScore.time>90,`event time ${eventScore.time}`);assert(eventScore.flow>90,`event flow ${eventScore.flow}`);

assert(validateCurriculum(),'curriculum validation');
assert(PHRASE_FAMILIES.length===5,`family count ${PHRASE_FAMILIES.length}`);
for(const v of VARIANTS){if(v.parentVariant)assert(variantById(v.parentVariant)?.familyId===v.familyId,`${v.variantId} parent family`);}
for(const stage of [0,1,2,3]){
  const plan=buildDailySessionPlan({currentStage:stage,eventCount:20});
  assert(plan.events.length===20,`stage ${stage} event count`);
  assert(plan.focusFamilyIds.length>=1&&plan.focusFamilyIds.length<=2,`stage ${stage} family count`);
  assert(plan.totalBeats===320,`stage ${stage} total beats`);
  for(const x of plan.events){assert(x.startBeat%16===0,`${x.eventId} slot`);assert(x.singStartBeat===x.startBeat+8,`${x.eventId} sing start`);assert(x.singEndBeat===x.startBeat+12,`${x.eventId} sing end`);assert(x.scoreModel.totalBeats===4,`${x.eventId} score size`);}
}
const curriculumPlan=buildDailySessionPlan({currentStage:3,eventCount:20});
for(let i=0;i<curriculumPlan.events.length-1;i++){
  const a=curriculumPlan.events[i],n=curriculumPlan.events[i+1];
  if(a.presentationMode==='BUILD'&&n.presentationMode==='COLD_READ')assert(a.variantId!==n.variantId,'same variant cold-read immediately after build');
}

console.log(`OK: ${EXERCISES.length} exercises; YIN ${d.hz.toFixed(2)}Hz; scoring ${sc.pitch}/${sc.time}/${sc.flow}; transport/timeline/event windows + ${PHRASE_FAMILIES.length} curriculum families OK`);

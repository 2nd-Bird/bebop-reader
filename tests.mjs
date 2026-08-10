import {EXERCISES} from './src/exercises.js';
import {yin,midiToFreq} from './src/pitchDetector.js';
import {scoreAttempt} from './src/scoring.js';

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
console.log(`OK: ${EXERCISES.length} exercises; YIN ${d.hz.toFixed(2)}Hz; perfect synthetic score`,sc.pitch,sc.time,sc.flow);

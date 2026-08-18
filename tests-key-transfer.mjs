import fs from 'node:fs';
import {midiToFreq} from './src/pitchDetector.js';
import {displayAccidental} from './src/notation.js';
import {scoreEvent} from './src/scoring/eventScoring.js';
import {grooveEvents,sessionHarmonyPulses} from './src/audio/groove.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {keyTransferSupported,pitchNameFromMidi,transposeNotesFromC,transposeChordFromC,transposeHarmonyTimelineFromC} from './src/curriculum/keyTransfer.js';
import {variantById} from './src/curriculum/variantRegistry.js';
import {createTimeline} from './src/session/timeline.js';
import {createTransport} from './src/session/transport.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitchList=notes=>notes.filter(n=>!n.rest).map(n=>n.pitch).join(',');

assert(keyTransferSupported('C',14),'C remains active through the full curriculum');
for(const key of ['F','Bb'])assert(keyTransferSupported(key,0)&&keyTransferSupported(key,3)&&keyTransferSupported(key,14),`${key} debug transfer runtime is available through Stage 14 while UI remains debug-only`);

const source=[{pitch:'C4',midi:60,startBeat:0,duration:1,rest:false},{pitch:'E4',midi:64,startBeat:1,duration:1,rest:false},{pitch:'G4',midi:67,startBeat:2,duration:1,rest:false},{pitch:'B3',midi:59,startBeat:3,duration:1,rest:false},{pitch:'F4',midi:65,startBeat:4,duration:1,rest:false}];
const movedF=transposeNotesFromC(source,'F');
assert(pitchList(movedF)==='F4,A4,C5,E4,Bb4','C-source degrees move to corresponding F-major staff positions with flat spelling');
const movedBb=transposeNotesFromC(source,'Bb');
assert(pitchList(movedBb)==='Bb3,D4,F4,A3,Eb4','C-source degrees move down a whole step into practical B-flat staff positions');
assert(movedBb.map(n=>n.midi).join(',')==='58,62,65,57,63','B-flat transfer uses -2 semitones rather than raising the vocal range by +10');
assert(source.map(n=>n.pitch).join(',')==='C4,E4,G4,B3,F4','key transfer never mutates source curriculum notes');
assert(pitchNameFromMidi(70,'F')==='Bb4'&&pitchNameFromMidi(58,'Bb')==='Bb3','flat keys use flat pitch spelling');

assert(transposeChordFromC('C','F')==='F'&&transposeChordFromC('G7','F')==='C7'&&transposeChordFromC('Dm7','F')==='Gm7','F harmony transposes with scale function intact');
assert(transposeChordFromC('Cmaj7/E','F')==='Fmaj7/A','F slash-bass harmony transposes completely');
assert(transposeChordFromC('C','Bb')==='Bb'&&transposeChordFromC('G7','Bb')==='F7'&&transposeChordFromC('Dm7','Bb')==='Cm7','B-flat harmony transposes with scale function intact');
assert(transposeChordFromC('Cmaj7/E','Bb')==='Bbmaj7/D','B-flat slash-bass harmony transposes completely');
assert(transposeHarmonyTimelineFromC([{beat:0,chord:'C'},{beat:2,chord:'G7'}],'F').map(x=>x.chord).join(',')==='F,C7','F harmony timeline preserves event timing');
assert(transposeHarmonyTimelineFromC([{beat:0,chord:'C'},{beat:2,chord:'G7'}],'Bb').map(x=>x.chord).join(',')==='Bb,F7','B-flat harmony timeline preserves event timing');

assert(displayAccidental('Bb4','F')===''&&displayAccidental('B4','F')==='♮','F key signature owns B-flat and explicitly naturalizes B-natural');
assert(displayAccidental('Bb4','Bb')===''&&displayAccidental('Eb4','Bb')==='','B-flat key signature owns both B-flat and E-flat');
assert(displayAccidental('B4','Bb')==='♮'&&displayAccidental('E4','Bb')==='♮','B-flat notation explicitly naturalizes B/E natural when needed');
assert(displayAccidental('F#4','F')==='♯'&&displayAccidental('Bb4','C')==='♭','chromatic accidentals and C-key flats remain explicit');

function verifyStage3Pilot(key,{expectedMi,expectedDo,expectedHarmony,expectedRootHz}){
  const sourceVariant=variantById('desc-mi-seed'),sourcePitches=pitchList(sourceVariant.notes);
  const plan=buildDailySessionPlan({currentStage:3,key,bpm:60,eventCount:8,targetSessionBeats:128});
  assert(plan.key===key&&plan.sourceKey==='C',`${key} session is a separate key-axis realization of C-source curriculum material`);
  assert(plan.focusFamilyIds.join(',')==='descend-to-mi,descend-to-do',`${key} pilot reuses exact Stage 3 Phrase Families`);
  assert(plan.events.length===8&&plan.totalBeats===128,`${key} pilot preserves Stage 3 session structure`);
  createTimeline(plan).validate();
  const teacher=plan.events.find(e=>e.familyId==='descend-to-mi'&&e.presentationMode==='TEACHER_CALL');
  assert(teacher,`${key} Stage 3 retains Teacher Call for the same family introduction`);
  assert(teacher.variantId==='desc-mi-seed'&&teacher.scoreModel.sourceVariantId==='desc-mi-seed',`${key} transfer preserves Variant identity`);
  assert(teacher.sourceKey==='C'&&teacher.key===key&&teacher.scoreModel.sourceKey==='C'&&teacher.scoreModel.key===key,`${key} explicitly separates source and reading/sounding key`);
  assert(teacher.sourceHarmonyFieldId==='static-c'&&teacher.harmonyFieldId===`static-c@key:${key}`,`${key} event keeps source harmony identity separate`);
  assert(teacher.sourceHarmonyContext==='C'&&teacher.harmonyContext===expectedHarmony&&teacher.harmonyTimeline[0].chord===expectedHarmony,`${key} separates C-source harmony from sounding key context`);
  assert(pitchList(teacher.scoreModel.notes)===expectedMi,`${key} realizes known G→E relation at transferred staff positions`);
  assert(pitchList(sourceVariant.notes)===sourcePitches&&sourcePitches==='G4,E4',`${key} materialization leaves source registry untouched`);
  const second=plan.events.find(e=>e.familyId==='descend-to-do'&&e.presentationMode==='TEACHER_CALL');
  assert(second&&pitchList(second.scoreModel.notes)===expectedDo,`${key} realizes known E→C relation without a new Phrase Family`);
  const harmonyPulses=sessionHarmonyPulses(plan);assert(harmonyPulses[0].chord===expectedHarmony,`${key} groove receives transferred tonal center`);
  const groove=grooveEvents({fromBeat:0,toBeat:4,key,beatsPerBar:4,harmonyPulses}),rootTone=groove.find(e=>e.kind==='tone'&&e.beat===0);
  assert(rootTone?.chord===expectedHarmony&&Math.abs(rootTone.freq-expectedRootHz)<1,`${key} groove sounds transferred root in the phone-safe register`);
  const fakeCtx={currentTime:0},transport=createTransport({audioContext:fakeCtx,bpm:60,beatsPerBar:4});transport.startAt(10);
  const samples=[];for(const note of teacher.scoreModel.notes){if(note.rest)continue;for(let t=note.startBeat;t<note.startBeat+note.duration;t+=.05)samples.push({t:transport.timeAtBeat(teacher.singStartBeat+t)+.02,hz:midiToFreq(note.midi),clarity:.95,rms:.1});}
  const scored=scoreEvent({event:teacher,scoreModel:teacher.scoreModel,samples,transport,latencyMs:0});
  assert(scored.pitch>95&&scored.time>90&&scored.flow>90,`${key} event scoring evaluates transferred targets rather than C-source pitches`);
}

verifyStage3Pilot('F',{expectedMi:'C5,A4',expectedDo:'A4,F4',expectedHarmony:'F',expectedRootHz:349.23});
verifyStage3Pilot('Bb',{expectedMi:'F4,D4',expectedDo:'D4,Bb3',expectedHarmony:'Bb',expectedRootHz:233.08});

const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
const notation=fs.readFileSync(new URL('./src/notation.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(player.includes("params.get('key')")&&player.includes("['C','F','Bb']"),'only debug harness can request F or B-flat pilots');
assert(player.includes("persistSession=!(debug&&plan.key!=='C')"),'all debug non-C sessions remain non-persistent even when technical coverage reaches later Stages');
assert(view.includes("labelForKey=key=>key==='Bb'?'B♭':key")&&view.includes('phaseCopyFor(labelForKey(activeKey))'),'session orientation UI renders B-flat and follows the active Learning Event key');
assert(notation.includes("stave.addKeySignature(ex.key)"),'ordinary staff renders F/B-flat key signatures');
assert(sw.includes("'./src/curriculum/keyTransfer.js'"),'PWA core cache includes key-transfer runtime');

console.log('OK: F and B-flat transfer primitives preserve Phrase Family identity while staff/key signature, harmony, groove, model/scoring targets and UI move together; non-C remains debug-only/non-persistent');

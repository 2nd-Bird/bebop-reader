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
const throws=(fn,m)=>{let ok=false;try{fn();}catch{ok=true;}assert(ok,m);};
const pitchList=notes=>notes.filter(n=>!n.rest).map(n=>n.pitch).join(',');

assert(keyTransferSupported('C',14),'C remains active through the full curriculum');
assert(keyTransferSupported('F',0)&&keyTransferSupported('F',3),'F pilot is available for early familiar material');
assert(!keyTransferSupported('F',4),'F is not silently promoted to the later curriculum before its unlock contract exists');
assert(!keyTransferSupported('Bb',3),'B-flat remains planned rather than implicitly unlocked');

const source=[{pitch:'C4',midi:60,startBeat:0,duration:1,rest:false},{pitch:'E4',midi:64,startBeat:1,duration:1,rest:false},{pitch:'G4',midi:67,startBeat:2,duration:1,rest:false},{pitch:'B3',midi:59,startBeat:3,duration:1,rest:false},{pitch:'F4',midi:65,startBeat:4,duration:1,rest:false}];
const moved=transposeNotesFromC(source,'F');
assert(pitchList(moved)==='F4,A4,C5,E4,Bb4','C-major source degrees move to the corresponding F-major staff positions with flat spelling');
assert(source.map(n=>n.pitch).join(',')==='C4,E4,G4,B3,F4','key transfer does not mutate the source Variant material');
assert(pitchNameFromMidi(70,'F')==='Bb4','F-key spelling uses B-flat rather than A-sharp');
assert(transposeChordFromC('C','F')==='F','tonic harmony moves C→F');
assert(transposeChordFromC('G7','F')==='C7','dominant harmony moves G7→C7');
assert(transposeChordFromC('Dm7','F')==='Gm7','ii harmony moves Dm7→Gm7');
assert(transposeChordFromC('Cmaj7/E','F')==='Fmaj7/A','slash-bass harmony transposes with the chord');
assert(transposeHarmonyTimelineFromC([{beat:0,chord:'C'},{beat:2,chord:'G7'}],'F').map(x=>x.chord).join(',')==='F,C7','harmony timeline transposes without changing event timing');

assert(displayAccidental('Bb4','F')==='','B-flat implied by the F key signature does not receive a redundant accidental');
assert(displayAccidental('B4','F')==='♮','B-natural in F would receive an explicit natural');
assert(displayAccidental('F#4','F')==='♯','chromatic sharp remains explicit in F');
assert(displayAccidental('Bb4','C')==='♭','C notation still draws B-flat as an accidental');

const sourceVariant=variantById('desc-mi-seed');
const sourcePitches=pitchList(sourceVariant.notes);
const plan=buildDailySessionPlan({currentStage:3,key:'F',bpm:60,eventCount:8,targetSessionBeats:128});
assert(plan.key==='F'&&plan.sourceKey==='C','F session is a separate key-axis realization of C-source curriculum material');
assert(plan.focusFamilyIds.join(',')==='descend-to-mi,descend-to-do','F pilot reuses the exact Stage 3 Phrase Families rather than creating F-specific families');
assert(plan.events.length===8&&plan.totalBeats===128,'F pilot preserves the ordinary Stage 3 session structure');
createTimeline(plan).validate();

const teacher=plan.events.find(e=>e.familyId==='descend-to-mi'&&e.presentationMode==='TEACHER_CALL');
assert(teacher,'F Stage 3 still introduces the known family through the same presentation policy');
assert(teacher.variantId==='desc-mi-seed'&&teacher.scoreModel.sourceVariantId==='desc-mi-seed','Variant identity is unchanged by key transfer');
assert(teacher.sourceKey==='C'&&teacher.key==='F'&&teacher.scoreModel.sourceKey==='C'&&teacher.scoreModel.key==='F','source key and sounding/reading key remain explicitly separated');
assert(teacher.sourceHarmonyFieldId==='static-c'&&teacher.harmonyFieldId==='static-c@key:F','source harmony identity is preserved while the F realization owns a distinct event context');
assert(teacher.harmonyContext==='F'&&teacher.harmonyTimeline[0].chord==='F','learner-facing harmony is the sounding F context');
assert(pitchList(teacher.scoreModel.notes)==='C5,A4','known G→E scale-degree relation appears as C→A in F');
assert(teacher.scoreModel.notes.map(n=>n.midi).join(',')==='72,69','scoring targets are transposed by the same five semitones as notation');
assert(pitchList(sourceVariant.notes)===sourcePitches&&sourcePitches==='G4,E4','source registry remains untouched after materialization');

const second=plan.events.find(e=>e.familyId==='descend-to-do'&&e.presentationMode==='TEACHER_CALL');
assert(second&&pitchList(second.scoreModel.notes)==='A4,F4','known E→C relation becomes A→F without teaching a new family');

const harmonyPulses=sessionHarmonyPulses(plan);
assert(harmonyPulses[0].chord==='F','groove receives the transposed tonal center rather than the source C label');
const groove=grooveEvents({fromBeat:0,toBeat:4,key:'F',beatsPerBar:4,harmonyPulses});
const rootTone=groove.find(e=>e.kind==='tone'&&e.beat===0);
assert(rootTone?.chord==='F'&&Math.abs(rootTone.freq-349.23)<1,'F pilot groove sounds an audible F4 tonal root on the phone-safe register');

const fakeCtx={currentTime:0},transport=createTransport({audioContext:fakeCtx,bpm:60,beatsPerBar:4});transport.startAt(10);
const samples=[];
for(const note of teacher.scoreModel.notes){
  if(note.rest)continue;
  for(let t=note.startBeat;t<note.startBeat+note.duration;t+=.05)samples.push({t:transport.timeAtBeat(teacher.singStartBeat+t)+.02,hz:midiToFreq(note.midi),clarity:.95,rms:.1});
}
const scored=scoreEvent({event:teacher,scoreModel:teacher.scoreModel,samples,transport,latencyMs:0});
assert(scored.pitch>95&&scored.time>90&&scored.flow>90,'event scoring evaluates the transposed F targets rather than the C-source pitches');

throws(()=>buildDailySessionPlan({currentStage:4,key:'F',eventCount:8,targetSessionBeats:128}),'F pilot must not cross into Stage 4 before a canonical unlock gate is defined');
throws(()=>buildDailySessionPlan({currentStage:3,key:'Bb',eventCount:8,targetSessionBeats:128}),'B-flat must remain unavailable until its key-transfer step is deliberately implemented');

const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
const notation=fs.readFileSync(new URL('./src/notation.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(player.includes("params.get('key')")&&player.includes("['C','F']"),'only the debug harness can request the F pilot');
assert(player.includes("persistSession=!(debug&&plan.key!=='C')"),'debug F sessions cannot pollute production C mastery or key progress');
assert(view.includes('phaseCopyFor(keyLabel)')&&view.includes('${keyLabel}</b>'),'session orientation UI follows the active key rather than hard-coding C');
assert(notation.includes("stave.addKeySignature(ex.key)"),'ordinary staff notation renders the F key signature');
assert(sw.includes("'./src/curriculum/keyTransfer.js'"),'PWA core cache includes the key-transfer runtime module');

console.log('OK: debug-only F transfer keeps Phrase Family identity while notation, key signature, harmony, groove, model/scoring targets and UI move together; no F mastery is persisted and no unlock threshold is invented');

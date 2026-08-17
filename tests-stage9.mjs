import {STAGES} from './src/curriculum/stages.js';
import {familyById} from './src/curriculum/phraseFamilies.js';
import {variantById} from './src/curriculum/variants.js';
import {defaultHarmonyFieldFor} from './src/curriculum/harmonyFields.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {sessionHarmonyPulses} from './src/audio/groove.js';
import {createTimeline} from './src/session/timeline.js';
import {createTransport} from './src/session/transport.js';
import {findEchoSlot,scheduleDelayedRetry} from './src/curriculum/recovery.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitches=id=>variantById(id).notes.filter(n=>!n.rest).map(n=>n.pitch);
const endBeat=id=>Math.max(...variantById(id).notes.map(n=>n.startBeat+n.duration));

const stage9=STAGES.find(s=>s.stage===9),family=familyById('long-line-through-changes');
assert(stage9?.id==='chord-change-long-line','Stage 9 exists');
assert(stage9.field==='phrase-8','Stage 9 unlocks Phrase 8 musical field');
assert(stage9.unlock.phraseBeats.join(',')==='8,16','Stage 9 grows two- to four-bar sung lines');
assert(stage9.unlock.fieldProgression.join(',')==='training-4,phrase-8','musical field grows rather than only score length');
assert(family?.invariant==='continuous descending stepwise line across changing harmony','Stage 9 invariant is explicit');
assert(family.source.hamaseRef==='ex.071'&&family.source.sourcePage===50,'Stage 9 primary source is prepared ex.071 page 50');
assert(family.source.hamaseRefs.join(',')==='ex.071,ex.085'&&family.source.sourcePages.join(',')==='50,58','Stage 9 keeps long-line and generator traceability');
assert(family.source.sourceKind==='historical-linear-line-model','Lester Young source is not mislabeled as Parker transcription');
assert(family.source.adaptation,'Stage 9 declares C-major pedagogical adaptation');

const seed=variantById('long-line-2bar'),grow=variantById('long-line-4bar');
assert(pitches('long-line-2bar').join(',')==='C5,B4,A4,G4','two-bar seed reuses first half of known descent');
assert(endBeat('long-line-2bar')===8,'seed is two bars');
assert(pitches('long-line-4bar').join(',')==='C5,B4,A4,G4,F4,E4,D4,C4','four-bar line remains one stepwise descent');
assert(endBeat('long-line-4bar')===16,'grow is four bars');
assert(grow.parentVariant==='long-line-2bar'&&grow.morphType==='EXTEND','four-bar line grows from two-bar seed');
assert(grow.morphTargets.join(',')==='4,5,6,7','only extended half is highlighted by Morph');

const seedField=defaultHarmonyFieldFor(seed.allowedHarmony,{scoreBeats:8}),growField=defaultHarmonyFieldFor(grow.allowedHarmony,{scoreBeats:16});
assert(seedField?.harmonyFieldId==='c-long-line-2bar','two-bar variant gets bar-aligned long-line harmony');
assert(seedField.timeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:Cmaj7,4:Am7','seed harmony changes on bar boundary');
assert(growField?.harmonyFieldId==='c-long-line-4bar','four-bar variant gets four-bar harmony');
assert(growField.timeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:Cmaj7,4:Am7,8:FMaj7,12:Dm7','grow harmony changes once per bar');
assert(defaultHarmonyFieldFor(grow.allowedHarmony)?.harmonyFieldId==='c-sixth-chain-4cell','legacy no-span lookup still resolves prior Stage 6 field');

const plan=buildDailySessionPlan({currentStage:9,eventCount:20,targetSessionBeats:320});
assert(plan.focusFamilyIds[0]==='long-line-through-changes','Stage 9 prioritizes long-line family');
assert(plan.form==='phrase-8','Stage 9 session enters Phrase 8 world');
assert(plan.totalBeats===320,'variable fields retain roughly five-minute 60-BPM session target');
assert(plan.events.length<20&&plan.events.length>=8,'longer Phrase 8 events reduce problem count instead of lengthening session');
createTimeline(plan).validate();
const seedEvent=plan.events.find(e=>e.variantId==='long-line-2bar'&&e.presentationMode==='TEACHER_CALL');
const growEvent=plan.events.find(e=>e.variantId==='long-line-4bar'&&e.presentationMode==='BUILD');
assert(seedEvent?.fieldBeats===16&&seedEvent.form==='training-4','two-bar call/response still fits Training 4');
assert(seedEvent.modelEndBeat-seedEvent.modelStartBeat===8&&seedEvent.singEndBeat-seedEvent.singStartBeat===8,'two-bar Teacher Call and response match');
assert(growEvent?.fieldBeats===32&&growEvent.form==='phrase-8','four-bar BUILD expands Learning Event to eight-bar field');
assert(growEvent.singEndBeat-growEvent.singStartBeat===16,'four-bar SING window is continuous');
assert(growEvent.singStartBeat===growEvent.startBeat+8&&growEvent.singEndBeat===growEvent.startBeat+24,'Phrase 8 keeps pre-read and response space around four-bar singing');
assert(growEvent.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:Cmaj7,4:Am7,8:FMaj7,12:Dm7','Learning Event owns bar-aligned harmony timeline');

const pulses=sessionHarmonyPulses(plan),singPulses=pulses.filter(x=>x.beat>=growEvent.singStartBeat&&x.beat<growEvent.singEndBeat);
for(const [offset,chord] of [[0,'Cmaj7'],[4,'Am7'],[8,'FMaj7'],[12,'Dm7']])assert(singPulses.some(x=>x.beat===growEvent.singStartBeat+offset&&x.chord===chord),`groove aligns ${chord} with singing beat +${offset}`);
assert(!pulses.some(x=>x.beat===growEvent.startBeat+4&&x.chord==='Am7'),'non-model preparation does not run the long-line harmony early');

const missed=plan.events.find(e=>e.variantId==='long-line-4bar'),echo=findEchoSlot(plan.events,missed,new Set());
assert(echo&&echo.fieldBeats===32,'a four-bar miss reserves a future field large enough for Answer Echo');
assert((echo.endBeat-echo.startBeat)>=(missed.scoreModel.totalBeats+echo.scoreModel.totalBeats),'echo and target phrase both fit reserved field');
echo.echoOfEventId=missed.eventId;const retry=scheduleDelayedRetry(plan.events,missed,{minGapEvents:2});
assert(retry&&retry.variantId==='long-line-4bar','long-line delayed retry finds a later compatible long field');
assert(retry.eventId!==echo.eventId,'delayed retry does not overwrite the Answer Echo slot');
assert(retry.harmonyFieldId===missed.harmonyFieldId&&retry.harmonyTimeline.map(x=>x.chord).join(',')===missed.harmonyTimeline.map(x=>x.chord).join(','),'retry preserves source harmonic context');

const fakeCtx={currentTime:0},transport=createTransport({audioContext:fakeCtx,bpm:60,beatsPerBar:4});transport.startAt(0);fakeCtx.currentTime=50;transport.pause();const nextBoundary=plan.events.find(e=>e.startBeat>=transport.currentBeat()-.02)?.startBeat;assert(nextBoundary===64,'mixed 16/32-beat timeline exposes actual next Event boundary');assert(transport.resumeAtBeat(nextBoundary,{leadSec:0})===64,'Transport resumes at explicit Learning Event boundary');assert(Math.abs(transport.currentBeat()-64)<1e-9,'resume does not land halfway through Phrase 8 event');

assert(plan.events.every(e=>!('theoryPrompt' in e)&&!('chordAnalysisQuestion' in e)),'Stage 9 keeps chord-change analysis internal');
console.log('OK: Stage 9 keeps one long line across bar-aligned harmony and expands Learning Events to Phrase 8 without extending session duration');

import {EXERCISES} from './src/exercises.js';
import {yin,midiToFreq} from './src/pitchDetector.js';
import {scoreAttempt} from './src/scoring.js';
import {scoreEvent} from './src/scoring/eventScoring.js';
import {modelSchedule} from './src/audio/model.js';
import {morphDescriptor} from './src/notation/morph.js';
import {createTransport} from './src/session/transport.js';
import {createTimeline} from './src/session/timeline.js';
import {STAGES} from './src/curriculum/stages.js';
import {PHRASE_FAMILIES,familyById} from './src/curriculum/phraseFamilies.js';
import {VARIANTS,variantById} from './src/curriculum/variants.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {findEchoSlot,scheduleDelayedRetry} from './src/curriculum/recovery.js';
import {emptyFamilyMastery,applyEventResult,isFamilyMastered,deriveStageProgress,schedulerSignals} from './src/curriculum/mastery.js';
import {migrateV2State} from './src/storage-v3.js';

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
const sr=44100,hz=440,size=2048;const b=new Float32Array(size);for(let i=0;i<size;i++)b[i]=.3*Math.sin(2*Math.PI*hz*i/sr);
const d=yin(b,sr);assert(d.hz&&Math.abs(d.hz-hz)<2,`YIN failed ${d.hz}`);
const e=EXERCISES.find(x=>x.id==='s01');const spb=60/e.bpm;const samples=[];
for(const n of e.notes){if(n.rest)continue;for(let t=n.startBeat*spb;t<(n.startBeat+n.duration)*spb;t+=.05)samples.push({t:t+.02,hz:midiToFreq(n.midi),clarity:.95,rms:.1});}
const sc=scoreAttempt(e,samples,0);assert(sc.pitch>95,`pitch score ${sc.pitch}`);assert(sc.time>90,`time ${sc.time}`);assert(sc.flow>90,`flow ${sc.flow}`);

const fakeCtx={currentTime:10};const transport=createTransport({audioContext:fakeCtx,bpm:60,beatsPerBar:4});transport.startAt(14);
assert(transport.currentBeat()===-4,'transport count-in origin');assert(transport.timeAtBeat(0)===14,'transport beat zero');fakeCtx.currentTime=314;assert(Math.abs(transport.currentBeat()-300)<1e-9,'transport drift over five minutes');assert(transport.position().bar===76,'transport bar calculation');transport.pause();fakeCtx.currentTime=320;assert(Math.abs(transport.currentBeat()-300)<1e-9,'transport pause');assert(transport.resumeAtBoundary()===300,'transport resume boundary');

const timeline=createTimeline({totalBeats:32,events:[{eventId:'e1',startBeat:0,prepareBeat:4,modelStartBeat:0,modelEndBeat:4,singStartBeat:8,singEndBeat:12,endBeat:16},{eventId:'e2',startBeat:16,prepareBeat:20,singStartBeat:24,singEndBeat:28,endBeat:32}]});
assert(timeline.phaseAtBeat(2).phase==='MODEL','timeline model');assert(timeline.phaseAtBeat(6).phase==='AUDIATE','timeline audiate');assert(timeline.phaseAtBeat(9).phase==='SING','timeline sing');assert(timeline.phaseAtBeat(13).phase==='FEEDBACK','timeline feedback');

const p01=EXERCISES.find(x=>x.id==='p01');const scoringCtx={currentTime:96};const scoringTransport=createTransport({audioContext:scoringCtx,bpm:60,beatsPerBar:4});scoringTransport.startAt(100);const event={eventId:'score-1',singStartBeat:8,singEndBeat:12};const absoluteSamples=[];
for(const n of p01.notes){if(n.rest)continue;for(let t=n.startBeat;t<n.startBeat+n.duration;t+=.05)absoluteSamples.push({t:scoringTransport.timeAtBeat(8+t)+.02,hz:midiToFreq(n.midi),clarity:.95,rms:.1});}
const eventScore=scoreEvent({event,scoreModel:p01,samples:absoluteSamples,transport:scoringTransport,latencyMs:0});assert(eventScore.pitch>95,`event pitch ${eventScore.pitch}`);assert(eventScore.time>90,`event time ${eventScore.time}`);assert(eventScore.flow>90,`event flow ${eventScore.flow}`);

assert(validateCurriculum(),'curriculum validation');assert(STAGES.length===6,`stage count ${STAGES.length}`);assert(PHRASE_FAMILIES.length===7,`family count ${PHRASE_FAMILIES.length}`);
for(const v of VARIANTS){if(v.parentVariant)assert(variantById(v.parentVariant)?.familyId===v.familyId,`${v.variantId} parent family`);}
for(const stage of STAGES.map(s=>s.stage)){
  const plan=buildDailySessionPlan({currentStage:stage,eventCount:20});
  assert(plan.events.length===20,`stage ${stage} event count`);assert(plan.focusFamilyIds.length>=1&&plan.focusFamilyIds.length<=2,`stage ${stage} family count`);assert(plan.totalBeats===320,`stage ${stage} total beats`);assert(plan.events[0].presentationMode==='TEACHER_CALL',`stage ${stage} teacher call`);assert(plan.events[0].modelStartBeat===plan.events[0].startBeat,`stage ${stage} model start`);assert(plan.events.some(x=>x.presentationMode==='BUILD'&&x.morph?.active),`stage ${stage} build morph`);
  for(const x of plan.events){assert(x.startBeat%16===0,`${x.eventId} slot`);assert(x.singStartBeat===x.startBeat+8,`${x.eventId} sing start`);assert(x.singEndBeat===x.startBeat+12,`${x.eventId} sing end`);assert(x.scoreModel.totalBeats===4,`${x.eventId} score size`);}
}
const curriculumPlan=buildDailySessionPlan({currentStage:3,eventCount:20});const teacher=curriculumPlan.events.find(x=>x.presentationMode==='TEACHER_CALL');assert(modelSchedule({scoreModel:teacher.scoreModel,startBeat:teacher.modelStartBeat}).every(x=>x.beat>=teacher.startBeat&&x.beat<teacher.prepareBeat),'teacher model stays in bar 1');
const build=curriculumPlan.events.find(x=>x.presentationMode==='BUILD'&&x.morph?.active),v=variantById(build.variantId),parent=variantById(v.parentVariant);const md=morphDescriptor({variant:v,parentVariant:parent});assert(md.active&&md.type===v.morphType&&md.indices.length>0,'morph descriptor');
const missed=curriculumPlan.events[0],echo=findEchoSlot(curriculumPlan.events,missed,new Set());assert(echo&&echo.startBeat>=missed.endBeat+16,'answer echo delayed beyond next event');const retry=scheduleDelayedRetry(curriculumPlan.events,missed,{minGapEvents:2});assert(retry&&retry.variantId===missed.variantId&&retry.presentationMode==='DELAYED_READ','delayed retry');assert(retry.startBeat>=missed.startBeat+48,'retry gap');

const stage4Family=familyById('chord-tones-in-time');assert(stage4Family?.source?.hamaseRef==='ex.001 + ex.005','stage 4 source refs');assert(stage4Family.source.scorePages.join(',')==='21,23','stage 4 prepared score pages');
const descPass=variantById('cti-desc-pass'),ascPass=variantById('cti-asc-pass');const descDownbeats=descPass.notes.filter(n=>Number.isInteger(n.startBeat)).map(n=>n.midi),ascDownbeats=ascPass.notes.filter(n=>Number.isInteger(n.startBeat)).map(n=>n.midi);assert(descDownbeats.join(',')==='70,67,64,60',`descending structural beats ${descDownbeats}`);assert(ascDownbeats.join(',')==='60,64,67,70',`ascending structural beats ${ascDownbeats}`);assert(descPass.notes.filter(n=>n.startBeat%1===.5).every(n=>n.duration===.5),'descending passing tones are offbeat eighths');assert(ascPass.notes.filter(n=>n.startBeat%1===.5).every(n=>n.duration===.5),'ascending passing tones are offbeat eighths');
const stage4Plan=buildDailySessionPlan({currentStage:4,eventCount:20});assert(stage4Plan.focusFamilyIds[0]==='chord-tones-in-time','stage 4 prioritizes sourced family');assert(stage4Plan.events[0].harmonyContext==='C7','stage 4 harmony context');assert(stage4Plan.events.some(x=>x.familyId==='chord-tones-in-time'&&x.variantId==='cti-desc-pass'&&x.presentationMode==='BUILD'),'stage 4 morphs chord tones into a passing-tone line');

const stage5Family=familyById('rehear-g-to-f');assert(stage5Family?.source?.hamaseRef==='ex.029','stage 5 source ref');assert(stage5Family.source.scorePage===32,'stage 5 prepared score page');const ornament=variantById('reh-gf-ornament'),sus=variantById('reh-gf-sus-root');assert(ornament.notes.map(n=>n.midi).join(',')===sus.notes.map(n=>n.midi).join(','),'stage 5 keeps melody fixed across reharmonization');const reh=morphDescriptor({variant:sus,parentVariant:ornament});assert(reh.active&&reh.type==='REHARMONIZE'&&reh.indices.length===0&&reh.harmonyBeats[0]===0,'stage 5 is a harmony-only morph');
const stage5Plan=buildDailySessionPlan({currentStage:5,eventCount:20});assert(stage5Plan.focusFamilyIds[0]==='rehear-g-to-f','stage 5 prioritizes rehearing family');const rehEvent=stage5Plan.events.find(x=>x.variantId==='reh-gf-sus-root');assert(rehEvent?.presentationMode==='BUILD'&&rehEvent.morph?.harmonyBeats?.[0]===0,'stage 5 BUILD highlights harmony instead of notes');assert(rehEvent.scoreModel.harmonyTimeline[0].chord==='G7sus4','stage 5 materializes new harmony');

const migrated=migrateV2State({streak:4,lastPracticeDate:'2026-08-16',settings:{latencyMs:123,solfege:true},mastery:{p01:5}});assert(migrated.streak===4&&migrated.settings.latencyMs===123&&migrated.settings.solfege===true,'v2 settings migration');assert(Object.keys(migrated.familyMastery).length===0,'legacy exercise mastery must not grant family mastery');let fm=emptyFamilyMastery();const coldEvent={familyId:'anchor-do-sol',presentationMode:'COLD_READ'};fm=applyEventResult(fm,coldEvent,{readScore:96,stars:5},1000);fm=applyEventResult(fm,coldEvent,{readScore:94,stars:5},2000);assert(isFamilyMastered(fm),'family mastery gate');assert(deriveStageProgress({'anchor-do-sol':fm},0,STAGES.length-1).currentStage===1,'stage 0 unlock');const adaptiveState={familyMastery:{'anchor-do-sol':fm},reviewQueue:[{familyId:'anchor-do-sol',dueAt:1}]};const signals=schedulerSignals(adaptiveState,3000),adaptivePlan=buildDailySessionPlan({currentStage:0,eventCount:8,...signals});assert(signals.dueFamilyIds.includes('anchor-do-sol'),'due family signal');assert(adaptivePlan.events[0].presentationMode==='COLD_READ','known due family must start cold');

console.log(`OK: ${EXERCISES.length} exercises; YIN ${d.hz.toFixed(2)}Hz; scoring ${sc.pitch}/${sc.time}/${sc.flow}; transport + curriculum Stage 0-${STAGES.length-1} + teaching + mastery/storage v3 OK`);

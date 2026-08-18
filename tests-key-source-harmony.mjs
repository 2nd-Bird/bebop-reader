import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {materializeScoreModel} from './src/curriculum/materialize.js';
import {variantById} from './src/curriculum/variantRegistry.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitches=score=>score.notes.filter(n=>!n.rest).map(n=>n.pitch).join(',');

// In C, source and sounding contexts coincide. Keep both fields explicit so later key
// transfer never has to infer source function from a transposed chord label.
const stage10=buildDailySessionPlan({currentStage:10,key:'C',eventCount:12,targetSessionBeats:192});
const rm=stage10.events.filter(e=>e.familyId==='relative-major-reinterpret');
assert(rm.length>=4,'Stage 10 Relative Major sequence exists');
assert(rm.every(e=>e.sourceKey==='C'&&e.sourceHarmonyContext===e.harmonyContext),'C events explicitly carry identical source and sounding harmony contexts');
assert(rm.some(e=>e.sourceHarmonyContext==='F')&&rm.some(e=>e.sourceHarmonyContext==='G7'),'Stage 10 source contexts retain familiar F and dominant G7 identities');
assert(rm.every(e=>e.scoreModel.sourceHarmonyContext===e.sourceHarmonyContext&&e.scoreModel.harmonyContext===e.harmonyContext),'materialized score preserves both harmony roles');

// Architecture regression: functional MOVE is evaluated in the C-source grammar first,
// then the resulting notes are transferred to the requested key. The pilots remain Stage 0-3
// in the Scheduler; stage:3 below only exercises this composition contract without unlocking Stage 10.
const variant=variantById('rm-f-triad');
function materializeMoved({key,sourceHarmonyContext,harmonyContext,expected}){
  const score=materializeScoreModel(variant,{
    key,sourceKey:'C',sourceHarmonyContext,harmonyContext,
    sourceHarmonyContext,
    harmonyTimeline:[{beat:0,chord:harmonyContext}],
    presentationMode:'COLD_READ',movePolicy:'RELATIVE_MAJOR_OF_DOMINANT',title:'source-harmony-contract'
  },{key,stage:3,bpm:60});
  assert(score.sourceHarmonyContext===sourceHarmonyContext&&score.harmonyContext===harmonyContext,`${key}: source and sounding harmony remain separate in the score model`);
  assert(pitches(score)===expected,`${key}: functional MOVE happens before key transfer`);
  return score;
}

// C-source E7 uses D–F#–A as the Relative Major shape. In F this becomes G–B–D over A7.
materializeMoved({key:'F',sourceHarmonyContext:'E7',harmonyContext:'A7',expected:'G4,B4,D5'});
// The same C-source E7 operator transferred down a whole step becomes C–E–G over D7 in B-flat.
materializeMoved({key:'Bb',sourceHarmonyContext:'E7',harmonyContext:'D7',expected:'C4,E4,G4'});
// Baseline source G7 keeps F–A–C before transfer: B-flat major over C7 in F, E-flat major over F7 in B-flat.
materializeMoved({key:'F',sourceHarmonyContext:'G7',harmonyContext:'C7',expected:'Bb4,D5,F5'});
materializeMoved({key:'Bb',sourceHarmonyContext:'G7',harmonyContext:'F7',expected:'Eb4,G4,Bb4'});

assert(variant.notes.filter(n=>!n.rest).map(n=>n.pitch).join(',')==='F4,A4,C5','functional/key transfer never mutates the source Variant');
console.log('OK: functional MOVE is anchored to explicit C-source harmony, then transferred once to sounding F/B-flat harmony, preventing double transposition');

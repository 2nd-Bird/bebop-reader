import {harmonyTimelineFor,materializeScoreModel} from './src/curriculum/materialize.js';
import {harmonyCueSchedule} from './src/audio/harmony.js';
import {morphDescriptor} from './src/notation/morph.js';
import {variantById} from './src/curriculum/variants.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const baseVariant={variantId:'harmony-test',allowedKeys:['C'],allowedPresentation:['COLD_READ'],notes:[{pitch:'G4',midi:67,startBeat:0,duration:4,rest:false}],meter:[4,4]};
const session={key:'C',bpm:60};
const staticEvent={key:'C',harmonyContext:'C7',presentationMode:'COLD_READ',title:'static'};
const staticScore=materializeScoreModel(baseVariant,staticEvent,session);
assert(staticScore.harmonyTimeline.length===1,'static harmony should normalize to one timeline entry');
assert(staticScore.harmonyTimeline[0].beat===0&&staticScore.harmonyTimeline[0].chord==='C7','static harmony normalization');

const movingVariant={...baseVariant,variantId:'moving-harmony-test',harmonyTimeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7sus4'}]};
const moving=harmonyTimelineFor(movingVariant,{harmonyContext:'C'},4);
assert(moving.length===2&&moving[1].beat===2&&moving[1].chord==='G7sus4','moving harmony timeline');
const movingScore=materializeScoreModel(movingVariant,staticEvent,session);
assert(movingScore.chords.join(',')==='Dm7,G7sus4','moving chord labels');
const cues=harmonyCueSchedule({scoreModel:movingScore,startBeat:16});
assert(cues.length===2&&cues[0].beat===16&&cues[1].beat===18,'harmony cues preserve score-relative beat changes');
let rejected=false;try{harmonyTimelineFor({...movingVariant,harmonyTimeline:[{beat:1,chord:'G7'}]},staticEvent,4)}catch{rejected=true}
assert(rejected,'harmony timeline must begin at beat 0');

const ornament=variantById('reh-gf-ornament'),sus=variantById('reh-gf-sus-root'),pivot=variantById('reh-gf-pivot');
assert(ornament.notes.map(n=>n.midi).join(',')===sus.notes.map(n=>n.midi).join(','),'reharmonization keeps G-F melody fixed');
const reh=morphDescriptor({variant:sus,parentVariant:ornament});
assert(reh.active&&reh.type==='REHARMONIZE'&&reh.indices.length===0&&reh.harmonyBeats[0]===0,'harmony-only morph is active without note changes');
assert(pivot.harmonyTimeline[0].chord==='FMaj7'&&pivot.harmonyTimeline[1].beat===1&&pivot.harmonyTimeline[1].chord==='G7sus4','pivot changes harmony while G is held');
console.log('OK: beat-aligned harmony + cues + harmony-only Phrase Morph');

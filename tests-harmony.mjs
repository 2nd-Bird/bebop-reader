import {harmonyTimelineFor,materializeScoreModel} from './src/curriculum/materialize.js';

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
let rejected=false;try{harmonyTimelineFor({...movingVariant,harmonyTimeline:[{beat:1,chord:'G7'}]},staticEvent,4)}catch{rejected=true}
assert(rejected,'harmony timeline must begin at beat 0');
console.log('OK: beat-aligned harmony timeline normalization + validation');

import {harmonyTimelineFor,materializeScoreModel} from './src/curriculum/materialize.js';
import {harmonyFieldById} from './src/curriculum/harmonyFields.js';

const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const baseVariant={variantId:'harmony-test',allowedKeys:['C'],allowedPresentation:['COLD_READ'],notes:[{pitch:'G4',midi:67,startBeat:0,duration:4,rest:false}],meter:[4,4]};
const session={key:'C',bpm:60};
const staticEvent={variantId:'harmony-test',key:'C',harmonyContext:'C7',presentationMode:'COLD_READ',title:'static'};
const staticScore=materializeScoreModel(baseVariant,staticEvent,session);
assert(staticScore.harmonyTimeline.length===1,'static harmony should normalize to one timeline entry');
assert(staticScore.harmonyTimeline[0].beat===0&&staticScore.harmonyTimeline[0].chord==='C7','static harmony normalization');

const movingEvent={...staticEvent,harmonyTimeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7'}]};
const moving=harmonyTimelineFor(movingEvent,4);
assert(moving.length===2&&moving[1].beat===2&&moving[1].chord==='G7','moving harmony timeline');
const movingScore=materializeScoreModel(baseVariant,movingEvent,session);
assert(movingScore.chords.join(',')==='Dm7,G7','moving chord labels');
assert(harmonyFieldById('ii-v-i-c-2bar').timeline.map(x=>x.chord).join(',')==='Dm7,G7,Cmaj7','separate harmony field registry');
assert(!('harmonyTimeline' in baseVariant),'phrase variant must not own harmony timeline');
let rejected=false;try{harmonyTimelineFor({...staticEvent,harmonyTimeline:[{beat:1,chord:'G7'}]},4)}catch{rejected=true}
assert(rejected,'harmony timeline must begin at beat 0');
console.log('OK: event-owned beat-aligned harmony timeline + separate harmony field registry');

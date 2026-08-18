import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {buildTrainingClosingFlowEvent} from './src/curriculum/trainingClosingFlow.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};

const stage0=buildDailySessionPlan({currentStage:0,eventCount:8,targetSessionBeats:128});
const closing=stage0.events.at(-1);
assert(closing.presentationMode==='FLOW'&&closing.scoringPolicy==='FLOW','ordinary Stage 0-13 Session ends in FLOW');
assert(closing.endBeat===stage0.totalBeats,'Closing FLOW owns the final musical field');
assert(closing.flowAction==='REPEAT','four-beat material closes by repeating the known move');
assert(closing.flowSourceVariantIds.length===2&&closing.flowSourceVariantIds[0]===closing.flowSourceVariantIds[1],'Closing REPEAT reuses one already-present Variant instead of introducing material');
assert(closing.modelPolicy==='NONE'&&closing.morphPolicy==='NONE','Closing FLOW adds no Teacher Call or BUILD scaffold');
assert(stage0.events.length===8&&stage0.totalBeats===128,'Closing FLOW replaces the final slot without lengthening the Session');

const source={
  eventId:'long-source',familyId:'long-family',variantId:'long-variant',sourceKey:'C',key:'C',sourceHarmonyFieldId:'long-field',sourceHarmonyContext:'Cmaj7',harmonyFieldId:'long-field',harmonyContext:'Cmaj7',tonalFieldId:null,movePolicy:'NONE',form:'phrase-8',fieldBeats:16,formPosition:0,startBeat:0,prepareBeat:0,singStartBeat:4,singEndBeat:12,endBeat:16,presentationMode:'COLD_READ',keyTransfer:false,
  scoreModel:{id:'long-variant',sourceKey:'C',key:'C',bpm:60,meter:[4,4],notes:[{pitch:'C4',startBeat:0,duration:4},{pitch:'G4',startBeat:4,duration:4}],harmonyTimeline:[{beat:0,chord:'Cmaj7'},{beat:4,chord:'G7'}],chords:['Cmaj7','G7'],totalBeats:8,unitBeats:4,movePolicy:'NONE',sourceVariantId:'long-variant'}
};
const longClose=buildTrainingClosingFlowEvent({sourceEvent:source,startBeat:0,endBeat:16,bpm:60});
assert(longClose.flowAction==='CONNECT'&&longClose.scoreModel.totalBeats===8,'already-long material closes as one connected phrase when a repeat would crowd the field');
assert(longClose.singEndBeat<=longClose.endBeat-4,'Closing FLOW preserves response space after SING');

console.log('OK: Stage 0-13 uses the final field for scaffold-free Closing FLOW, repeating short material and keeping long material connected');

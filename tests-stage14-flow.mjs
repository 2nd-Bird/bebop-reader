import {musicalFormById} from './src/curriculum/musicalForms.js';
import {connectVariants,buildClosingFlowEvent} from './src/curriculum/flow.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult} from './src/curriculum/mastery.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const blues=musicalFormById('c-blues-12'),program=blues.closingFlowProgram;
assert(program?.variantIds.join(',')==='gf-cell-seed,gf-cell-return,gf-cell-fan,gf-cell-return','Closing FLOW connects known Stage 7 variants rather than inventing a new lick');
const connected=connectVariants(program.variantIds);
assert(connected.totalBeats===16&&connected.sources.length===4,'four known one-bar chunks connect into one four-bar score');
assert(connected.notes.some(n=>n.startBeat<4)&&connected.notes.some(n=>n.startBeat>=12),'connected score spans all four bars');
assert(connected.sources.every(x=>x.familyId==='g-to-f-surfaces'),'all connected parts retain the same known Phrase Family');

const direct=buildClosingFlowEvent({musicalForm:blues,startBeat:256,endBeat:288,key:'C',bpm:60});
assert(direct.presentationMode==='FLOW'&&direct.flowAction==='CONNECT','connected event uses FLOW presentation mode');
assert(direct.variantId===null&&direct.flowSourceVariantIds.length===4,'composite FLOW does not pretend to be one Variant');
assert(direct.scoreModel.totalBeats===16&&direct.singEndBeat-direct.singStartBeat===16,'FLOW is one continuous four-bar SING window');
assert(direct.startBeat===256&&direct.singStartBeat===268&&direct.singEndBeat===284&&direct.endBeat===288,'FLOW leaves pre-read and a final response bar without changing session duration');
assert(direct.formPosition===7,'FLOW begins reading at Blues bar 8 and continues four bars');
assert(direct.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:C7,4:G7,8:F7,12:C7','four-bar FLOW follows the actual C Blues harmonic positions');
assert(direct.modelPolicy==='NONE'&&direct.morphPolicy==='NONE'&&direct.scoreVisibility==='FULL','Connect FLOW is scaffold-free but still ordinary visible notation');

const plan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',eventCount:24,targetSessionBeats:320,bpm:60});
const flows=plan.events.filter(e=>e.presentationMode==='FLOW');
assert(flows.length===1,'one Closing FLOW appears in the C Blues session');
const flow=flows[0];
assert(flow.eventId===plan.events.at(-1).eventId,'Closing FLOW is the final Learning Event');
assert(plan.events.at(-2).endBeat===flow.startBeat,'FLOW replaces two ordinary fields without overlap or timing gap');
assert(plan.totalBeats===288&&flow.endBeat===288,'FLOW preserves full-chorus session ending');
assert(plan.events.length===17,'two final 16-beat fields are replaced by one 32-beat FLOW field');
createTimeline(plan).validate();

let record=emptyFamilyMastery();
record=applyEventResult(record,flow,{readScore:88,stars:4},1000);
assert(record.flowAttempts===1&&record.flowRead>.8,'FLOW performance is tracked separately');
assert(record.flowActions.includes('CONNECT')&&record.flowFormIds.includes('c-blues-12'),'successful FLOW records Connect/form evidence');
assert(record.coldReadAttempts===0&&record.coldVariantIds.length===0,'FLOW does not masquerade as cold-read Variant mastery');
assert(record.seenVariantIds.length===0,'composite FLOW with no Variant ID does not create a fake seen Variant');

console.log('OK: C Blues closes with one visible four-bar CONNECT FLOW built only from already-known Phrase Variants');

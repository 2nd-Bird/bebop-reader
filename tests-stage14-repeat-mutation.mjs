import fs from 'node:fs';
import {musicalFormById} from './src/curriculum/musicalForms.js';
import {buildPairFlowEvent} from './src/curriculum/flowPair.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {emptyFamilyMastery,applyEventResult,cBluesRepeatReady,cBluesMutationReady,cBluesConnectReady} from './src/curriculum/mastery.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const blues=musicalFormById('c-blues-12');

const repeat=buildPairFlowEvent({musicalForm:blues,startBeat:272,endBeat:288,key:'C',bpm:60,flowAction:'REPEAT'});
assert(repeat.presentationMode==='FLOW'&&repeat.flowAction==='REPEAT','Repeat is an explicit FLOW action');
assert(repeat.variantId===null&&repeat.familyId==='g-to-f-surfaces','Repeat keeps Phrase Family identity without fabricating a composite Variant');
assert(repeat.flowSourceVariantIds.join(',')==='gf-cell-seed,gf-cell-seed','Repeat uses the same already-known one-bar Variant twice');
assert(repeat.prepareBeat===272&&repeat.singStartBeat===276&&repeat.singEndBeat===284&&repeat.endBeat===288,'Repeat gives four beats of pre-read, eight continuous SING beats, then four beats of space');
assert(repeat.singStartBeat-repeat.prepareBeat===4,'Repeat preserves a silent pre-read/audiation window');
assert(repeat.scoreModel.totalBeats===8&&repeat.scoreVisibility==='FULL','Repeat presents two complete visible bars of ordinary staff notation');
assert(repeat.modelPolicy==='NONE'&&repeat.morphPolicy==='NONE','Repeat does not reintroduce model or Morph scaffold');
assert(repeat.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:F7,4:C7','Repeat stays inside the actual final C Blues harmonic positions');
assert(!('analysisPrompt' in repeat)&&!('cellQuestion' in repeat)&&!('nameTheChord' in repeat),'Repeat is reading/singing rather than a theory task');
createTimeline({events:[repeat],totalBeats:288}).validate();

const mutation=buildPairFlowEvent({musicalForm:blues,startBeat:272,endBeat:288,key:'C',bpm:60,flowAction:'MUTATION'});
assert(mutation.flowSourceVariantIds.join(',')==='gf-cell-seed,gf-cell-return','Mutation changes only the second bar to another already-known Variant in the same Family');
assert(mutation.flowSourceVariantIds[0]!==mutation.flowSourceVariantIds[1],'Mutation is not a disguised repeat');
assert(mutation.scoreModel.totalBeats===8&&mutation.singEndBeat-mutation.singStartBeat===8,'Mutation is one continuous two-bar reading window');
assert(mutation.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(',')===repeat.harmonyTimeline.map(x=>`${x.beat}:${x.chord}`).join(','),'Repeat→Mutation changes the surface while keeping the same form slot/harmony field');
assert(mutation.modelPolicy==='NONE'&&mutation.morphPolicy==='NONE'&&mutation.scoreVisibility==='FULL','Mutation stays scaffold-free with ordinary visible notation');
assert(!('analysisPrompt' in mutation)&&!('cellQuestion' in mutation)&&!('nameTheChord' in mutation),'Mutation remains experiential staff reading rather than a theory task');
createTimeline({events:[mutation],totalBeats:288}).validate();

const flowBase={familyId:'g-to-f-surfaces',variantId:null,presentationMode:'FLOW',formTransfer:true,form:'c-blues-12',formPosition:9,harmonyContext:'F7',harmonyFieldId:'form:c-blues-12:pair'};
let weak=emptyFamilyMastery();
weak=applyEventResult(weak,{...flowBase,flowAction:'REPEAT'},{readScore:62,stars:2},500);
assert(!cBluesRepeatReady({'g-to-f-surfaces':weak}),'weak Repeat does not count as successful FLOW evidence');

let record=emptyFamilyMastery(),evidence={};
assert(!cBluesRepeatReady(evidence)&&!cBluesMutationReady(evidence)&&!cBluesConnectReady(evidence),'blank mastery begins before Repeat');
record=applyEventResult(record,{...flowBase,flowAction:'REPEAT'},{readScore:88,stars:4},1000);evidence={'g-to-f-surfaces':record};
assert(cBluesRepeatReady(evidence)&&!cBluesMutationReady(evidence),'successful Repeat unlocks Mutation only');
record=applyEventResult(record,{...flowBase,flowAction:'MUTATION'},{readScore:86,stars:4},2000);evidence={'g-to-f-surfaces':record};
assert(cBluesMutationReady(evidence)&&!cBluesConnectReady(evidence),'successful Mutation unlocks the later Connect step but is not Connect evidence');
assert(record.flowActions.join(',')==='REPEAT,MUTATION','FLOW history preserves Repeat → Mutation order');
assert(record.seenVariantIds.length===0&&record.coldVariantIds.length===0,'composite pair FLOW never fabricates Variant/cold-read mastery');

const blankPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:24,targetSessionBeats:320});
assert(blankPlan.events.at(-1).flowAction==='REPEAT','normal C Blues FLOW begins with Repeat');
const repeatEvidence={'g-to-f-surfaces':applyEventResult(emptyFamilyMastery(),{...flowBase,flowAction:'REPEAT'},{readScore:88,stars:4},1000)};
const repeatPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:repeatEvidence,bpm:60,eventCount:24,targetSessionBeats:320});
assert(repeatPlan.events.at(-1).flowAction==='MUTATION','after Repeat the next session advances to Mutation');
const mutationPlan=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:evidence,bpm:60,eventCount:24,targetSessionBeats:320});
assert(mutationPlan.events.at(-1).flowAction==='CONNECT','after Mutation the existing four-bar Connect step follows');
assert(mutationPlan.events.at(-1).scoreModel.totalBeats===16,'Connect remains the later four-bar continuous SING target');
createTimeline(blankPlan).validate();createTimeline(repeatPlan).validate();createTimeline(mutationPlan).validate();

const debugRepeat=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'REPEAT'});
const debugMutation=buildDailySessionPlan({currentStage:14,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'MUTATION'});
assert(debugRepeat.events.at(-1).flowAction==='REPEAT'&&debugMutation.events.at(-1).flowAction==='MUTATION','debug harness can expose both pair FLOW states in one C Blues chorus');
assert(debugRepeat.events.at(-1).startBeat===32&&debugRepeat.events.at(-1).singStartBeat===36&&debugRepeat.events.at(-1).singEndBeat===44,'short Repeat harness preserves the 4+8+4 timing contract');

const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(view.includes("REPEAT:'同じ動きを続ける'")&&view.includes("MUTATION:'同じ動き、少し変わる'"),'learner copy names the musical action without exposing analysis jargon');
assert(player.includes("['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS']"),'debug FLOW axis exposes the canonical progression through one chorus');
assert(sw.includes("'./src/curriculum/flowPair.js'"),'PWA cache contains the pair FLOW builder');

console.log('OK: Stage 14 now realizes READ → Repeat → Mutation → Connect using only known Phrase Family surfaces, ordinary staff, silent audiation and continuous transport');

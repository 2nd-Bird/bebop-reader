import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {createTimeline} from './src/session/timeline.js';
import {variantById} from './src/curriculum/variantRegistry.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitches=notes=>notes.filter(n=>!n.rest).map(n=>n.pitch).join(',');

for(const key of ['F','Bb']){
  for(let stage=0;stage<=13;stage++){
    const plan=buildDailySessionPlan({currentStage:stage,key,bpm:60,eventCount:12,targetSessionBeats:192});
    assert(plan.key===key&&plan.sourceKey==='C',`${key} Stage ${stage}: plan keeps C-source vs sounding key separation`);
    assert(plan.events.length>0,`${key} Stage ${stage}: session contains Learning Events`);
    createTimeline(plan).validate();
    for(const event of plan.events){
      assert(event.key===key&&event.sourceKey==='C',`${key} Stage ${stage}: event key metadata follows transfer axis`);
      assert(event.sourceHarmonyContext&&event.harmonyContext,`${key} Stage ${stage}: source and sounding harmony contexts are explicit`);
      assert(event.scoreModel.key===key&&event.scoreModel.sourceKey==='C',`${key} Stage ${stage}: ordinary score/scoring model is realized in target key`);
      assert(event.scoreModel.sourceVariantId===event.variantId,`${key} Stage ${stage}: Variant identity survives key transfer`);
    }
  }
}

// Stage 10: same familiar shape, new background, then same curriculum transferred to another key.
for(const [key,expectedFContext,expectedG7Context,expectedTriad] of [
  ['F','Bb','C7','Bb4,D5,F5'],
  ['Bb','Eb','F7','Eb4,G4,Bb4'],
]){
  const plan=buildDailySessionPlan({currentStage:10,key,bpm:60,eventCount:12,targetSessionBeats:192});
  const events=plan.events.filter(e=>e.familyId==='relative-major-reinterpret');
  const familiar=events.find(e=>e.variantId==='rm-f-triad'&&e.sourceHarmonyContext==='F');
  const dominant=events.find(e=>e.variantId==='rm-f-triad'&&e.sourceHarmonyContext==='G7');
  assert(familiar?.harmonyContext===expectedFContext&&dominant?.harmonyContext===expectedG7Context,`${key} Stage 10: F→G7 source contexts become the correct sounding contexts`);
  assert(pitches(familiar.scoreModel.notes)===expectedTriad&&pitches(dominant.scoreModel.notes)===expectedTriad,`${key} Stage 10: harmony reinterpretation changes background, not transferred staff shape`);
}

// C Blues composite FLOW uses a separate builder path; every implemented action must transfer too.
const flowActions=['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS'];
for(const key of ['F','Bb']){
  for(const action of flowActions){
    const oneChorus=action==='ONE_CHORUS';
    const plan=buildDailySessionPlan({currentStage:14,key,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:oneChorus?6:3,targetSessionBeats:oneChorus?96:48,flowActionOverride:action});
    createTimeline(plan).validate();
    const flow=plan.events.at(-1);
    assert(flow.presentationMode==='FLOW'&&flow.flowAction===action,`${key} ${action}: requested composite FLOW is present`);
    assert(flow.key===key&&flow.sourceKey==='C'&&flow.scoreModel.key===key&&flow.scoreModel.sourceKey==='C',`${key} ${action}: composite FLOW carries key separation through event and score`);
    assert(flow.sourceHarmonyContext&&flow.harmonyContext&&flow.sourceHarmonyContext!==flow.harmonyContext,`${key} ${action}: composite FLOW keeps source and sounding harmony distinct`);
    assert(flow.harmonyFieldId.endsWith(`@key:${key}`),`${key} ${action}: composite FLOW owns a key-specific realized harmony field`);
    if(action==='TRADE'){
      assert(flow.modelScoreModel.key===key&&flow.modelScoreModel.sourceKey==='C',`${key} TRADE: model call transfers with visible response`);
      assert(flow.modelScoreModel.sourceHarmonyContext!==flow.modelScoreModel.harmonyContext,`${key} TRADE: call source/sounding harmony are separate`);
    }
  }
  const repeat=buildDailySessionPlan({currentStage:14,key,formId:'c-blues-12',familyMastery:{},bpm:60,eventCount:3,targetSessionBeats:48,flowActionOverride:'REPEAT'}).events.at(-1);
  assert(pitches(repeat.scoreModel.notes).startsWith(key==='F'?'C5,F5':'F4,Bb4'),`${key} Repeat: known G→F seed moves to the expected staff positions`);
}

// Rhythm Changes is the high-risk composition: source functional MOVE must happen before key transfer.
const soundingContexts={
  F:{E7:'A7',D7:'G7',A7:'D7',G7:'C7'},
  Bb:{E7:'D7',D7:'C7',A7:'G7',G7:'F7'},
};
const movedPitches={
  F:{E7:'G4,B4,D5',D7:'F4,A4,C5',A7:'C5,E5,G5',G7:'Bb4,D5,F5'},
  Bb:{E7:'C4,E4,G4',D7:'Bb3,D4,F4',A7:'F4,A4,C5',G7:'Eb4,G4,Bb4'},
};
for(const key of ['F','Bb']){
  const plan=buildDailySessionPlan({currentStage:14,key,formId:'rhythm-changes-32',bpm:60,eventCount:20,targetSessionBeats:320});
  createTimeline(plan).validate();
  assert(plan.formHarmonyTimeline.some(x=>x.chord===soundingContexts[key].E7),`${key} Rhythm Changes: global form harmony is transferred`);
  const bridge=plan.events.filter(e=>e.movePolicy==='RELATIVE_MAJOR_OF_DOMINANT');
  assert(bridge.length===4,`${key} Rhythm Changes: two choruses retain four functional bridge MOVE encounters`);
  for(const event of bridge){
    const source=event.sourceHarmonyContext;
    assert(event.harmonyContext===soundingContexts[key][source],`${key} Rhythm Changes ${source}: sounding dominant is the transferred source chord`);
    assert(pitches(event.scoreModel.notes)===movedPitches[key][source],`${key} Rhythm Changes ${source}: Relative Major MOVE is generated in source grammar then key-transferred once`);
    assert(event.scoreModel.sourceHarmonyContext===source&&event.scoreModel.harmonyContext===event.harmonyContext,`${key} Rhythm Changes ${source}: score model preserves both harmony roles`);
  }
}

assert(pitches(variantById('rm-f-triad').notes)==='F4,A4,C5','full-curriculum F/B-flat debug traversal never mutates source Relative Major Variant');
console.log('OK: debug-only F/B-flat key transfer runs Stage 0–14, including all composite C Blues FLOW and Rhythm Changes functional MOVE, without duplicating curriculum grammar or double-transposing harmony');

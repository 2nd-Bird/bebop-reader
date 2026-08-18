import {familyById} from '../curriculum/phraseFamilyRegistry.js';
import {isFamilyMastered,cBluesStageReady} from '../curriculum/mastery.js';
import {stageByNumber} from '../curriculum/stages.js';

const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const keyOpen=(state,key)=>Boolean(state?.keyProgress?.[key]?.unlocked);
const keyTitle=key=>key==='Bb'?'B♭ Major':`${key} Major`;

export function deriveSessionRewards({beforeState={},afterState={},plan={}}={}){
  const beforeMastery=beforeState.familyMastery||{},afterMastery=afterState.familyMastery||{};
  const familyIds=uniq([...(plan.focusFamilyIds||[]),...(plan.events||[]).map(e=>e.familyId)]);
  const strengthenedFamilies=familyIds
    .filter(id=>!isFamilyMastered(beforeMastery[id],id)&&isFamilyMastered(afterMastery[id],id))
    .map(id=>({familyId:id,title:familyById(id)?.title||id}));

  const beforeStage=Number(beforeState.stageProgress?.currentStage??0),afterStage=Number(afterState.stageProgress?.currentStage??beforeStage),unlocks=[];
  if(afterStage>beforeStage){
    const stage=stageByNumber(afterStage);unlocks.push({type:'STAGE',id:`stage-${afterStage}`,title:stage?.title||`Stage ${afterStage}`});
  }
  if(!cBluesStageReady(beforeMastery)&&cBluesStageReady(afterMastery))unlocks.push({type:'FORM',id:'rhythm-changes-32',title:'Rhythm Changes'});
  for(const key of ['F','Bb'])if(!keyOpen(beforeState,key)&&keyOpen(afterState,key))unlocks.push({type:'KEY',id:`key-${key}`,title:keyTitle(key)});

  return{streak:Number(afterState.streak)||0,strengthenedFamilies,unlocks};
}

import fs from 'node:fs';
import {deriveSessionRewards} from './src/scoring/sessionRewards.js';
import {familyById,familiesForStage} from './src/curriculum/phraseFamilyRegistry.js';
import {variantById} from './src/curriculum/variantRegistry.js';
import {stageByNumber} from './src/curriculum/stages.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const masteredRecord=familyId=>{
  const family=familyById(familyId),coldVariantIds=family.variants.filter(id=>variantById(id)?.coldReadEligible!==false),requiredHarmony=family.requiredColdHarmonyFieldIds||[],requiredPairs=family.requiredColdVariantHarmonyKeys||[];
  return{familyId,reading:.9,coldRead:.9,attempts:Math.max(4,coldVariantIds.length),coldReadAttempts:Math.max(2,coldVariantIds.length,requiredPairs.length),coldVariantIds,coldHarmonyFieldIds:[...requiredHarmony],coldVariantHarmonyKeys:[...requiredPairs]};
};

const stage0Family=familiesForStage(0)[0];
assert(stage0Family,'Stage 0 has a mastery-bearing Phrase Family');
const before={streak:3,stageProgress:{currentStage:0},familyMastery:{}};
const after={streak:4,stageProgress:{currentStage:1},familyMastery:{[stage0Family.familyId]:masteredRecord(stage0Family.familyId)}};
const reward=deriveSessionRewards({beforeState:before,afterState:after,plan:{focusFamilyIds:[stage0Family.familyId],events:[]}});
assert(reward.streak===4,'Summary reward uses the persisted post-session streak');
assert(reward.strengthenedFamilies.length===1&&reward.strengthenedFamilies[0].familyId===stage0Family.familyId,'only a Family crossing the existing mastery gate is called newly strengthened');
assert(reward.strengthenedFamilies[0].title===stage0Family.title,'strengthened material uses the existing Phrase Family title');
assert(reward.unlocks.some(x=>x.type==='STAGE'&&x.title===stageByNumber(1).title),'existing Stage Progress advancement becomes a Session Summary unlock');

const alreadyStrong={streak:4,stageProgress:{currentStage:1},familyMastery:{[stage0Family.familyId]:masteredRecord(stage0Family.familyId)}};
const stillStrong={streak:5,stageProgress:{currentStage:1},familyMastery:{[stage0Family.familyId]:masteredRecord(stage0Family.familyId)}};
const noNew=deriveSessionRewards({beforeState:alreadyStrong,afterState:stillStrong,plan:{focusFamilyIds:[stage0Family.familyId]}});
assert(noNew.strengthenedFamilies.length===0&&noNew.unlocks.length===0,'Summary does not repeatedly claim an already-mastered Family or unchanged Stage as new');

const formContexts=familyId=>['C7','F7','G7'].map(chord=>`c-blues-12@${familyId}@${chord}`);
const flowRecord={familyId:'g-to-f-surfaces',reading:.9,coldRead:.9,flowRead:.9,flowFormIds:['c-blues-12'],flowActions:['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS'],coldFormContextKeys:formContexts('g-to-f-surfaces')};
const densityRecord={familyId:'density-g-to-f',reading:.9,coldRead:.9,coldFormContextKeys:formContexts('density-g-to-f')};
const beforeBlues={streak:7,stageProgress:{currentStage:14},familyMastery:{'g-to-f-surfaces':{...flowRecord,flowActions:['REPEAT','MUTATION','CONNECT','TRADE','RECALL']},'density-g-to-f':densityRecord}};
const afterBlues={streak:8,stageProgress:{currentStage:14},familyMastery:{'g-to-f-surfaces':flowRecord,'density-g-to-f':densityRecord}};
const bluesReward=deriveSessionRewards({beforeState:beforeBlues,afterState:afterBlues,plan:{focusFamilyIds:['g-to-f-surfaces','density-g-to-f']}});
assert(bluesReward.unlocks.some(x=>x.type==='FORM'&&x.id==='rhythm-changes-32'&&x.title==='Rhythm Changes'),'existing C Blues gate crossing surfaces the already-defined Rhythm Changes form unlock');
assert(bluesReward.unlocks.every(x=>x.type!=='KEY'),'Session Summary never invents F/B-flat unlock while issue #31 is unresolved');

const engine=fs.readFileSync(new URL('./src/session/engine.js',import.meta.url),'utf8');
const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');
assert(engine.includes('const baseSummary=summarizeSession(results),rewards=onSessionComplete?.(baseSummary,plan)||{}')&&engine.includes('view.showSummary({...baseSummary,...rewards})'),'Engine merges persisted reward state only after the continuous Session is finished');
assert(player.includes('deriveSessionRewards({beforeState:state,afterState,plan})'),'Player compares pre/post persisted mastery rather than inventing a second mastery threshold');
assert(view.includes('STRENGTHENED')&&view.includes('UNLOCK')&&view.includes('STREAK'),'Session Summary primary surface includes the required reward concepts');
assert(view.includes('<details class="performance-details card session-details"><summary>歌唱の詳細を見る</summary>'),'Pitch/Time/Flow move behind a collapsed detail disclosure instead of dominating the main result');

console.log('OK: Session Summary promotes Stars/Streak/newly strengthened material/unlocks from existing persisted mastery, while Pitch/Time/Flow remain secondary details and Key Unlock thresholds are untouched');

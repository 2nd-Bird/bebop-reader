import fs from 'node:fs';
import {EXERCISES} from './src/exercises.js';
import {sessionSummaryMarkup} from './src/ui/sessionView.js';
import {deriveSessionRewards} from './src/scoring/sessionRewards.js';
import {scoreEvent} from './src/scoring/eventScoring.js';
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
const before={streak:3,stageProgress:{currentStage:0},familyMastery:{},keyProgress:{C:{unlocked:true},F:{unlocked:false},Bb:{unlocked:false}}};
const after={streak:4,stageProgress:{currentStage:1},familyMastery:{[stage0Family.familyId]:masteredRecord(stage0Family.familyId)},keyProgress:{C:{unlocked:true},F:{unlocked:true},Bb:{unlocked:false}}};
const reward=deriveSessionRewards({beforeState:before,afterState:after,plan:{focusFamilyIds:[stage0Family.familyId],events:[]}});
assert(reward.streak===4,'Summary uses persisted post-session streak');
assert(reward.strengthenedFamilies.length===1&&reward.strengthenedFamilies[0].familyId===stage0Family.familyId,'only an existing Family mastery gate crossing is called strengthened');
assert(reward.unlocks.some(x=>x.type==='STAGE'&&x.title===stageByNumber(1).title),'existing Stage advancement becomes an unlock reward');
assert(reward.unlocks.some(x=>x.type==='KEY'&&x.id==='key-F'&&x.title==='F Major'),'persisted F unlock becomes a Summary reward');

const beforeBb={...after,streak:4,keyProgress:{C:{unlocked:true},F:{unlocked:true},Bb:{unlocked:false}}};
const afterBb={...after,streak:5,keyProgress:{C:{unlocked:true},F:{unlocked:true},Bb:{unlocked:true}}};
const bbReward=deriveSessionRewards({beforeState:beforeBb,afterState:afterBb,plan:{focusFamilyIds:[]}});
assert(bbReward.unlocks.length===1&&bbReward.unlocks[0].id==='key-Bb'&&bbReward.unlocks[0].title==='B♭ Major','persisted B-flat unlock is reported only when the actual key gate crosses');

const noNew=deriveSessionRewards({beforeState:afterBb,afterState:{...afterBb,streak:6},plan:{focusFamilyIds:[stage0Family.familyId]}});
assert(noNew.strengthenedFamilies.length===0&&noNew.unlocks.length===0,'Summary does not repeatedly announce already-open rewards');

const ex=EXERCISES[0],transport={bpm:ex.bpm,timeAtBeat:beat=>beat*60/ex.bpm},event={eventId:'summary-guide',familyId:'anchor-do-sol',variantId:'guide-source',singStartBeat:0,singEndBeat:ex.totalBeats};
const guideResult=scoreEvent({event,scoreModel:ex,samples:[],transport,latencyMs:0});
assert(guideResult.scoreGuideModel?.totalBeats===ex.totalBeats&&guideResult.scoreGuideModel?.bpm===ex.bpm,'Event result retains the timing needed to re-render a diagnostic guide');
assert(guideResult.scoreGuideModel.notes.length===ex.notes.length&&guideResult.scoreGuideModel.notes.every(n=>Object.keys(n).sort().join(',')==='duration,midi,pitch,rest,startBeat'),'diagnostic snapshot keeps only ordinary target-note geometry, not curriculum internals');

const html=sessionSummaryMarkup({stars:4,readScore:82,pitch:71,time:88,flow:90,...reward,eventResults:[guideResult]});
const detailsAt=html.indexOf('<details'),primary=detailsAt>=0?html.slice(0,detailsAt):html,details=detailsAt>=0?html.slice(detailsAt):'';
assert(primary.includes('SESSION COMPLETED')&&primary.includes('4 of 5 stars')&&primary.includes('Reading 82')&&primary.includes('Streak 4日'),'stars, reading and streak remain primary');
assert(primary.includes('STRENGTHENED')&&primary.includes(stage0Family.title),'newly strengthened material is visible before vocal diagnostics');
assert(primary.includes('UNLOCK')&&primary.includes('F Major')&&primary.includes(stageByNumber(1).title),'actual unlocks are visible before vocal diagnostics');
assert(!primary.includes('Pitch 71')&&!primary.includes('Time 88')&&!primary.includes('Flow 90'),'Pitch / Time / Flow are not exposed in the primary Summary');
assert(details.includes('<summary>歌唱の詳細を見る</summary>')&&details.includes('Pitch 71')&&details.includes('Time 88')&&details.includes('Flow 90'),'vocal diagnostics remain available behind explicit expansion');
assert(details.includes('id="session-pitch-guide"'),'collapsed detail owns a DAM-style guide target without moving it into primary feedback');
assert(!html.includes('open>'),'performance details are collapsed by default');

const engine=fs.readFileSync(new URL('./src/session/engine.js',import.meta.url),'utf8'),player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8'),view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8'),sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(engine.includes('rewards=onSessionComplete?.(baseSummary,plan)||{}')&&engine.includes('view.showSummary({...baseSummary,...rewards})'),'Engine asks persistence for rewards only after the continuous Session finishes');
assert(player.includes('deriveSessionRewards({beforeState:state,afterState,plan})'),'Player derives rewards from persisted pre/post state rather than a second threshold');
assert(view.includes('renderPitchGuide(guide,weak.scoreGuideModel,weak)')&&view.includes("sort((a,b)=>Number(a.readScore||0)-Number(b.readScore||0))"),'Session details reuses the existing DAM renderer for the weakest scored phrase');
assert(sw.includes("'./src/scoring/sessionRewards.js'")&&sw.includes("'./src/pitchGuide.js'"),'PWA caches both reward and existing pitch-guide runtimes');

console.log('OK: Session Summary keeps rewards primary and reuses the existing DAM guide for the weakest phrase only inside optional vocal details');

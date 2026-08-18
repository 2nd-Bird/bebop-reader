import {buildDailySessionPlan} from './src/curriculum/scheduler.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};

const fresh=buildDailySessionPlan({currentStage:0,eventCount:8,targetSessionBeats:128});
assert(fresh.warmupEventId===null&&!fresh.events.some(e=>e.warmup),'Stage 0 has no previously learned Family to warm up');

const familyMastery={
  'do-sol-in-time':{attempts:3,coldReadAttempts:2,reading:.82,coldRead:.81},
};
const plan=buildDailySessionPlan({currentStage:2,eventCount:8,targetSessionBeats:128,familyMastery});
const warmup=plan.events[0];
assert(plan.warmupEventId===warmup.eventId&&warmup.warmup===true,'known-family warm-up occupies the opening musical field');
assert(warmup.familyId==='do-sol-in-time','warm-up reuses already encountered material instead of the new Stage 2 Family');
assert(warmup.variantId==='do-sol-q-01','warm-up uses the Family sequence’s easiest cold-readable Variant');
assert(warmup.presentationMode==='COLD_READ','warm-up is a COLD READ');
assert(warmup.modelPolicy==='NONE'&&warmup.morphPolicy==='NONE','warm-up does not add Teacher Call or BUILD scaffold');
assert(plan.events.length===8&&plan.totalBeats===128,'warm-up replaces one normal slot instead of lengthening the Session');
assert(plan.events.filter(e=>e.warmup).length===1,'ordinary Training/Phrase session has at most one warm-up Event');

console.log('OK: Daily Session opens with one easy known-family COLD READ without changing duration or adding scaffold');

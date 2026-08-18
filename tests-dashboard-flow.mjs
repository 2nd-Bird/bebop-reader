import fs from 'node:fs';
import {nextCBluesFlowAction} from './src/curriculum/flowProgress.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const record=actions=>({'g-to-f-surfaces':{flowRead:.9,flowFormIds:['c-blues-12'],flowActions:actions}});

assert(nextCBluesFlowAction({})==='REPEAT','empty FLOW evidence starts at Repeat');
assert(nextCBluesFlowAction(record(['REPEAT']))==='MUTATION','Repeat advances to Mutation');
assert(nextCBluesFlowAction(record(['REPEAT','MUTATION']))==='CONNECT','Mutation advances to Connect');
assert(nextCBluesFlowAction(record(['REPEAT','MUTATION','CONNECT']))==='TRADE','Connect advances to Trade');
assert(nextCBluesFlowAction(record(['REPEAT','MUTATION','CONNECT','TRADE']))==='RECALL','Trade advances to Recall');
assert(nextCBluesFlowAction(record(['REPEAT','MUTATION','CONNECT','TRADE','RECALL']))==='ONE_CHORUS','Recall advances to One Chorus');
assert(nextCBluesFlowAction(record(['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS']))===null,'One Chorus completes implemented FLOW sequence');

const dashboard=fs.readFileSync(new URL('./src/ui/dashboardV09.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(dashboard.includes("nextCBluesFlowAction")&&dashboard.includes("TRADE:'聴いて、譜面で返す'")&&dashboard.includes("ONE_CHORUS:'1コーラスを読み切る'"),'Home/Library expose the full implemented Stage 14 FLOW sequence');
assert(dashboard.includes('TODAY · 7 MIN')&&dashboard.includes('約5〜7分 · 音楽は止まりません'),'Home uses Product SPEC time-first framing');
assert(!dashboard.includes('connectReady'),'dashboard no longer collapses Stage 14 progress to Connect/Recall only');
assert(sw.includes("'./src/curriculum/flowProgress.js'"),'PWA caches dashboard FLOW progress helper');

console.log('OK: dashboard follows Repeat → Mutation → Connect → Trade → Recall → One Chorus and keeps time-first Daily Session framing');

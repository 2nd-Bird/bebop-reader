import {sessionSummaryMarkup} from './src/ui/sessionView.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const html=sessionSummaryMarkup({stars:4,readScore:82,pitch:71,time:88,flow:90});
const detailsAt=html.indexOf('<details');
const primary=detailsAt>=0?html.slice(0,detailsAt):html;
const details=detailsAt>=0?html.slice(detailsAt):'';

assert(detailsAt>0,'session summary includes collapsed performance details');
assert(primary.includes('SESSION COMPLETED')&&primary.includes('4 of 5 stars')&&primary.includes('Reading 82'),'stars and overall reading remain primary');
assert(!primary.includes('Pitch 71')&&!primary.includes('Time 88')&&!primary.includes('Flow 90'),'Pitch / Time / Flow are not exposed in the primary summary');
assert(details.includes('<summary>歌唱の詳細を見る</summary>'),'vocal metrics require an explicit details expansion');
assert(details.includes('Pitch 71')&&details.includes('Time 88')&&details.includes('Flow 90'),'expanded details retain diagnostic vocal metrics');
assert(!html.includes('open>'),'performance details are collapsed by default');

console.log('OK: Session Summary keeps stars/Reading primary and hides Pitch/Time/Flow behind optional details');

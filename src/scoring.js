import {centsBetween} from './pitchDetector.js';
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
export function scoreAttempt(ex,samples,latencyMs=0){
  const spb=60/ex.bpm; const latency=latencyMs/1000; const notes=[];
  for(const n of ex.notes){
    if(n.rest)continue;
    const start=n.startBeat*spb+latency, end=(n.startBeat+n.duration)*spb+latency;
    const window=samples.filter(s=>s.t>=start-0.07&&s.t<=end+0.04&&s.hz&&s.clarity>.65);
    const cents=window.map(s=>Math.abs(centsBetween(s.hz,n.midi)));
    const med=median(cents);
    const pitchScore=med==null?0:clamp(100-(Math.max(0,med-20)*1.25));
    const onset=window.length?window[0].t:null;
    const errMs=onset==null?999:Math.abs((onset-start)*1000);
    const timeScore=clamp(100-Math.max(0,errMs-70)*0.35);
    const expectedFrames=Math.max(1,(end-start)/0.05);
    const voicedRatio=clamp(window.length/expectedFrames,0,1);
    notes.push({target:n.pitch,midi:n.midi,startBeat:n.startBeat,duration:n.duration,medianCents:med,onsetErrorMs:errMs,pitchScore,timeScore,voicedRatio,ok:med!==null&&med<=35&&errMs<=220});
  }
  const avg=k=>notes.length?notes.reduce((a,n)=>a+n[k],0)/notes.length:0;
  const pitch=Math.round(avg('pitchScore'));
  const time=Math.round(avg('timeScore'));
  const flow=Math.round(clamp(avg('voicedRatio')*115));
  const overall=Math.round((pitch+time+flow)/3);
  let coaching='譜面から音を先に聴いて、そのまま流れに乗ろう。';
  if(overall>=94) coaching='Perfect Phrase。目と耳とタイムがひとつになっています。';
  else if(pitch<time-10) coaching='タイムは保てています。音程を先に内側で鳴らしてから入ろう。';
  else if(time<pitch-10) coaching='音は取れています。次は拍の前進を切らさない。';
  else if(flow<75) coaching='音を一つずつ当てにいかず、フレーズ全体を一息で運ぼう。';
  return {mode:'mic',pitch,time,flow,overall,notes,coaching,sampleCount:samples.length};
}

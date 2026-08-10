import {freqToMidi} from './pitchDetector.js';
import {centsFromMidi,foldMidiToTarget,targetAtTime} from './music/pitch.js';
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));

export function scoreAttempt(ex,samples,latencyMs=0){
  const spb=60/ex.bpm,latency=latencyMs/1000,notes=[];let totalPitched=0,maxRms=0;
  for(const s of samples)maxRms=Math.max(maxRms,s.rms||0);

  for(const n of ex.notes){
    if(n.rest)continue;
    const start=n.startBeat*spb+latency,end=(n.startBeat+n.duration)*spb+latency;
    const rawWindow=samples.filter(s=>s.t>=start-0.10&&s.t<=end+0.08);
    const window=rawWindow.filter(s=>s.hz&&s.rms>=0.003&&s.clarity>=0.30);
    totalPitched+=window.length;
    // Movable-do: octave is not graded. C3 and C4 are the same 'do'; interval class is preserved.
    const cents=window.map(s=>Math.abs(centsFromMidi(freqToMidi(s.hz),n.midi)));
    const med=median(cents),pitchScore=med==null?0:clamp(100-(Math.max(0,med-25)*1.18));
    const onset=window.length?window[0].t:null,errMs=onset==null?999:Math.abs((onset-start)*1000),timeScore=clamp(100-Math.max(0,errMs-85)*0.30);
    const voicedRatio=rawWindow.length?clamp(window.length/rawWindow.length,0,1):0;
    notes.push({target:n.pitch,midi:n.midi,startBeat:n.startBeat,duration:n.duration,medianCents:med,onsetErrorMs:errMs,pitchScore,timeScore,voicedRatio,ok:med!==null&&med<=40&&errMs<=240});
  }

  const avg=k=>notes.length?notes.reduce((a,n)=>a+n[k],0)/notes.length:0,pitch=Math.round(avg('pitchScore')),time=Math.round(avg('timeScore')),flow=Math.round(clamp(avg('voicedRatio')*108)),overall=Math.round((pitch+time+flow)/3);
  let coaching='譜面から音を先に聴いて、そのまま流れに乗ろう。';
  if(totalPitched===0&&maxRms<0.0045)coaching='歌声の軌跡を十分に拾えませんでした。設定のマイクテストで入力を確認できます。';
  else if(totalPitched===0)coaching='歌声は入っています。少し長めにはっきり母音で歌って、音程の軌跡を作ろう。';
  else if(overall>=94)coaching='Perfect Phrase。目と耳とタイムがひとつになっています。';
  else if(pitch<time-10)coaching='タイムは保てています。音程を先に内側で鳴らしてから入ろう。';
  else if(time<pitch-10)coaching='音は取れています。次は拍の前進を切らさない。';
  else if(flow<75)coaching='音を一つずつ当てにいかず、フレーズ全体を一息で運ぼう。';

  const trace=samples.filter(s=>s.hz&&s.rms>=0.003&&s.clarity>=0.25).map(s=>{
    const rawMidi=freqToMidi(s.hz),target=targetAtTime(ex,s.t-latency),midi=target?foldMidiToTarget(rawMidi,target.midi):rawMidi;
    return {t:Number(s.t.toFixed(3)),midi:Number(midi.toFixed(2)),rawMidi:Number(rawMidi.toFixed(2)),targetMidi:target?.midi??null};
  });
  return {mode:'mic',pitch,time,flow,overall,notes,coaching,sampleCount:samples.length,pitchedFrameCount:totalPitched,maxRms,trace,pitchMode:'movable-do-octave-folded'};
}

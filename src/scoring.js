import {freqToMidi} from './pitchDetector.js';
import {centsFromMidi,foldMidiToTarget,targetAtTime} from './music/pitch.js';
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y);const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;};
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));

function starsFor(readScore,noteAccuracy,totalPitched){
  if(!totalPitched)return 0;
  if(readScore>=92&&noteAccuracy>=90)return 5;
  if(readScore>=80&&noteAccuracy>=75)return 4;
  if(readScore>=65&&noteAccuracy>=55)return 3;
  if(readScore>=45)return 2;
  return 1;
}

export function scoreAttempt(ex,samples,latencyMs=0){
  const spb=60/ex.bpm,latency=latencyMs/1000,notes=[];let totalPitched=0,maxRms=0;
  for(const s of samples)maxRms=Math.max(maxRms,s.rms||0);

  for(const n of ex.notes){
    if(n.rest)continue;
    const start=n.startBeat*spb+latency,end=(n.startBeat+n.duration)*spb+latency;
    const rawWindow=samples.filter(s=>s.t>=start-.04&&s.t<=end+.04);
    const attack=Math.min(.14,Math.max(.05,n.duration*spb*.16)),release=Math.min(.09,Math.max(.03,n.duration*spb*.10));
    const steadyStart=start+attack,steadyEnd=Math.max(steadyStart+.04,end-release);
    const pitchWindow=samples.filter(s=>s.t>=steadyStart&&s.t<=steadyEnd&&s.hz&&s.rms>=.003&&s.clarity>=.30);
    const voicedWindow=rawWindow.filter(s=>s.hz&&s.rms>=.003&&s.clarity>=.30);
    totalPitched+=pitchWindow.length;

    const cents=pitchWindow.map(s=>Math.abs(centsFromMidi(freqToMidi(s.hz),n.midi)));
    const med=median(cents);
    const readOk=med!==null&&med<=70;
    const pitchScore=med==null?0:clamp(100-Math.max(0,med-20)*.95);

    const onsetCandidates=samples.filter(s=>s.t>=start-.05&&s.t<=Math.min(end,start+.38)&&s.hz&&s.rms>=.003&&s.clarity>=.25);
    const onset=onsetCandidates.length?onsetCandidates[0].t:null;
    const errMs=onset==null?999:Math.abs((onset-start)*1000);
    const timeOk=errMs<=300;
    const timeScore=clamp(100-Math.max(0,errMs-100)*.22);
    const voicedRatio=rawWindow.length?clamp(voicedWindow.length/rawWindow.length,0,1):0;

    notes.push({target:n.pitch,midi:n.midi,startBeat:n.startBeat,duration:n.duration,medianCents:med,onsetErrorMs:errMs,pitchScore,timeScore,voicedRatio,readOk,timeOk,ok:readOk&&timeOk});
  }

  const avg=k=>notes.length?notes.reduce((a,n)=>a+n[k],0)/notes.length:0;
  const pitch=Math.round(avg('pitchScore'));
  const time=Math.round(avg('timeScore'));
  const flow=Math.round(clamp(avg('voicedRatio')*108));
  const noteAccuracy=Math.round(notes.length?notes.filter(n=>n.readOk).length/notes.length*100:0);
  const timingCoarse=Math.round(notes.length?notes.filter(n=>n.timeOk).length/notes.length*100:0);
  const continuity=flow;
  const readScore=Math.round(noteAccuracy*.70+continuity*.20+timingCoarse*.10);
  const stars=starsFor(readScore,noteAccuracy,totalPitched);
  const overall=Math.round((pitch+time+flow)/3);

  let coaching='譜面を見て、止まらず1小節を運ぼう。';
  if(!totalPitched&&maxRms<.0045)coaching='歌声を十分に拾えませんでした。';
  else if(!totalPitched)coaching='歌声は入っています。母音を少し長めにしてもう一度。';
  else if(stars===5)coaching='初見で流れた。次へ。';
  else if(stars===4)coaching='読めている。そのまま次へ進んでOK。';
  else if(stars===3)coaching='ほぼ読めている。もう一度で定着させよう。';
  else if(noteAccuracy<55)coaching='音の取り違えがある。お手本で音型を確認して再挑戦。';
  else coaching='音は見えている。拍を止めずに1小節を運ぼう。';

  const trace=samples.filter(s=>s.hz&&s.rms>=.003&&s.clarity>=.25).map(s=>{
    const rawMidi=freqToMidi(s.hz),target=targetAtTime(ex,s.t-latency),midi=target?foldMidiToTarget(rawMidi,target.midi):rawMidi;
    return {t:Number(s.t.toFixed(3)),midi:Number(midi.toFixed(2)),rawMidi:Number(rawMidi.toFixed(2)),targetMidi:target?.midi??null};
  });

  return {mode:'mic',stars,readScore,noteAccuracy,timingCoarse,continuity,pitch,time,flow,overall,notes,coaching,sampleCount:samples.length,pitchedFrameCount:totalPitched,maxRms,trace,pitchMode:'movable-do-octave-folded'};
}

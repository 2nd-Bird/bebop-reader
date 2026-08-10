import {yin,noteNameFromHz} from './pitchDetector.js';
let ctx=null,stream=null,analyser=null,last={hz:null,note:'—',rms:0,clarity:0,status:'idle'};
export async function initMic(){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('このブラウザではマイク入力を利用できません');
  stream=stream||await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)(); await ctx.resume();
  const source=ctx.createMediaStreamSource(stream); analyser=ctx.createAnalyser(); analyser.fftSize=2048; analyser.smoothingTimeConstant=0;source.connect(analyser);last.status='ready';return true;
}
export async function capture(durationSec,exercise,onProgress){
  await initMic(); const buf=new Float32Array(analyser.fftSize); const samples=[]; const start=performance.now(); const spb=60/exercise.bpm;
  return await new Promise(resolve=>{
    let stopped=false;
    const tick=()=>{
      if(stopped)return; const t=(performance.now()-start)/1000; analyser.getFloatTimeDomainData(buf); const d=yin(buf,ctx.sampleRate);
      const active=exercise.notes.some(n=>!n.rest && t>=n.startBeat*spb-.10 && t<=(n.startBeat+n.duration)*spb+.08);
      if(active)samples.push({t,hz:d.hz,rms:d.rms,clarity:d.clarity});
      last={...d,note:noteNameFromHz(d.hz),status:'capturing'}; onProgress?.(Math.min(1,t/durationSec));
      if(t>=durationSec){stopped=true;last.status='ready';resolve(samples);} else requestAnimationFrame(tick);
    };requestAnimationFrame(tick);
  });
}
export function micStatus(){return {...last,contextState:ctx?.state||'none'};}
export function stopMic(){stream?.getTracks().forEach(t=>t.stop());stream=null;ctx?.close();ctx=null;analyser=null;last.status='idle';}

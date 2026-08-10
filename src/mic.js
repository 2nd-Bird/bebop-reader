import {yin,noteNameFromHz} from './pitchDetector.js';
let ctx=null,stream=null,source=null,analyser=null,silentGain=null,monitorBuf=null;
let last={hz:null,note:'—',rms:0,clarity:0,status:'idle',maxRms:0,frames:0,pitchedFrames:0,sampleRate:null};

function readFrame(){
  if(!analyser||!ctx)return {...last};
  monitorBuf ||= new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(monitorBuf);
  const d=yin(monitorBuf,ctx.sampleRate);
  last={...last,...d,note:noteNameFromHz(d.hz),sampleRate:ctx.sampleRate,frames:(last.frames||0)+1,pitchedFrames:(last.pitchedFrames||0)+(d.hz?1:0),maxRms:Math.max(last.maxRms||0,d.rms||0)};
  return {...last};
}

export async function initMic(){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('このブラウザではマイク入力を利用できません');
  if(!ctx||ctx.state==='closed')ctx=new (window.AudioContext||window.webkitAudioContext)();
  if(ctx.state!=='running'){try{await ctx.resume();}catch{}}
  if(!stream||!stream.active){
    try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});}
    catch{stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});}
  }
  if(!source||!analyser){
    source=ctx.createMediaStreamSource(stream);
    analyser=ctx.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=0;
    silentGain=ctx.createGain();silentGain.gain.value=0;
    source.connect(analyser);analyser.connect(silentGain);silentGain.connect(ctx.destination);
    monitorBuf=new Float32Array(analyser.fftSize);
  }
  if(ctx.state!=='running'){try{await ctx.resume();}catch{}}
  last={...last,status:ctx.state==='running'?'ready':'suspended',sampleRate:ctx.sampleRate};
  readFrame();
  return ctx.state==='running';
}

export async function capture(durationSec,exercise,onProgress){
  await initMic();
  const samples=[];const start=performance.now();const spb=60/exercise.bpm;let lastAnalysisAt=0;
  last={...last,status:'capturing',maxRms:0,frames:0,pitchedFrames:0};
  return await new Promise(resolve=>{
    let stopped=false;
    const tick=()=>{
      if(stopped)return;
      const now=performance.now(),t=(now-start)/1000;
      if(now-lastAnalysisAt>=28){
        lastAnalysisAt=now;const d=readFrame();
        const active=exercise.notes.some(n=>!n.rest&&t>=n.startBeat*spb-.12&&t<=(n.startBeat+n.duration)*spb+.12);
        if(active)samples.push({t,hz:d.hz,rms:d.rms,clarity:d.clarity});
      }
      onProgress?.(Math.min(1,t/durationSec));
      if(t>=durationSec){stopped=true;last.status='ready';resolve(samples);}else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export function micStatus(){
  if(analyser&&ctx&&ctx.state==='running'&&last.status!=='capturing')readFrame();
  return {...last,contextState:ctx?.state||'none',trackState:stream?.getAudioTracks?.()[0]?.readyState||'none'};
}
export function stopMic(){
  stream?.getTracks().forEach(t=>t.stop());stream=null;source=null;analyser=null;silentGain=null;monitorBuf=null;
  ctx?.close();ctx=null;
  last={hz:null,note:'—',rms:0,clarity:0,status:'idle',maxRms:0,frames:0,pitchedFrames:0,sampleRate:null};
}

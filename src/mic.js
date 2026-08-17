import {yin,noteNameFromHz} from './pitchDetector.js';
import {getAudioContext,prepareDuplexAudioSession,activateDuplexAudioSession,restorePlaybackAudioSession} from './audio/context.js';
let stream=null,source=null,analyser=null,silentGain=null,monitorBuf=null;
let sessionCapture=null;
let last={hz:null,note:'—',rms:0,clarity:0,status:'idle',maxRms:0,frames:0,pitchedFrames:0,sampleRate:null};

function readFrame(){
  const ctx=getAudioContext();
  if(!analyser)return {...last};
  monitorBuf ||= new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(monitorBuf);
  const d=yin(monitorBuf,ctx.sampleRate);
  last={...last,...d,note:noteNameFromHz(d.hz),sampleRate:ctx.sampleRate,frames:(last.frames||0)+1,pitchedFrames:(last.pitchedFrames||0)+(d.hz?1:0),maxRms:Math.max(last.maxRms||0,d.rms||0)};
  return {...last};
}

export async function initMic(){
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('このブラウザではマイク入力を利用できません');
  const ctx=getAudioContext();
  if(ctx.state!=='running'){try{await ctx.resume();}catch{}}
  if(!stream||!stream.active){
    prepareDuplexAudioSession();
    try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});}
    catch{stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false});}
    activateDuplexAudioSession();
    if(ctx.state!=='running'){try{await ctx.resume();}catch{}}
  } else {
    activateDuplexAudioSession();
  }
  if(!source||!analyser){
    source=ctx.createMediaStreamSource(stream);
    analyser=ctx.createAnalyser();analyser.fftSize=2048;analyser.smoothingTimeConstant=0;
    silentGain=ctx.createGain();silentGain.gain.value=0;
    source.connect(analyser);analyser.connect(silentGain);silentGain.connect(ctx.destination);
    monitorBuf=new Float32Array(analyser.fftSize);
  }
  // Reassert after the Web Audio input graph is attached; WebKit may recategorize the native
  // AVAudioSession as capture starts.
  activateDuplexAudioSession();
  if(ctx.state!=='running'){try{await ctx.resume();}catch{}}
  last={...last,status:ctx.state==='running'?'ready':'suspended',sampleRate:ctx.sampleRate};
  readFrame();
  return ctx.state==='running';
}

export async function capture(durationSec,exercise,onProgress){
  await initMic();
  const ctx=getAudioContext(),samples=[],start=ctx.currentTime;let lastAnalysisAt=start;
  last={...last,status:'capturing',maxRms:0,frames:0,pitchedFrames:0};
  return await new Promise(resolve=>{
    let stopped=false;
    const tick=()=>{
      if(stopped)return;
      const now=ctx.currentTime,t=now-start;
      if((now-lastAnalysisAt)*1000>=28){
        lastAnalysisAt=now;const d=readFrame();
        const spb=60/exercise.bpm;
        const active=exercise.notes.some(n=>!n.rest&&t>=n.startBeat*spb-.12&&t<=(n.startBeat+n.duration)*spb+.12);
        if(active)samples.push({t,hz:d.hz,rms:d.rms,clarity:d.clarity});
      }
      onProgress?.(Math.min(1,t/durationSec));
      if(t>=durationSec){stopped=true;last.status='ready';resolve(samples);}else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

export async function startSessionCapture({intervalMs=28}={}){
  await initMic();
  if(sessionCapture)stopSessionCapture();
  const ctx=getAudioContext(),samples=[];let raf=0,lastAnalysisAt=ctx.currentTime,active=true;
  last={...last,status:'capturing',maxRms:0,frames:0,pitchedFrames:0};
  const tick=()=>{
    if(!active)return;
    const now=ctx.currentTime;
    if((now-lastAnalysisAt)*1000>=intervalMs){
      lastAnalysisAt=now;const d=readFrame();samples.push({t:now,hz:d.hz,rms:d.rms,clarity:d.clarity});
    }
    raf=requestAnimationFrame(tick);
  };
  sessionCapture={samples,stop:()=>{active=false;cancelAnimationFrame(raf);last.status='ready';}};
  raf=requestAnimationFrame(tick);
  return true;
}

export function getSessionSamples(){return sessionCapture?[...sessionCapture.samples]:[];}
export function stopSessionCapture(){if(!sessionCapture)return[];sessionCapture.stop();const samples=[...sessionCapture.samples];sessionCapture=null;return samples;}

export function micStatus(){
  const ctx=getAudioContext();
  if(analyser&&ctx.state==='running'&&last.status!=='capturing')readFrame();
  return {...last,contextState:ctx.state,trackState:stream?.getAudioTracks?.()[0]?.readyState||'none'};
}
export function stopMic(){
  stopSessionCapture();
  stream?.getTracks().forEach(t=>t.stop());stream=null;
  try{source?.disconnect();analyser?.disconnect();silentGain?.disconnect();}catch{}
  source=null;analyser=null;silentGain=null;monitorBuf=null;
  restorePlaybackAudioSession();
  last={hz:null,note:'—',rms:0,clarity:0,status:'idle',maxRms:0,frames:0,pitchedFrames:0,sampleRate:getAudioContext().sampleRate};
}

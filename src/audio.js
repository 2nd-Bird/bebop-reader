let ctx=null,master=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NOTE_PC={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const previewCache=new Map();let previewAudio=null;
function noteToFreq(note){const m=String(note).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return 440;const midi=(Number(m[3])+1)*12+NOTE_PC[m[1]+m[2]];return 440*Math.pow(2,(midi-69)/12);}
function getCtx(){if(!ctx||ctx.state==='closed')ctx=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(!master){master=ctx.createGain();master.gain.value=.82;master.connect(ctx.destination);}return ctx;}
function ping(freq,start,duration,volume=.25,type='sine'){const c=getCtx(),osc=c.createOscillator(),g=c.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.008);g.gain.setValueAtTime(Math.max(.0002,volume),Math.max(start+.01,start+duration-.045));g.gain.exponentialRampToValueAtTime(.0001,start+duration);osc.connect(g);g.connect(master);osc.start(start);osc.stop(start+duration+.02);}
export function primeAudio(){const c=getCtx();try{if(c.state!=='running')c.resume();const t=c.currentTime+.001;ping(440,t,.018,.00035,'sine');}catch{}return c.state;}
export async function ensureAudio(){const c=getCtx();if(c.state!=='running')await c.resume();if(c.state!=='running')throw new Error('音声出力を開始できません。もう一度タップしてください');return c.state;}
function wavUrl(ex){
  if(previewCache.has(ex.id))return previewCache.get(ex.id);const sr=22050,spb=60/ex.bpm,total=ex.totalBeats*spb+.06,N=Math.ceil(total*sr),mix=new Float32Array(N);
  ex.notes.filter(n=>!n.rest).forEach(n=>{const f=noteToFreq(n.pitch),s0=Math.floor(n.startBeat*spb*sr),dur=Math.max(.1,n.duration*spb*.86),len=Math.floor(dur*sr);for(let j=0;j<len&&s0+j<N;j++){const t=j/sr,a=Math.min(1,t/.012),r=Math.min(1,(dur-t)/.045),env=Math.max(0,Math.min(a,r)),v=(Math.sin(2*Math.PI*f*t)+.18*Math.sin(4*Math.PI*f*t))*.34*env;mix[s0+j]+=v;}});
  const buf=new ArrayBuffer(44+N*2),v=new DataView(buf);const ws=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};ws(0,'RIFF');v.setUint32(4,36+N*2,true);ws(8,'WAVE');ws(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);ws(36,'data');v.setUint32(40,N*2,true);for(let i=0;i<N;i++)v.setInt16(44+i*2,Math.max(-1,Math.min(1,mix[i]))*32767,true);
  const url=URL.createObjectURL(new Blob([buf],{type:'audio/wav'}));previewCache.set(ex.id,url);return url;
}
export function demoPhrase(ex,onProgress){
  const total=ex.totalBeats*60/ex.bpm;if(previewAudio){try{previewAudio.pause();}catch{}}
  const a=new Audio(wavUrl(ex));previewAudio=a;a.preload='auto';a.playsInline=true;a.volume=1;
  let raf=0;return new Promise((resolve,reject)=>{const tick=()=>{onProgress?.(Math.min(1,(a.currentTime||0)/total));if(!a.ended)raf=requestAnimationFrame(tick);};a.onended=()=>{cancelAnimationFrame(raf);onProgress?.(1);resolve(total);};a.onerror=()=>{cancelAnimationFrame(raf);reject(new Error('お手本音声を再生できません'));};const p=a.play();if(p&&p.catch)p.catch(()=>reject(new Error('お手本をもう一度タップしてください')));raf=requestAnimationFrame(tick);});
}
export async function countIn(bpm,onBeat){await ensureAudio();const c=getCtx(),spb=60/bpm,base=c.currentTime+.04;for(let i=0;i<4;i++){const t=base+i*spb;ping(i===0?1174.66:880,t,.07,i===0?.36:.25,'square');setTimeout(()=>onBeat?.(i+1),Math.max(0,(t-c.currentTime)*1000));}await sleep(spb*4*1000+50);}
export function audioStatus(){return ctx?.state||'uninitialized';}

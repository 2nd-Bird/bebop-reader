let ctx=null, master=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NOTE_PC={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function noteToFreq(note){
  const m=String(note).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return 440;
  const midi=(Number(m[3])+1)*12+NOTE_PC[m[1]+m[2]];
  return 440*Math.pow(2,(midi-69)/12);
}
function getCtx(){
  if(!ctx||ctx.state==='closed')ctx=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});
  if(!master){master=ctx.createGain();master.gain.value=.82;master.connect(ctx.destination);}
  return ctx;
}
function ping(freq,start,duration,volume=.25,type='sine'){
  const c=getCtx(),osc=c.createOscillator(),g=c.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,start);
  g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.008);
  g.gain.setValueAtTime(Math.max(.0002,volume),Math.max(start+.01,start+duration-.045));g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(g);g.connect(master);osc.start(start);osc.stop(start+duration+.02);
}
function noteTone(note,start,duration){
  const f=noteToFreq(note);ping(f,start,duration,.34,'triangle');ping(f*2,start,duration,.07,'sine');
}

// Must be called directly from pointerdown/touchstart on iOS Safari.
export function primeAudio(){
  const c=getCtx();
  try{
    if(c.state!=='running')c.resume();
    const t=c.currentTime+.001;
    ping(440,t,.018,.00035,'sine');
  }catch{}
  return c.state;
}

export async function ensureAudio(){
  const c=getCtx();
  if(c.state!=='running')await c.resume();
  if(c.state!=='running')throw new Error('音声出力を開始できません。もう一度お手本をタップしてください');
  return c.state;
}

export async function demoPhrase(ex,onProgress){
  await ensureAudio();
  const c=getCtx(),spb=60/ex.bpm,total=ex.totalBeats*spb,startAt=c.currentTime+.045;
  ex.notes.filter(n=>!n.rest).forEach(n=>noteTone(n.pitch,startAt+n.startBeat*spb,Math.max(.12,n.duration*spb*.88)));
  const wall=performance.now()+45;
  await new Promise(resolve=>{
    const tick=()=>{const p=Math.min(1,(performance.now()-wall)/(total*1000));onProgress?.(Math.max(0,p));if(p>=1)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick);
  });
  return total;
}

export async function countIn(bpm,onBeat){
  await ensureAudio();const c=getCtx(),spb=60/bpm,base=c.currentTime+.04;
  for(let i=0;i<4;i++){
    const t=base+i*spb;ping(i===0?1174.66:880,t,.07,i===0?.36:.25,'square');
    setTimeout(()=>onBeat?.(i+1),Math.max(0,(t-c.currentTime)*1000));
  }
  await sleep(spb*4*1000+50);
}
export function audioStatus(){return ctx?.state||'uninitialized';}

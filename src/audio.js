let ctx=null, master=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const NOTE_PC={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function noteToFreq(note){
  const m=String(note).match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return 440;
  const midi=(Number(m[3])+1)*12+NOTE_PC[m[1]+m[2]];
  return 440*Math.pow(2,(midi-69)/12);
}
function makeMaster(){
  if(master)return;
  master=ctx.createGain();master.gain.value=.78;master.connect(ctx.destination);
}
function ping(freq,start,duration,volume=.25,type='sine'){
  const osc=ctx.createOscillator(),g=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,start);
  g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.012);
  g.gain.setValueAtTime(Math.max(.0002,volume),Math.max(start+.014,start+duration-.055));g.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(g);g.connect(master);osc.start(start);osc.stop(start+duration+.02);
}
function noteTone(note,start,duration){
  const f=noteToFreq(note);
  ping(f,start,duration,.28,'triangle');
  ping(f*2,start,duration,.055,'sine');
}
export async function ensureAudio(){
  if(!ctx||ctx.state==='closed')ctx=new (window.AudioContext||window.webkitAudioContext)();
  makeMaster();
  if(ctx.state!=='running')await ctx.resume();
  if(ctx.state!=='running')throw new Error('音声出力を開始できません。端末の音量を確認してもう一度タップしてください');
  // iOS Safari unlock: schedule an effectively silent frame immediately from the user gesture.
  ping(440,ctx.currentTime+.001,.015,.0002,'sine');
  return ctx.state;
}
export async function demoPhrase(ex,onProgress){
  await ensureAudio();
  const spb=60/ex.bpm,total=ex.totalBeats*spb,startAt=ctx.currentTime+.06;
  ex.notes.filter(n=>!n.rest).forEach(n=>noteTone(n.pitch,startAt+n.startBeat*spb,Math.max(.11,n.duration*spb*.88)));
  const wall=performance.now()+60;
  await new Promise(resolve=>{
    const tick=()=>{const p=Math.min(1,(performance.now()-wall)/(total*1000));onProgress?.(Math.max(0,p));if(p>=1)resolve();else requestAnimationFrame(tick)};requestAnimationFrame(tick);
  });
  return total;
}
export async function countIn(bpm,onBeat){
  await ensureAudio();const spb=60/bpm,base=ctx.currentTime+.045;
  for(let i=0;i<4;i++){
    const t=base+i*spb;ping(i===0?1174.66:880,t,.065,i===0?.32:.22,'square');
    setTimeout(()=>onBeat?.(i+1),Math.max(0,(t-ctx.currentTime)*1000));
  }
  await sleep(spb*4*1000+55);
}
export function audioStatus(){return ctx?.state||'uninitialized';}

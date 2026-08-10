let synth=null, click=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function ensureAudio(){
  if(!window.Tone)throw new Error('Tone.jsが読み込めません');
  await Tone.start();
  if(!synth)synth=new Tone.Synth({oscillator:{type:'triangle'},envelope:{attack:.01,decay:.08,sustain:.25,release:.25}}).toDestination();
  if(!click)click=new Tone.MembraneSynth({pitchDecay:.008,octaves:2,envelope:{attack:.001,decay:.05,sustain:0,release:.02}}).toDestination();
  return Tone.getContext().state;
}
export async function demoPhrase(ex){
  await ensureAudio(); const spb=60/ex.bpm; const now=Tone.now()+.05;
  ex.notes.filter(n=>!n.rest).forEach(n=>synth.triggerAttackRelease(n.pitch,Math.max(.05,n.duration*spb*.85),now+n.startBeat*spb,.55));
}
export async function countIn(bpm,onBeat){
  await ensureAudio(); const spb=60/bpm; const base=Tone.now()+.05;
  for(let i=0;i<4;i++){click.triggerAttackRelease(i===0?'C5':'G4','32n',base+i*spb,i===0?.85:.5);setTimeout(()=>onBeat?.(i+1),Math.max(0,(base+i*spb-Tone.now())*1000));}
  await sleep(spb*4*1000+70);
}
export function audioStatus(){return window.Tone?Tone.getContext().state:'unavailable';}

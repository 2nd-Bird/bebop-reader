let synth=null, click=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function ensureAudio(){
  if(!window.Tone)throw new Error('Tone.jsが読み込めません');
  await Tone.start();
  const state=Tone.getContext().state;
  if(state!=='running')throw new Error('音声エンジンを開始できません。もう一度タップしてください');
  if(!synth){
    synth=new Tone.PolySynth(Tone.Synth,{maxPolyphony:4,options:{
      oscillator:{type:'sine'},
      envelope:{attack:.008,decay:.06,sustain:.72,release:.12}
    }}).toDestination();
    synth.volume.value=-4;
  }
  if(!click){
    click=new Tone.MembraneSynth({pitchDecay:.008,octaves:2,envelope:{attack:.001,decay:.05,sustain:0,release:.02}}).toDestination();
    click.volume.value=-7;
  }
  return state;
}
export async function demoPhrase(ex){
  await ensureAudio();
  const spb=60/ex.bpm;
  const now=Tone.now()+.035;
  ex.notes.filter(n=>!n.rest).forEach(n=>synth.triggerAttackRelease(n.pitch,Math.max(.08,n.duration*spb*.88),now+n.startBeat*spb,.92));
  const total=ex.totalBeats*spb;
  await sleep((total+.08)*1000);
  return total;
}
export async function countIn(bpm,onBeat){
  await ensureAudio(); const spb=60/bpm; const base=Tone.now()+.04;
  for(let i=0;i<4;i++){
    click.triggerAttackRelease(i===0?'C5':'G4','32n',base+i*spb,i===0?.85:.55);
    setTimeout(()=>onBeat?.(i+1),Math.max(0,(base+i*spb-Tone.now())*1000));
  }
  await sleep(spb*4*1000+55);
}
export function audioStatus(){return window.Tone?Tone.getContext().state:'unavailable';}

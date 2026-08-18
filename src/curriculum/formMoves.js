const SHARP_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FLAT_NAMES=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const DOMINANT_PC={C7:0,D7:2,E7:4,F7:5,G7:7,A7:9,B7:11,'Bb7':10,'Eb7':3};
const BASE_DOMINANT_PC=7; // G7: verified Stage 10 Relative Major shape is F–A–C.

const mod=(n,m)=>((n%m)+m)%m;
const signedShift=(from,to)=>{let d=mod(to-from,12);if(d>6)d-=12;return d;};
const namesForChord=chord=>String(chord).includes('b')?FLAT_NAMES:SHARP_NAMES;

export function semitoneShiftForDominant(chord){
  const pc=DOMINANT_PC[String(chord)];
  if(pc==null)throw new Error(`unsupported dominant MOVE ${chord}`);
  return signedShift(BASE_DOMINANT_PC,pc);
}

export function transposeNote(note,semitones,{preferFlats=false}={}){
  if(note?.rest)return {...note};
  const midi=Number(note?.midi)+Number(semitones||0);
  if(!Number.isFinite(midi))throw new Error('MOVE note requires midi');
  const names=preferFlats?FLAT_NAMES:SHARP_NAMES,pc=mod(midi,12),octave=Math.floor(midi/12)-1;
  return {...note,midi,pitch:`${names[pc]}${octave}`};
}

export function applyFormMove(notes,{movePolicy='NONE',harmonyContext=null}={}){
  if(!movePolicy||movePolicy==='NONE')return (notes||[]).map(n=>({...n}));
  if(movePolicy!=='RELATIVE_MAJOR_OF_DOMINANT')throw new Error(`unknown form MOVE ${movePolicy}`);
  const chord=String(harmonyContext||''),shift=semitoneShiftForDominant(chord),preferFlats=chord.includes('b');
  return (notes||[]).map(n=>transposeNote(n,shift,{preferFlats}));
}

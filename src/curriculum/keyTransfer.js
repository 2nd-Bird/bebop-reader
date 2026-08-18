const PC={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
const FLAT_NAMES=['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const SHARP_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export const KEY_TRANSFER_POLICY=[
  {key:'C',semitoneFromC:0,status:'ACTIVE',pilotMaxStage:14},
  {key:'F',semitoneFromC:5,status:'DEBUG_PILOT',pilotMaxStage:3},
  {key:'Bb',semitoneFromC:10,status:'PLANNED',pilotMaxStage:null},
];

export const keyTransferPolicy=key=>KEY_TRANSFER_POLICY.find(x=>x.key===key)||null;

export function keyTransferSupported(key,stage){
  const policy=keyTransferPolicy(key);if(!policy)return false;
  if(key==='C')return true;
  if(policy.status!=='DEBUG_PILOT')return false;
  return Number.isFinite(stage)&&stage>=0&&stage<=policy.pilotMaxStage;
}

const shiftForKey=key=>{
  const policy=keyTransferPolicy(key);if(!policy)throw new Error(`unknown key ${key}`);return policy.semitoneFromC;
};
const preferFlats=key=>key==='F'||key==='Bb';
const spellPc=(pc,key)=>(preferFlats(key)?FLAT_NAMES:SHARP_NAMES)[((pc%12)+12)%12];

export function pitchNameFromMidi(midi,key='C'){
  if(!Number.isFinite(midi))return null;
  const rounded=Math.round(midi),pc=((rounded%12)+12)%12,octave=Math.floor(rounded/12)-1;
  return `${spellPc(pc,key)}${octave}`;
}

export function transposeNotesFromC(notes,key='C'){
  if(key==='C')return (notes||[]).map(n=>({...n}));
  const shift=shiftForKey(key);
  return (notes||[]).map(note=>{
    if(note?.rest||!Number.isFinite(note?.midi))return {...note};
    const midi=note.midi+shift;
    return {...note,midi,pitch:pitchNameFromMidi(midi,key)};
  });
}

function transposeRoot(root,key){
  const pc=PC[root];if(!Number.isFinite(pc))throw new Error(`unsupported chord root ${root}`);
  return spellPc(pc+shiftForKey(key),key);
}

export function transposeChordFromC(chord,key='C'){
  const raw=String(chord||'').trim();if(!raw||key==='C')return raw;
  const slashIndex=raw.lastIndexOf('/'),head=slashIndex>=0?raw.slice(0,slashIndex):raw,bass=slashIndex>=0?raw.slice(slashIndex+1):null;
  const m=head.match(/^([A-G](?:#|b)?)(.*)$/);if(!m)return raw;
  let out=`${transposeRoot(m[1],key)}${m[2]}`;
  if(bass&&/^[A-G](?:#|b)?$/.test(bass))out+=`/${transposeRoot(bass,key)}`;
  else if(bass)out+=`/${bass}`;
  return out;
}

export function transposeHarmonyTimelineFromC(timeline,key='C'){
  return (timeline||[]).map(point=>({...point,chord:transposeChordFromC(point.chord,key)}));
}

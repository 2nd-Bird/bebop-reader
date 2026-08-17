export const HARMONY_FIELDS=[
  {harmonyFieldId:'static-c',title:'C',spanBeats:null,timeline:[{beat:0,chord:'C'}]},
  {harmonyFieldId:'static-c6',title:'C6',spanBeats:null,timeline:[{beat:0,chord:'C6'}]},
  {harmonyFieldId:'static-am7',title:'Am7',spanBeats:null,timeline:[{beat:0,chord:'Am7'}]},
  {harmonyFieldId:'static-dm7',title:'Dm7',spanBeats:null,timeline:[{beat:0,chord:'Dm7'}]},
  {harmonyFieldId:'static-f',title:'F',spanBeats:null,timeline:[{beat:0,chord:'F'}]},
  {harmonyFieldId:'static-fm',title:'Fm',spanBeats:null,timeline:[{beat:0,chord:'Fm'}]},
  {harmonyFieldId:'static-g7',title:'G7',spanBeats:null,timeline:[{beat:0,chord:'G7'}]},
  {harmonyFieldId:'static-g7-relative-minor',title:'G7',role:'relative-minor',spanBeats:null,timeline:[{beat:0,chord:'G7'}]},
  {harmonyFieldId:'static-cm',title:'Cm',spanBeats:null,timeline:[{beat:0,chord:'Cm'}]},
  {harmonyFieldId:'ii-v-i-c-2bar',title:'ii–V–I in C',spanBeats:8,timeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7'},{beat:4,chord:'Cmaj7'}]},
  {harmonyFieldId:'c-sixth-chain-2cell',title:'C descending pair field',spanBeats:4,timeline:[{beat:0,chord:'Cmaj7'},{beat:2,chord:'Am7'}]},
  {harmonyFieldId:'c-sixth-chain-4cell',title:'C descending chain field',spanBeats:8,timeline:[{beat:0,chord:'Cmaj7'},{beat:2,chord:'Am7'},{beat:4,chord:'FMaj7'},{beat:6,chord:'Dm7'}]},
  {harmonyFieldId:'c-line-cells-2',title:'C line cell field · 2',spanBeats:4,timeline:[{beat:0,chord:'G7'},{beat:2,chord:'Em7'}]},
  {harmonyFieldId:'c-line-cells-3',title:'C line cell field · 3',spanBeats:8,timeline:[{beat:0,chord:'G7'},{beat:2,chord:'Em7'},{beat:4,chord:'Cmaj7'}]},
  {harmonyFieldId:'c-long-line-2bar',title:'C long line · 2 bars',spanBeats:8,timeline:[{beat:0,chord:'Cmaj7'},{beat:4,chord:'Am7'}]},
  {harmonyFieldId:'c-long-line-4bar',title:'C long line · 4 bars',spanBeats:16,timeline:[{beat:0,chord:'Cmaj7'},{beat:4,chord:'Am7'},{beat:8,chord:'FMaj7'},{beat:12,chord:'Dm7'}]},
  {harmonyFieldId:'c-minor-harmonic-2bar',title:'C minor field · 2 bars',spanBeats:8,timeline:[{beat:0,chord:'Dm7b5'},{beat:2,chord:'G7'},{beat:4,chord:'Cm'}]},
  {harmonyFieldId:'c-minor-harmonic-4bar',title:'C minor field · 4 bars',spanBeats:16,timeline:[{beat:0,chord:'Dm7b5'},{beat:2,chord:'G7'},{beat:4,chord:'Cm'},{beat:8,chord:'Dm7b5'},{beat:10,chord:'G7'},{beat:12,chord:'Cm'}]},
];
export const harmonyFieldById=id=>HARMONY_FIELDS.find(x=>x.harmonyFieldId===id)||null;
const chordSignature=timeline=>timeline.map(x=>x.chord).join('|');
export function defaultHarmonyFieldFor(allowedHarmony=['C'],{scoreBeats=null}={}){
  const signature=(allowedHarmony||[]).join('|'),matches=HARMONY_FIELDS.filter(field=>chordSignature(field.timeline)===signature);
  if(!matches.length)return null;
  if(Number.isFinite(scoreBeats))return matches.find(field=>field.spanBeats===scoreBeats)||matches.find(field=>field.spanBeats==null)||matches[0];
  return matches[0];
}

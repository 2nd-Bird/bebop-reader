export const HARMONY_FIELDS=[
  {harmonyFieldId:'static-c',title:'C',timeline:[{beat:0,chord:'C'}]},
  {harmonyFieldId:'static-c6',title:'C6',timeline:[{beat:0,chord:'C6'}]},
  {harmonyFieldId:'static-am7',title:'Am7',timeline:[{beat:0,chord:'Am7'}]},
  {harmonyFieldId:'static-dm7',title:'Dm7',timeline:[{beat:0,chord:'Dm7'}]},
  {harmonyFieldId:'ii-v-i-c-2bar',title:'ii–V–I in C',timeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7'},{beat:4,chord:'Cmaj7'}]},
  {harmonyFieldId:'c-sixth-chain-2cell',title:'C descending pair field',timeline:[{beat:0,chord:'Cmaj7'},{beat:2,chord:'Am7'}]},
  {harmonyFieldId:'c-sixth-chain-4cell',title:'C descending chain field',timeline:[{beat:0,chord:'Cmaj7'},{beat:2,chord:'Am7'},{beat:4,chord:'FMaj7'},{beat:6,chord:'Dm7'}]},
  {harmonyFieldId:'c-line-cells-2',title:'C line cell field · 2',timeline:[{beat:0,chord:'G7'},{beat:2,chord:'Em7'}]},
  {harmonyFieldId:'c-line-cells-3',title:'C line cell field · 3',timeline:[{beat:0,chord:'G7'},{beat:2,chord:'Em7'},{beat:4,chord:'Cmaj7'}]},
];
export const harmonyFieldById=id=>HARMONY_FIELDS.find(x=>x.harmonyFieldId===id)||null;
const chordSignature=timeline=>timeline.map(x=>x.chord).join('|');
export function defaultHarmonyFieldFor(allowedHarmony=['C']){
  const signature=(allowedHarmony||[]).join('|');
  return HARMONY_FIELDS.find(field=>chordSignature(field.timeline)===signature)||null;
}

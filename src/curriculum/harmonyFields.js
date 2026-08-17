export const HARMONY_FIELDS=[
  {harmonyFieldId:'static-c',title:'C',timeline:[{beat:0,chord:'C'}]},
  {harmonyFieldId:'static-c6',title:'C6',timeline:[{beat:0,chord:'C6'}]},
  {harmonyFieldId:'static-am7',title:'Am7',timeline:[{beat:0,chord:'Am7'}]},
  {harmonyFieldId:'static-dm7',title:'Dm7',timeline:[{beat:0,chord:'Dm7'}]},
  {harmonyFieldId:'ii-v-i-c-2bar',title:'ii–V–I in C',timeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7'},{beat:4,chord:'Cmaj7'}]},
];
export const harmonyFieldById=id=>HARMONY_FIELDS.find(x=>x.harmonyFieldId===id)||null;

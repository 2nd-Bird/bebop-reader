export const MUSICAL_FORMS=[
  {
    formId:'c-blues-12',
    title:'C Blues',
    bars:12,
    beatsPerBar:4,
    lengthBeats:48,
    stage:14,
    status:'ACTIVE',
    integrationFamilyIds:['g-to-f-surfaces','density-g-to-f'],
    eventSingOffsets:[8,4,12],
    timeline:[
      {beat:0,chord:'C7'},
      {beat:16,chord:'F7'},
      {beat:24,chord:'C7'},
      {beat:32,chord:'G7'},
      {beat:36,chord:'F7'},
      {beat:40,chord:'C7'},
      {beat:44,chord:'G7'},
    ],
    source:{type:'curriculum',reference:'Curriculum Spec v1 Stage 14',adaptation:'Simple C 12-bar Blues field for moving already-known Phrase Families through I / IV / V. It is a product training form, not a Hamase transcription.'}
  },
  {
    formId:'rhythm-changes-32',
    title:'Rhythm Changes',
    bars:32,
    beatsPerBar:4,
    lengthBeats:128,
    stage:14,
    status:'DEFINED',
    integrationFamilyIds:['relative-major-reinterpret','relative-minor-line','density-g-to-f'],
    timeline:[
      {beat:0,chord:'C6'},{beat:4,chord:'A7'},{beat:8,chord:'Dm7'},{beat:12,chord:'G7'},
      {beat:16,chord:'C6'},{beat:20,chord:'A7'},{beat:24,chord:'Dm7'},{beat:28,chord:'G7'},
      {beat:32,chord:'C6'},{beat:36,chord:'A7'},{beat:40,chord:'Dm7'},{beat:44,chord:'G7'},
      {beat:48,chord:'C6'},{beat:52,chord:'A7'},{beat:56,chord:'Dm7'},{beat:60,chord:'G7'},
      {beat:64,chord:'E7'},{beat:72,chord:'A7'},{beat:80,chord:'D7'},{beat:88,chord:'G7'},
      {beat:96,chord:'C6'},{beat:100,chord:'A7'},{beat:104,chord:'Dm7'},{beat:108,chord:'G7'},
      {beat:112,chord:'C6'},{beat:116,chord:'A7'},{beat:120,chord:'Dm7'},{beat:124,chord:'G7'},
    ],
    source:{type:'curriculum',reference:'Curriculum Spec v1 Stage 14',adaptation:'Simplified C Rhythm Changes training field. The bridge is the dominant chain E7 → A7 → D7 → G7; phrase transposition/functional MOVE is required before this form becomes ACTIVE.'}
  },
];

export const musicalFormById=id=>MUSICAL_FORMS.find(f=>f.formId===id)||null;

export function chordAtFormBeat(form,beat){
  if(!form)return null;
  const local=((Number(beat)%form.lengthBeats)+form.lengthBeats)%form.lengthBeats;
  let chord=form.timeline[0]?.chord||'C';
  for(const point of form.timeline){if(point.beat>local+1e-9)break;chord=point.chord;}
  return chord;
}

export function expandFormHarmony(form,totalBeats){
  if(!form||!Number.isFinite(totalBeats)||totalBeats<=0)return[];
  const out=[];
  for(let cycle=0;cycle*form.lengthBeats<totalBeats;cycle++){
    const base=cycle*form.lengthBeats;
    for(const point of form.timeline){const beat=base+point.beat;if(beat<totalBeats)out.push({beat,chord:point.chord});}
  }
  return out;
}

export function sliceFormHarmony(form,absoluteBeat,spanBeats){
  if(!form||!Number.isFinite(spanBeats)||spanBeats<=0)return[];
  const start=Number(absoluteBeat)||0,end=start+spanBeats,out=[{beat:0,chord:chordAtFormBeat(form,start)}];
  const firstCycle=Math.floor(start/form.lengthBeats)-1,lastCycle=Math.ceil(end/form.lengthBeats)+1;
  for(let cycle=firstCycle;cycle<=lastCycle;cycle++){
    const base=cycle*form.lengthBeats;
    for(const point of form.timeline){
      const abs=base+point.beat;
      if(abs<=start+1e-9||abs>=end-1e-9)continue;
      const beat=abs-start;
      if(out.at(-1)?.chord!==point.chord)out.push({beat,chord:point.chord});
    }
  }
  return out.sort((a,b)=>a.beat-b.beat);
}

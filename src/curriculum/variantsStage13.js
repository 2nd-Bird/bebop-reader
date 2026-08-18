const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const LEARN=['BUILD','COLD_READ','DELAYED_READ'];
const SOURCE_267={
  type:'hamase',hamaseRef:'ex.267',sourcePage:232,sourceWork:'Ballade',
  operatorSource:{role:'DENSITY_EXPANSION',sourceHarmony:'Gm7b5 (= Bbm6) 1→7 within Eb7(#11,13)',analysis:'g→f is expanded by arpeggiation, passing-tone scalarization and chromaticization'},
  pedagogicalApplication:'Apply the density-expansion operator to the familiar C-key/G7 structural G→F cell; source harmony and Parker surface are not copied.'
};
const SOURCE_268={
  type:'hamase',hamaseRef:'ex.268',sourcePage:233,sourceWork:'Ballade',
  operatorSource:{role:'CELL_RESTART_EXTENSION',sourceHarmony:'G7(#11,13) Relative Major FMaj7(#11)',analysis:'exit material is reinterpreted as a double-appoggiatura entry and the same generating unit restarts'},
  pedagogicalApplication:'Apply the restart-extension operator to the familiar C-key/G7 structural G→F cell; pitches and source harmony are pedagogically adapted rather than copied.'
};
const V=(variantId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],allowedPresentation=['COLD_READ'],densityLevel=null,surfaceType='CELL',source=SOURCE_267,structuralTargetIndices=[],entryRole='structural-target',exitRole='structural-target',continuationRole=null,operationType='DENSITY_EXPANSION',restartEntryIndices=[]}={})=>{
  const sounding=notes.filter(n=>!n.rest),spanBeats=Math.max(4,...notes.map(n=>n.startBeat+n.duration));
  return {
    variantId,familyId:'density-g-to-f',phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,
    allowedKeys:['C'],allowedHarmony:['G7'],allowedPresentation,coldReadEligible:true,source,densityLevel,surfaceType,
    structuralTargetIndices,entryRole,exitRole,continuationRole,operationType,restartEntryIndices,
    notesPerFourBeats:sounding.length*4/spanBeats
  };
};

const chromaticSurface=['G4','A4','Bb4','A4','G4','F#4','G4','F4'];
const compressedSurface=['G4','A4','Bb4','B4','C5','B4','Bb4','A4','G4','F#4','G4','A4','G4','F#4','G4','F4'];
const restartSurface=['G4','A4','Bb4','A4','G4','F4','A4','F#4','G4','A4','Bb4','A4','G4','F#4','G4','F4'];
const MIDI={G4:67,A4:69,Bb4:70,B4:71,'F#4':66,F4:65,D5:74,C5:72};
const sixteenths=compressedSurface.map((pitch,i)=>N(pitch,MIDI[pitch],i*.25,.25));
const restartEighths=restartSurface.map((pitch,i)=>N(pitch,MIDI[pitch],i*.5,.5));

export const STAGE13_VARIANTS=[
  V('density-gf-seed','SEED',[N('G4',67,0,2),N('F4',65,2,2)],{allowedPresentation:['TEACHER_CALL','BUILD','COLD_READ','DELAYED_READ'],densityLevel:0,surfaceType:'CELL',structuralTargetIndices:[0,1]}),
  V('density-gf-arpeggio','DENSIFY',[N('G4',67,0,1),N('B4',71,1,1),N('D5',74,2,1),N('F4',65,3,1)],{parentVariant:'density-gf-seed',morphType:'DENSIFY',morphTargets:[0,1,2,3],allowedPresentation:LEARN,densityLevel:1,surfaceType:'ARPEGGIATE',structuralTargetIndices:[0,3]}),
  V('density-gf-scalar','DENSIFY',[N('G4',67,0,.5),N('A4',69,.5,.5),N('B4',71,1,.5),N('A4',69,1.5,.5),N('G4',67,2,1),N('F4',65,3,1)],{parentVariant:'density-gf-arpeggio',morphType:'DENSIFY',morphTargets:[0,1,2,3,4,5],allowedPresentation:LEARN,densityLevel:2,surfaceType:'SCALARIZE',structuralTargetIndices:[0,5]}),
  V('density-gf-chromatic','DENSIFY',chromaticSurface.map((pitch,i)=>N(pitch,MIDI[pitch],i*.5,.5)),{parentVariant:'density-gf-scalar',morphType:'DENSIFY',morphTargets:[0,1,2,3,4,5,6,7],allowedPresentation:LEARN,densityLevel:3,surfaceType:'CHROMATICIZE',structuralTargetIndices:[0,7]}),
  V('density-gf-double','DENSIFY',sixteenths,{parentVariant:'density-gf-chromatic',morphType:'DENSIFY',morphTargets:Array.from({length:16},(_,i)=>i),allowedPresentation:LEARN,densityLevel:4,surfaceType:'RHYTHMIC_COMPRESSION',structuralTargetIndices:[0,15]}),
  V('density-gf-restart','EXTEND',restartEighths,{
    parentVariant:'density-gf-chromatic',morphType:'EXTEND',morphTargets:Array.from({length:16},(_,i)=>i),allowedPresentation:LEARN,
    densityLevel:null,surfaceType:'CELL_RESTART',source:SOURCE_268,operationType:'CELL_RESTART_EXTENSION',
    structuralTargetIndices:[0,5,8,15],restartEntryIndices:[6,7],entryRole:'structural-target',exitRole:'structural-target',
    continuationRole:'after the first structural F, A–F# is reinterpreted as a double-appoggiatura entry into the restarted structural G→F cell'
  }),
];
export const stage13VariantById=id=>STAGE13_VARIANTS.find(v=>v.variantId===id)||null;

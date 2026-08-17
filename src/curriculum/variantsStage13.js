const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const LEARN=['BUILD','COLD_READ','DELAYED_READ'];
const SOURCE={type:'hamase',hamaseRef:'ex.267',hamaseRefs:['ex.267','ex.268'],sourcePage:232,sourcePages:[232,233],sourceWork:'Ballade',analysisRef:'G→F cell density expansion plus repeated/restarted cell extension in double time',adaptation:'C-key/G7 pedagogical density ladder using verified operators only; no Parker phrase is copied.'};
const V=(variantId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],allowedPresentation=['COLD_READ'],densityLevel=0,surfaceType='CELL'}={})=>({
  variantId,familyId:'density-g-to-f',phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,
  allowedKeys:['C'],allowedHarmony:['G7'],allowedPresentation,coldReadEligible:true,source:SOURCE,densityLevel,surfaceType,notesPerFourBeats:notes.filter(n=>!n.rest).length
});

const chromaticSurface=['G4','A4','Bb4','A4','G4','F#4','G4','F4'];
const MIDI={G4:67,A4:69,Bb4:70,B4:71,'F#4':66,F4:65,D5:74,F5:77};
const sixteenths=chromaticSurface.concat(chromaticSurface).map((pitch,i)=>N(pitch,MIDI[pitch],i*.25,.25));

export const STAGE13_VARIANTS=[
  V('density-gf-seed','SEED',[N('G4',67,0,2),N('F4',65,2,2)],{allowedPresentation:['TEACHER_CALL','BUILD','COLD_READ','DELAYED_READ'],densityLevel:0,surfaceType:'CELL'}),
  V('density-gf-arpeggio','DENSIFY',[N('G4',67,0,1),N('B4',71,1,1),N('D5',74,2,1),N('F5',77,3,1)],{parentVariant:'density-gf-seed',morphType:'DENSIFY',morphTargets:[0,1,2,3],allowedPresentation:LEARN,densityLevel:1,surfaceType:'ARPEGGIATE'}),
  V('density-gf-scalar','DENSIFY',[N('G4',67,0,.5),N('A4',69,.5,.5),N('B4',71,1,.5),N('A4',69,1.5,.5),N('G4',67,2,1),N('F4',65,3,1)],{parentVariant:'density-gf-arpeggio',morphType:'DENSIFY',morphTargets:[0,1,2,3,4,5],allowedPresentation:LEARN,densityLevel:2,surfaceType:'SCALARIZE'}),
  V('density-gf-chromatic','DENSIFY',chromaticSurface.map((pitch,i)=>N(pitch,MIDI[pitch],i*.5,.5)),{parentVariant:'density-gf-scalar',morphType:'DENSIFY',morphTargets:[0,1,2,3,4,5,6,7],allowedPresentation:LEARN,densityLevel:3,surfaceType:'CHROMATICIZE'}),
  V('density-gf-double','DENSIFY',sixteenths,{parentVariant:'density-gf-chromatic',morphType:'DENSIFY',morphTargets:Array.from({length:16},(_,i)=>i),allowedPresentation:LEARN,densityLevel:4,surfaceType:'RHYTHMIC_COMPRESSION'}),
];
export const stage13VariantById=id=>STAGE13_VARIANTS.find(v=>v.variantId===id)||null;

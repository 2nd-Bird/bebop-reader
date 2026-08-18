const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const V=(variantId,familyId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],allowedPresentation=['COLD_READ'],coldReadEligible=true,allowedHarmony=['Cm'],source=null}={})=>({variantId,familyId,phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,allowedKeys:['C'],allowedHarmony,allowedPresentation,coldReadEligible,source});
const TEACH=['TEACHER_CALL','BUILD','COLD_READ','DELAYED_READ'];
const LEARN=['BUILD','COLD_READ','DELAYED_READ'];
const MELODIC_SOURCE={type:'hamase',hamaseRef:'ex.241',sourcePage:198,sourceWork:'How Deep is the Ocean [take 1]',analysisRef:'G–B–D–F–A third-stack skeleton is filled to G–A–B–C–D–Eb–F–G–A in C Tonic Minor',adaptation:'Register/rhythm-normalized reduction of the verified generator; scale naming remains internal.'};
const HARMONIC_SOURCE={type:'hamase',hamaseRef:'ex.245',sourcePages:[200,201],sourceWork:'Bebop',analysisRef:'one F harmonic-minor field persists across bars 84–90 while baseline chords and internal changes can diverge',adaptation:'Transposed/reduced to a singable C-minor field; the 4-bar continuation is pedagogically recomposed inside the verified collection.'};

export const STAGE12_VARIANTS=[
  V('tm-melodic-skeleton','tonic-minor-melodic-field','SEED',[
    N('G3',55,0,1),N('B3',59,1,1),N('D4',62,2,2),N('F4',65,4,2),N('A4',69,6,2)
  ],{allowedPresentation:TEACH,allowedHarmony:['Cm'],source:MELODIC_SOURCE}),
  V('tm-melodic-filled','tonic-minor-melodic-field','GROW',[
    N('G3',55,0,.5),N('A3',57,.5,.5),N('B3',59,1,.5),N('C4',60,1.5,.5),N('D4',62,2,.5),N('Eb4',63,2.5,.5),N('F4',65,3,.5),N('G4',67,3.5,.5),N('A4',69,4,4)
  ],{parentVariant:'tm-melodic-skeleton',morphType:'INSERT',morphTargets:[1,3,5,7],allowedPresentation:LEARN,allowedHarmony:['Cm'],source:MELODIC_SOURCE}),
  V('tm-harmonic-2bar','tonic-minor-harmonic-field','SEED',[
    N('F4',65,0,1),N('Eb4',63,1,1),N('D4',62,2,1),N('C4',60,3,1),N('B3',59,4,1),N('Ab3',56,5,1),N('G3',55,6,2)
  ],{allowedPresentation:TEACH,allowedHarmony:['Dm7b5','G7','Cm'],source:HARMONIC_SOURCE}),
  V('tm-harmonic-4bar','tonic-minor-harmonic-field','GROW',[
    N('F4',65,0,1),N('Eb4',63,1,1),N('D4',62,2,1),N('C4',60,3,1),N('B3',59,4,1),N('Ab3',56,5,1),N('G3',55,6,2),
    N('G3',55,8,1),N('Ab3',56,9,1),N('B3',59,10,1),N('C4',60,11,1),N('D4',62,12,1),N('C4',60,13,1),N('B3',59,14,1),N('C4',60,15,1)
  ],{parentVariant:'tm-harmonic-2bar',morphType:'EXTEND',morphTargets:[7,8,9,10,11,12,13,14],allowedPresentation:LEARN,allowedHarmony:['Dm7b5','G7','Cm'],source:HARMONIC_SOURCE}),
];
export const stage12VariantById=id=>STAGE12_VARIANTS.find(v=>v.variantId===id)||null;

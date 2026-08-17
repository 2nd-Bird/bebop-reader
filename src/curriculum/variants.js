const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const R=(startBeat,duration)=>({pitch:null,midi:null,startBeat,duration,rest:true});
const V=(variantId,familyId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],harmonyTimeline=null,allowedPresentation=['COLD_READ'],coldReadEligible=true,allowedHarmony=['C'],source=null}={})=>({variantId,familyId,phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,harmonyTimeline,allowedKeys:['C'],allowedHarmony,allowedPresentation,coldReadEligible,source});
const TEACH=['TEACHER_CALL','BUILD','COLD_READ','DELAYED_READ'];
const LEARN=['BUILD','COLD_READ','DELAYED_READ'];
const STAGE4_SOURCE={type:'curriculum',hamaseRef:null,analysisRef:'C / C6 / Am7 / Dm7を共有shape familyとして経験',curriculumRef:'教材の方針 rev.3 Stage 4'};
const STAGE5_SOURCE={type:'curriculum',hamaseRef:null,analysisRef:'voice-leadingを中心にbarlineを跨いだphraseへ進む',curriculumRef:'教材の方針 rev.3 Stage 5'};
export const VARIANTS=[
  V('anchor-cg-01','anchor-do-sol','SEED',[N('C4',60,0,1),N('G4',67,1,1),N('C4',60,2,1),N('G4',67,3,1)],{allowedPresentation:TEACH}),
  V('anchor-gc-01','anchor-do-sol','CHANGE',[N('G4',67,0,1),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'anchor-cg-01',morphType:'CHANGE',morphTargets:[0,1,2,3],allowedPresentation:LEARN}),
  V('anchor-ccgg-01','anchor-do-sol','CHANGE',[N('C4',60,0,1),N('C4',60,1,1),N('G4',67,2,1),N('G4',67,3,1)],{parentVariant:'anchor-cg-01',morphType:'CHANGE',morphTargets:[1,3],allowedPresentation:LEARN}),
  V('do-sol-q-01','do-sol-in-time','SEED',[N('C4',60,0,1),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{allowedPresentation:TEACH}),
  V('do-sol-rest-01','do-sol-in-time','CHANGE',[N('C4',60,0,1),R(1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'CHANGE',morphTargets:[1],allowedPresentation:LEARN}),
  V('do-sol-eighth-01','do-sol-in-time','EXTEND',[N('C4',60,0,.5),N('G4',67,.5,.5),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'EXTEND',morphTargets:[0,1],allowedPresentation:LEARN}),
  V('tonic-shape-01','tonic-shape','SEED',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('E4',64,3,1)],{allowedPresentation:TEACH}),
  V('tonic-shape-02','tonic-shape','CHANGE',[N('G4',67,0,1),N('E4',64,1,1),N('C4',60,2,1),N('E4',64,3,1)],{parentVariant:'tonic-shape-01',morphType:'CHANGE',morphTargets:[0,2],allowedPresentation:LEARN}),
  V('desc-mi-seed','descend-to-mi','SEED',[N('G4',67,0,2),N('E4',64,2,2)],{allowedPresentation:TEACH}),
  V('desc-mi-grow','descend-to-mi','GROW',[N('G4',67,0,1),N('F4',65,1,1),N('E4',64,2,2)],{parentVariant:'desc-mi-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:LEARN}),
  V('desc-do-seed','descend-to-do','SEED',[N('E4',64,0,2),N('C4',60,2,2)],{allowedPresentation:TEACH}),
  V('desc-do-grow','descend-to-do','GROW',[N('E4',64,0,1),N('D4',62,1,1),N('C4',60,2,2)],{parentVariant:'desc-do-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:LEARN}),
  V('desc-do-change','descend-to-do','CHANGE',[N('E4',64,0,.5),N('D4',62,.5,.5),N('C4',60,1,.5),N('B3',59,1.5,.5),N('C4',60,2,2)],{parentVariant:'desc-do-grow',morphType:'CHANGE',morphTargets:[3,4],allowedPresentation:LEARN}),
  V('second-c','second-harmonic-family','SEED',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('C5',72,3,1)],{harmonyTimeline:[{beat:0,chord:'C'}],allowedPresentation:TEACH,allowedHarmony:['C'],source:STAGE4_SOURCE}),
  V('second-c6','second-harmonic-family','GROW',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('A4',69,3,1)],{parentVariant:'second-c',morphType:'CHANGE',morphTargets:[3],harmonyTimeline:[{beat:0,chord:'C6'}],allowedPresentation:LEARN,allowedHarmony:['C6'],source:STAGE4_SOURCE}),
  V('second-am7','second-harmonic-family','MOVE',[N('A3',57,0,1),N('C4',60,1,1),N('E4',64,2,1),N('G4',67,3,1)],{parentVariant:'second-c6',morphType:'CHANGE',morphTargets:[0,1,2,3],harmonyTimeline:[{beat:0,chord:'Am7'}],allowedPresentation:LEARN,allowedHarmony:['Am7'],source:STAGE4_SOURCE}),
  V('second-dm7','second-harmonic-family','MOVE',[N('D4',62,0,1),N('F4',65,1,1),N('A4',69,2,1),N('C5',72,3,1)],{parentVariant:'second-am7',morphType:'CHANGE',morphTargets:[0,1,2,3],harmonyTimeline:[{beat:0,chord:'Dm7'}],allowedPresentation:LEARN,allowedHarmony:['Dm7'],source:STAGE4_SOURCE}),
  V('ii-v-i-seed','ii-v-i-voice-line','SEED',[N('F4',65,0,2),N('F4',65,2,2),N('E4',64,4,4)],{harmonyTimeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7'},{beat:4,chord:'Cmaj7'}],allowedPresentation:TEACH,allowedHarmony:['Dm7','G7','Cmaj7'],source:STAGE5_SOURCE}),
  V('ii-v-i-grow','ii-v-i-voice-line','GROW',[N('F4',65,0,1),N('A4',69,1,1),N('F4',65,2,1),N('B4',71,3,1),N('E4',64,4,1),N('G4',67,5,1),N('E4',64,6,1),N('C4',60,7,1)],{parentVariant:'ii-v-i-seed',morphType:'CHANGE',morphTargets:[0,1,2,3,4,5,6,7],harmonyTimeline:[{beat:0,chord:'Dm7'},{beat:2,chord:'G7'},{beat:4,chord:'Cmaj7'}],allowedPresentation:LEARN,allowedHarmony:['Dm7','G7','Cmaj7'],source:STAGE5_SOURCE}),
];
export const variantById=id=>VARIANTS.find(v=>v.variantId===id)||null;
export const variantsForFamily=familyId=>VARIANTS.filter(v=>v.familyId===familyId);

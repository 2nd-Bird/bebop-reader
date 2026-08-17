const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const R=(startBeat,duration)=>({pitch:null,midi:null,startBeat,duration,rest:true});
const V=(variantId,familyId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],harmonyMorphTargets=[],harmonyTimeline=null,allowedPresentation=['COLD_READ'],coldReadEligible=true,allowedHarmony=['C'],source=null}={})=>({variantId,familyId,phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,harmonyMorphTargets,harmonyTimeline,allowedKeys:['C'],allowedHarmony,allowedPresentation,coldReadEligible,source});
const TEACH=['TEACHER_CALL','BUILD','COLD_READ','DELAYED_READ'];
const LEARN=['BUILD','COLD_READ','DELAYED_READ'];
const H001={type:'hamase-rule',hamaseRef:'ex.001',analysisRef:'分散和音→音階化',textPage:20,scorePage:21,preparedImage:'pages/page_0021.jpg'};
const H005={type:'hamase-rule',hamaseRef:'ex.005',analysisRef:'上昇音階型分散和音',textPages:[22,23],scorePage:23,preparedImage:'pages/page_0023.jpg'};
const H029={type:'hamase-rule-derived-training',hamaseRef:'ex.029',analysisRef:'前打音が新しい和声の主音へ転化',textPage:32,scorePage:32,preparedImage:'pages/page_0032.jpg'};
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
  V('desc-mi-extend','descend-to-mi','EXTEND',[N('G4',67,0,.5),N('F4',65,.5,.5),N('E4',64,1,.5),N('D4',62,1.5,.5),N('C4',60,2,2)],{parentVariant:'desc-mi-grow',morphType:'EXTEND',morphTargets:[3,4],allowedPresentation:LEARN}),
  V('desc-do-seed','descend-to-do','SEED',[N('E4',64,0,2),N('C4',60,2,2)],{allowedPresentation:TEACH}),
  V('desc-do-grow','descend-to-do','GROW',[N('E4',64,0,1),N('D4',62,1,1),N('C4',60,2,2)],{parentVariant:'desc-do-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:LEARN}),
  V('desc-do-change','descend-to-do','CHANGE',[N('E4',64,0,.5),N('D4',62,.5,.5),N('C4',60,1,.5),N('B3',59,1.5,.5),N('C4',60,2,2)],{parentVariant:'desc-do-grow',morphType:'CHANGE',morphTargets:[3,4],allowedPresentation:LEARN}),
  V('cti-desc-seed','chord-tones-in-time','SEED',[N('Bb4',70,0,1),N('G4',67,1,1),N('E4',64,2,1),N('C4',60,3,1)],{allowedPresentation:TEACH,allowedHarmony:['C7'],source:H001}),
  V('cti-desc-pass','chord-tones-in-time','GROW',[N('Bb4',70,0,.5),N('A4',69,.5,.5),N('G4',67,1,.5),N('F4',65,1.5,.5),N('E4',64,2,.5),N('D4',62,2.5,.5),N('C4',60,3,1)],{parentVariant:'cti-desc-seed',morphType:'INSERT',morphTargets:[1,3,5],allowedPresentation:LEARN,allowedHarmony:['C7'],source:H001}),
  V('cti-asc-seed','chord-tones-in-time','CHANGE',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('Bb4',70,3,1)],{parentVariant:'cti-desc-seed',morphType:'CHANGE',morphTargets:[0,1,2,3],allowedPresentation:LEARN,allowedHarmony:['C7'],source:H005}),
  V('cti-asc-pass','chord-tones-in-time','GROW',[N('C4',60,0,.5),N('D4',62,.5,.5),N('E4',64,1,.5),N('F4',65,1.5,.5),N('G4',67,2,.5),N('A4',69,2.5,.5),N('Bb4',70,3,1)],{parentVariant:'cti-asc-seed',morphType:'INSERT',morphTargets:[1,3,5],allowedPresentation:LEARN,allowedHarmony:['C7'],source:H005}),
  V('reh-gf-ornament','rehear-g-to-f','SEED',[N('G4',67,0,2),N('F4',65,2,2)],{harmonyTimeline:[{beat:0,chord:'FMaj7'}],allowedPresentation:TEACH,allowedHarmony:['FMaj7','G7sus4'],source:H029}),
  V('reh-gf-sus-root','rehear-g-to-f','REHEAR',[N('G4',67,0,2),N('F4',65,2,2)],{parentVariant:'reh-gf-ornament',morphType:'REHARMONIZE',harmonyMorphTargets:[0],harmonyTimeline:[{beat:0,chord:'G7sus4'}],allowedPresentation:LEARN,allowedHarmony:['FMaj7','G7sus4'],source:H029}),
  V('reh-gf-pivot','rehear-g-to-f','REHEAR',[N('G4',67,0,2),N('F4',65,2,2)],{parentVariant:'reh-gf-sus-root',morphType:'REHARMONIZE',harmonyMorphTargets:[1],harmonyTimeline:[{beat:0,chord:'FMaj7'},{beat:1,chord:'G7sus4'}],allowedPresentation:LEARN,allowedHarmony:['FMaj7','G7sus4'],source:H029}),
];
export const variantById=id=>VARIANTS.find(v=>v.variantId===id)||null;
export const variantsForFamily=familyId=>VARIANTS.filter(v=>v.familyId===familyId);

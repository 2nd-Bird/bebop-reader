const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const R=(startBeat,duration)=>({pitch:null,midi:null,startBeat,duration,rest:true});
const V=(variantId,familyId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],allowedPresentation=['COLD_READ'],coldReadEligible=true}={})=>({variantId,familyId,phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,allowedKeys:['C'],allowedHarmony:['C'],allowedPresentation,coldReadEligible});
export const VARIANTS=[
  V('anchor-cg-01','anchor-do-sol','SEED',[N('C4',60,0,1),N('G4',67,1,1),N('C4',60,2,1),N('G4',67,3,1)],{allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('anchor-gc-01','anchor-do-sol','CHANGE',[N('G4',67,0,1),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'anchor-cg-01',morphType:'CHANGE',morphTargets:[0,1,2,3],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('anchor-ccgg-01','anchor-do-sol','CHANGE',[N('C4',60,0,1),N('C4',60,1,1),N('G4',67,2,1),N('G4',67,3,1)],{parentVariant:'anchor-cg-01',morphType:'CHANGE',morphTargets:[1,3],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('do-sol-q-01','do-sol-in-time','SEED',[N('C4',60,0,1),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('do-sol-rest-01','do-sol-in-time','CHANGE',[N('C4',60,0,1),R(1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'CHANGE',morphTargets:[1],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('do-sol-eighth-01','do-sol-in-time','EXTEND',[N('C4',60,0,.5),N('G4',67,.5,.5),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'EXTEND',morphTargets:[0,1],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('tonic-shape-01','tonic-shape','SEED',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('E4',64,3,1)],{allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('tonic-shape-02','tonic-shape','CHANGE',[N('G4',67,0,1),N('E4',64,1,1),N('C4',60,2,1),N('E4',64,3,1)],{parentVariant:'tonic-shape-01',morphType:'CHANGE',morphTargets:[0,2],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('desc-mi-seed','descend-to-mi','SEED',[N('G4',67,0,2),N('E4',64,2,2)],{allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('desc-mi-grow','descend-to-mi','GROW',[N('G4',67,0,1),N('F4',65,1,1),N('E4',64,2,2)],{parentVariant:'desc-mi-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('desc-mi-extend','descend-to-mi','EXTEND',[N('G4',67,0,.5),N('F4',65,.5,.5),N('E4',64,1,.5),N('D4',62,1.5,.5),N('C4',60,2,2)],{parentVariant:'desc-mi-grow',morphType:'EXTEND',morphTargets:[3,4],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('desc-do-seed','descend-to-do','SEED',[N('E4',64,0,2),N('C4',60,2,2)],{allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('desc-do-grow','descend-to-do','GROW',[N('E4',64,0,1),N('D4',62,1,1),N('C4',60,2,2)],{parentVariant:'desc-do-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
  V('desc-do-change','descend-to-do','CHANGE',[N('E4',64,0,.5),N('D4',62,.5,.5),N('C4',60,1,.5),N('B3',59,1.5,.5),N('C4',60,2,2)],{parentVariant:'desc-do-grow',morphType:'CHANGE',morphTargets:[3,4],allowedPresentation:['BUILD','COLD_READ','DELAYED_READ']}),
];
export const variantById=id=>VARIANTS.find(v=>v.variantId===id)||null;
export const variantsForFamily=familyId=>VARIANTS.filter(v=>v.familyId===familyId);

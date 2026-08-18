const N=(pitch,midi,startBeat,duration)=>({pitch,midi,startBeat,duration,rest:false});
const R=(startBeat,duration)=>({pitch:null,midi:null,startBeat,duration,rest:true});
const V=(variantId,familyId,phase,notes,{parentVariant=null,morphType='NONE',morphTargets=[],allowedPresentation=['COLD_READ'],coldReadEligible=true,allowedHarmony=['C'],source=null,structuralTargetIndices=null,entryRole=null,exitRole=null,continuationRole=null}={})=>({variantId,familyId,phase,parentVariant,notes,rhythm:'4/4',meter:[4,4],morphType,morphTargets,allowedKeys:['C'],allowedHarmony,allowedPresentation,coldReadEligible,source,structuralTargetIndices,entryRole,exitRole,continuationRole});
const TEACH=['TEACHER_CALL','BUILD','COLD_READ','DELAYED_READ'];
const LEARN=['BUILD','COLD_READ','DELAYED_READ'];
const STAGE4_SOURCE={type:'curriculum',hamaseRef:null,analysisRef:'C / C6 / Am7 / Dm7を共有shape familyとして経験',curriculumRef:'教材の方針 rev.3 Stage 4'};
const STAGE5_SOURCE={type:'curriculum',hamaseRef:null,analysisRef:'voice-leadingを中心にbarlineを跨いだphraseへ進む',curriculumRef:'教材の方針 rev.3 Stage 5'};
const STAGE6_HARMONY_SOURCE={type:'hamase',hamaseRef:'ex.085',sourcePage:58,analysisRef:'ex.085 — 6度コード・チェンジの理論モデル',adaptation:'C Major pedagogical reduction; source is a theory diagram, not copied surface notation'};
const STAGE6_LINE_SOURCE={type:'hamase',hamaseRef:'ex.269',sourcePage:234,sourceWork:'Ballade',analysisRef:'ex.269 — リニア・ラインとその構成セルによる和声の細分化',adaptation:'C-major pedagogical reduction of the line-first generator; not the original Ballade surface'};
const STAGE7_SOURCE={type:'hamase',hamaseRef:'ex.087',sourcePage:59,sourcePages:[59,60],sourceWork:"Billie’s Bounce [take 1]",analysisRef:'ex.087 — CELLの分節と可変なsurface',adaptation:'C-major pedagogical reduction of the invariant/surface principle; source analytic chord labels are not used as sounding accompaniment'};
export const VARIANTS=[
  V('anchor-cg-01','anchor-do-sol','SEED',[N('C4',60,0,1),N('G4',67,1,1),N('C4',60,2,1),N('G4',67,3,1)],{allowedPresentation:TEACH}),
  V('anchor-gc-01','anchor-do-sol','CHANGE',[N('G4',67,0,1),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'anchor-cg-01',morphType:'CHANGE',morphTargets:[0,1,2,3],allowedPresentation:LEARN}),
  V('anchor-ccgg-01','anchor-do-sol','CHANGE',[N('C4',60,0,1),N('C4',60,1,1),N('G4',67,2,1),N('G4',67,3,1)],{parentVariant:'anchor-cg-01',morphType:'CHANGE',morphTargets:[1,3],allowedPresentation:LEARN}),
  V('do-sol-q-01','do-sol-in-time','SEED',[N('C4',60,0,1),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{allowedPresentation:TEACH}),
  V('do-sol-rest-01','do-sol-in-time','CHANGE',[N('C4',60,0,1),R(1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'CHANGE',morphTargets:[1],allowedPresentation:LEARN}),
  V('do-sol-eighth-01','do-sol-in-time','EXTEND',[N('C4',60,0,.5),N('G4',67,.5,.5),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'EXTEND',morphTargets:[0,1],allowedPresentation:LEARN}),
  V('do-sol-pickup-01','do-sol-in-time','CHANGE',[R(0,.5),N('G4',67,.5,.5),N('C4',60,1,1),N('G4',67,2,1),N('C4',60,3,1)],{parentVariant:'do-sol-q-01',morphType:'CHANGE',morphTargets:[0,1],allowedPresentation:LEARN}),
  V('tonic-shape-01','tonic-shape','SEED',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('E4',64,3,1)],{allowedPresentation:TEACH}),
  V('tonic-shape-02','tonic-shape','CHANGE',[N('G4',67,0,1),N('E4',64,1,1),N('C4',60,2,1),N('E4',64,3,1)],{parentVariant:'tonic-shape-01',morphType:'CHANGE',morphTargets:[0,2],allowedPresentation:LEARN}),
  V('desc-mi-seed','descend-to-mi','SEED',[N('G4',67,0,2),N('E4',64,2,2)],{allowedPresentation:TEACH}),
  V('desc-mi-grow','descend-to-mi','GROW',[N('G4',67,0,1),N('F4',65,1,1),N('E4',64,2,2)],{parentVariant:'desc-mi-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:LEARN}),
  V('desc-do-seed','descend-to-do','SEED',[N('E4',64,0,2),N('C4',60,2,2)],{allowedPresentation:TEACH}),
  V('desc-do-grow','descend-to-do','GROW',[N('E4',64,0,1),N('D4',62,1,1),N('C4',60,2,2)],{parentVariant:'desc-do-seed',morphType:'INSERT',morphTargets:[1],allowedPresentation:LEARN}),
  V('desc-do-change','descend-to-do','CHANGE',[N('E4',64,0,.5),N('D4',62,.5,.5),N('C4',60,1,.5),N('B3',59,1.5,.5),N('C4',60,2,2)],{parentVariant:'desc-do-grow',morphType:'CHANGE',morphTargets:[3,4],allowedPresentation:LEARN}),
  V('second-c','second-harmonic-family','SEED',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('C5',72,3,1)],{allowedPresentation:TEACH,allowedHarmony:['C'],source:STAGE4_SOURCE}),
  V('second-c6','second-harmonic-family','GROW',[N('C4',60,0,1),N('E4',64,1,1),N('G4',67,2,1),N('A4',69,3,1)],{parentVariant:'second-c',morphType:'CHANGE',morphTargets:[3],allowedPresentation:LEARN,allowedHarmony:['C6'],source:STAGE4_SOURCE}),
  V('second-am7','second-harmonic-family','MOVE',[N('A3',57,0,1),N('C4',60,1,1),N('E4',64,2,1),N('G4',67,3,1)],{parentVariant:'second-c6',morphType:'CHANGE',morphTargets:[0,1,2,3],allowedPresentation:LEARN,allowedHarmony:['Am7'],source:STAGE4_SOURCE}),
  V('second-dm7','second-harmonic-family','MOVE',[N('D4',62,0,1),N('F4',65,1,1),N('A4',69,2,1),N('C5',72,3,1)],{parentVariant:'second-am7',morphType:'CHANGE',morphTargets:[0,1,2,3],allowedPresentation:LEARN,allowedHarmony:['Dm7'],source:STAGE4_SOURCE}),
  V('ii-v-i-seed','ii-v-i-voice-line','SEED',[N('F4',65,0,2),N('F4',65,2,2),N('E4',64,4,4)],{allowedPresentation:TEACH,allowedHarmony:['Dm7','G7','Cmaj7'],source:STAGE5_SOURCE}),
  V('ii-v-i-grow','ii-v-i-voice-line','GROW',[N('F4',65,0,1),N('A4',69,1,1),N('F4',65,2,1),N('B4',71,3,1),N('E4',64,4,1),N('G4',67,5,1),N('E4',64,6,1),N('C4',60,7,1)],{parentVariant:'ii-v-i-seed',morphType:'CHANGE',morphTargets:[0,1,2,3,4,5,6,7],allowedPresentation:LEARN,allowedHarmony:['Dm7','G7','Cmaj7'],source:STAGE5_SOURCE}),
  V('harmony-descent-seed','harmony-born-descent','SEED',[N('C5',72,0,1),N('B4',71,1,1),N('A4',69,2,1),N('G4',67,3,1)],{allowedPresentation:TEACH,allowedHarmony:['Cmaj7','Am7'],source:STAGE6_HARMONY_SOURCE}),
  V('harmony-descent-grow','harmony-born-descent','GROW',[N('C5',72,0,1),N('B4',71,1,1),N('A4',69,2,1),N('G4',67,3,1),N('F4',65,4,1),N('E4',64,5,1),N('D4',62,6,1),N('C4',60,7,1)],{parentVariant:'harmony-descent-seed',morphType:'EXTEND',morphTargets:[4,5,6,7],allowedPresentation:LEARN,allowedHarmony:['Cmaj7','Am7','FMaj7','Dm7'],source:STAGE6_HARMONY_SOURCE}),
  V('line-descent-seed','line-born-descent','SEED',[N('G4',67,0,1),N('F4',65,1,1),N('E4',64,2,1),N('D4',62,3,1)],{allowedPresentation:TEACH,allowedHarmony:['G7','Em7'],source:STAGE6_LINE_SOURCE}),
  V('line-descent-grow','line-born-descent','GROW',[N('G4',67,0,1),N('F4',65,1,1),N('E4',64,2,1),N('D4',62,3,1),N('C4',60,4,2),N('B3',59,6,2)],{parentVariant:'line-descent-seed',morphType:'EXTEND',morphTargets:[4,5],allowedPresentation:LEARN,allowedHarmony:['G7','Em7','Cmaj7'],source:STAGE6_LINE_SOURCE}),
  V('gf-cell-seed','g-to-f-surfaces','SEED',[N('G4',67,0,2),N('F4',65,2,2)],{allowedPresentation:TEACH,allowedHarmony:['C'],source:STAGE7_SOURCE,structuralTargetIndices:[0,1],entryRole:'structural-target',exitRole:'structural-target'}),
  V('gf-cell-return','g-to-f-surfaces','GROW',[N('G4',67,0,1),N('A4',69,1,1),N('G4',67,2,1),N('F4',65,3,1)],{parentVariant:'gf-cell-seed',morphType:'INSERT',morphTargets:[1,2],allowedPresentation:LEARN,allowedHarmony:['C'],source:STAGE7_SOURCE,structuralTargetIndices:[0,3],entryRole:'structural-target',exitRole:'structural-target'}),
  V('gf-cell-fan','g-to-f-surfaces','DENSIFY',[N('G4',67,0,.5),N('B4',71,.5,.5),N('A4',69,1,1),N('G4',67,2,1),N('F4',65,3,1)],{parentVariant:'gf-cell-return',morphType:'CHANGE',morphTargets:[0,1,2],allowedPresentation:LEARN,allowedHarmony:['C'],source:STAGE7_SOURCE,structuralTargetIndices:[0,4],entryRole:'structural-target',exitRole:'structural-target'}),
];
for(const v of VARIANTS){
  if(v.familyId==='g-to-f-surfaces'){
    if(!Array.isArray(v.structuralTargetIndices)||v.structuralTargetIndices.length!==2)throw new Error(`${v.variantId}: Stage 7 structural targets required`);
    for(const i of v.structuralTargetIndices){if(!Number.isInteger(i)||!v.notes[i]||v.notes[i].rest)throw new Error(`${v.variantId}: invalid structural target index ${i}`);}
  }
}
export const variantById=id=>VARIANTS.find(v=>v.variantId===id)||null;
export const variantsForFamily=familyId=>VARIANTS.filter(v=>v.familyId===familyId);

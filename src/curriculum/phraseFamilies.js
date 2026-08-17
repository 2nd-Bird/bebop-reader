export const PHRASE_FAMILIES=[
 {familyId:'anchor-do-sol',title:'DO ↔ SOL Anchor',stage:0,structure:'two staff landmarks',line:['C','G'],cells:[['C','G'],['G','C']],harmonyRoles:['tonic','fifth'],variants:['anchor-cg-01','anchor-gc-01'],source:{type:'curriculum',hamaseRef:null,sourcePage:null,analysisRef:null}},
 {familyId:'do-sol-in-time',title:'DO / SOL in Time',stage:1,structure:'tonic/fifth phrase under rhythmic change',line:['C','G','C'],cells:[['C','G']],harmonyRoles:['tonic','fifth'],variants:['do-sol-q-01','do-sol-rest-01','do-sol-eighth-01'],source:{type:'curriculum',hamaseRef:null,sourcePage:null,analysisRef:null}},
 {familyId:'tonic-shape',title:'Tonic Shape',stage:2,structure:'C-E-G as one shape',line:['C','E','G'],cells:[['C','E'],['E','G']],harmonyRoles:['root','third','fifth'],variants:['tonic-shape-01','tonic-shape-02'],source:{type:'curriculum',hamaseRef:null,sourcePage:null,analysisRef:null}},
 {familyId:'descend-to-mi',title:'G → E / Make the Line',stage:3,structure:'descending motion toward E',line:['G','F','E'],cells:[['G','E'],['G','F'],['F','E']],harmonyRoles:['fifth','third'],variants:['desc-mi-seed','desc-mi-grow','desc-mi-extend'],source:{type:'curriculum',hamaseRef:null,sourcePage:null,analysisRef:null}},
 {familyId:'descend-to-do',title:'E → C / Make the Line',stage:3,structure:'descending motion toward C',line:['E','D','C'],cells:[['E','C'],['E','D'],['D','C']],harmonyRoles:['third','root'],variants:['desc-do-seed','desc-do-grow','desc-do-change'],source:{type:'curriculum',hamaseRef:null,sourcePage:null,analysisRef:null}},
];
export const familyById=id=>PHRASE_FAMILIES.find(f=>f.familyId===id)||null;
export const familiesForStage=stage=>PHRASE_FAMILIES.filter(f=>f.stage===Number(stage));
export const familiesThroughStage=stage=>PHRASE_FAMILIES.filter(f=>f.stage<=Number(stage));

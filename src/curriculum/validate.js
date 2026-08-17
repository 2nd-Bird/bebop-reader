import{PHRASE_FAMILIES}from'./phraseFamilies.js';import{VARIANTS,variantById}from'./variants.js';import{stageByNumber}from'./stages.js';
export function validateCurriculum(){
 const famIds=new Set();
 for(const f of PHRASE_FAMILIES){
  if(famIds.has(f.familyId))throw new Error(`duplicate family ${f.familyId}`);famIds.add(f.familyId);
  if(!stageByNumber(f.stage))throw new Error(`${f.familyId}: unknown stage`);
  for(const id of f.variants){const v=variantById(id);if(!v)throw new Error(`${f.familyId}: missing variant ${id}`);if(v.familyId!==f.familyId)throw new Error(`${id}: wrong family`)}
 }
 const ids=new Set(VARIANTS.map(v=>v.variantId));if(ids.size!==VARIANTS.length)throw new Error('duplicate variant');
 for(const v of VARIANTS){
  if(!famIds.has(v.familyId))throw new Error(`${v.variantId}: missing family`);
  if(v.parentVariant){const p=variantById(v.parentVariant);if(!p)throw new Error(`${v.variantId}: missing parent`);if(p.familyId!==v.familyId)throw new Error(`${v.variantId}: parent family mismatch`)}
  if(!v.allowedKeys?.length||!v.allowedPresentation?.length)throw new Error(`${v.variantId}: missing allowed scope`);
 }
 return true;
}

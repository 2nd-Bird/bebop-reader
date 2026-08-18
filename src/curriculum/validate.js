import{PHRASE_FAMILIES}from'./phraseFamilyRegistry.js';import{VARIANTS,variantById}from'./variantRegistry.js';import{stageByNumber}from'./stages.js';import{defaultHarmonyFieldFor,harmonyFieldById}from'./harmonyFields.js';import{tonalFieldById}from'./tonalFields.js';
const variantBeats=v=>Math.max(4,...(v.notes||[]).map(n=>n.startBeat+n.duration));
export function validateCurriculum(){
 const famIds=new Set(),contextManagedVariantIds=new Set();
 for(const f of PHRASE_FAMILIES){
  if(famIds.has(f.familyId))throw new Error(`duplicate family ${f.familyId}`);famIds.add(f.familyId);
  if(!stageByNumber(f.stage))throw new Error(`${f.familyId}: unknown stage`);
  for(const id of f.variants){const v=variantById(id);if(!v)throw new Error(`${f.familyId}: missing variant ${id}`);if(v.familyId!==f.familyId)throw new Error(`${id}: wrong family`)}
  for(const tonalFieldId of f.allowedTonalFieldIds||[])if(!tonalFieldById(tonalFieldId))throw new Error(`${f.familyId}: missing tonal field ${tonalFieldId}`);
  for(const entry of f.contextSequence||[]){
   const v=variantById(entry.variantId),field=harmonyFieldById(entry.harmonyFieldId),tonalField=entry.tonalFieldId?tonalFieldById(entry.tonalFieldId):null;
   if(!v||v.familyId!==f.familyId)throw new Error(`${f.familyId}: bad context variant ${entry.variantId}`);
   if(!field)throw new Error(`${f.familyId}: missing context field ${entry.harmonyFieldId}`);
   if(field.timeline.some(x=>!v.allowedHarmony?.includes(x.chord)))throw new Error(`${entry.variantId}: context field ${entry.harmonyFieldId} outside allowed harmony`);
   if(entry.tonalFieldId&&!tonalField)throw new Error(`${f.familyId}: missing context tonal field ${entry.tonalFieldId}`);
   if(entry.tonalFieldId&&f.allowedTonalFieldIds?.length&&!f.allowedTonalFieldIds.includes(entry.tonalFieldId))throw new Error(`${f.familyId}: context tonal field ${entry.tonalFieldId} outside family scope`);
   contextManagedVariantIds.add(entry.variantId);
  }
 }
 const ids=new Set(VARIANTS.map(v=>v.variantId));if(ids.size!==VARIANTS.length)throw new Error('duplicate variant');
 for(const v of VARIANTS){
  if(!famIds.has(v.familyId))throw new Error(`${v.variantId}: missing family`);
  if('tonalFieldId'in v)throw new Error(`${v.variantId}: Phrase Variant must not own tonalFieldId`);
  if(v.parentVariant){const p=variantById(v.parentVariant);if(!p)throw new Error(`${v.variantId}: missing parent`);if(p.familyId!==v.familyId)throw new Error(`${v.variantId}: parent family mismatch`)}
  if(!v.allowedKeys?.length||!v.allowedHarmony?.length||!v.allowedPresentation?.length)throw new Error(`${v.variantId}: missing allowed scope`);
  if(v.structuralTargetIndices!=null){
   if(!Array.isArray(v.structuralTargetIndices)||!v.structuralTargetIndices.length)throw new Error(`${v.variantId}: structuralTargetIndices must be a non-empty array`);
   for(const i of v.structuralTargetIndices){if(!Number.isInteger(i)||!v.notes[i]||v.notes[i].rest)throw new Error(`${v.variantId}: invalid structural target index ${i}`);}
  }
  if(v.restartEntryIndices?.length){
   if(v.operationType!=='CELL_RESTART_EXTENSION')throw new Error(`${v.variantId}: restart entry metadata requires CELL_RESTART_EXTENSION`);
   for(const i of v.restartEntryIndices){if(!Number.isInteger(i)||!v.notes[i]||v.notes[i].rest)throw new Error(`${v.variantId}: invalid restart entry index ${i}`);}
  }
  if(!contextManagedVariantIds.has(v.variantId)){
   const scoreBeats=variantBeats(v),field=defaultHarmonyFieldFor(v.allowedHarmony,{scoreBeats});if(!field)throw new Error(`${v.variantId}: no compatible default harmony field for ${v.allowedHarmony.join(',')} at ${scoreBeats} beats`);
  }
 }
 return true;
}

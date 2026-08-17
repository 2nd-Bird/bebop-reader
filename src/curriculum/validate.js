import{PHRASE_FAMILIES}from'./phraseFamilyRegistry.js';import{VARIANTS,variantById}from'./variantRegistry.js';import{STAGES,stageByNumber}from'./stages.js';import{defaultHarmonyFieldFor,harmonyFieldById}from'./harmonyFields.js';import{tonalFieldById}from'./tonalFields.js';import{MUSICAL_FORMS,musicalFormById}from'./musicalForms.js';
const variantBeats=v=>Math.max(4,...(v.notes||[]).map(n=>n.startBeat+n.duration));
export function validateCurriculum(){
 const famIds=new Set(),contextManagedVariantIds=new Set();
 for(const stage of STAGES){
  for(const formId of stage.unlock?.forms||[])if(!musicalFormById(formId))throw new Error(`stage ${stage.stage}: missing musical form ${formId}`);
  for(const familyId of stage.unlock?.integrationFamilyIds||[])if(!PHRASE_FAMILIES.some(f=>f.familyId===familyId))throw new Error(`stage ${stage.stage}: missing integration family ${familyId}`);
 }
 for(const form of MUSICAL_FORMS){
  for(const familyId of form.integrationFamilyIds||[])if(!PHRASE_FAMILIES.some(f=>f.familyId===familyId))throw new Error(`${form.formId}: missing integration family ${familyId}`);
  for(const slot of form.slotPrograms||[]){const family=PHRASE_FAMILIES.find(f=>f.familyId===slot.familyId),variant=variantById(slot.variantId);if(!family||!variant||variant.familyId!==family.familyId)throw new Error(`${form.formId}: bad programmed slot ${slot.familyId}/${slot.variantId}`);if(slot.movePolicy&&slot.movePolicy!=='RELATIVE_MAJOR_OF_DOMINANT')throw new Error(`${form.formId}: unknown move policy ${slot.movePolicy}`);}
 }
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
  if(!contextManagedVariantIds.has(v.variantId)){
   const scoreBeats=variantBeats(v),field=defaultHarmonyFieldFor(v.allowedHarmony,{scoreBeats});if(!field)throw new Error(`${v.variantId}: no compatible default harmony field for ${v.allowedHarmony.join(',')} at ${scoreBeats} beats`);
  }
 }
 return true;
}

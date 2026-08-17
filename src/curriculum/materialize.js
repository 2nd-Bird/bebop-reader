export function materializeScoreModel(variant,event,sessionPlan){
 if(!variant)throw new Error('variant is required');
 const key=event.key||sessionPlan.key||'C';
 if(!variant.allowedKeys.includes(key))throw new Error(`${variant.variantId}: key ${key} is not allowed`);
 if(event.presentationMode&&!variant.allowedPresentation.includes(event.presentationMode))throw new Error(`${variant.variantId}: presentation ${event.presentationMode} is not allowed`);
 const totalBeats=Math.max(4,...variant.notes.map(n=>n.startBeat+n.duration));
 return {id:variant.variantId,title:event.title||variant.variantId,key,bpm:sessionPlan.bpm,meter:variant.meter||[4,4],notes:variant.notes.map(n=>({...n})),chords:event.harmonyContext?[event.harmonyContext]:[],totalBeats,unitBeats:4};
}

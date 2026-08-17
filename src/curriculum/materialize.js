export function harmonyTimelineFor(variant,event,totalBeats=4){
 const raw=variant?.harmonyTimeline||event?.harmonyTimeline||[{beat:0,chord:event?.harmonyContext||'C'}];
 const out=raw.map(x=>({beat:Number(x.beat),chord:String(x.chord||'').trim()})).sort((a,b)=>a.beat-b.beat);
 if(!out.length||out[0].beat!==0)throw new Error(`${variant?.variantId||'score'}: harmony timeline must start at beat 0`);
 let prev=-1;
 for(const x of out){if(!Number.isFinite(x.beat)||x.beat<0||x.beat>=totalBeats||!x.chord)throw new Error(`${variant?.variantId||'score'}: invalid harmony timeline`);if(x.beat<=prev)throw new Error(`${variant?.variantId||'score'}: harmony beats must increase`);prev=x.beat;}
 return out;
}
export function materializeScoreModel(variant,event,sessionPlan){
 if(!variant)throw new Error('variant is required');
 const key=event.key||sessionPlan.key||'C';
 if(!variant.allowedKeys.includes(key))throw new Error(`${variant.variantId}: key ${key} is not allowed`);
 if(event.presentationMode&&!variant.allowedPresentation.includes(event.presentationMode))throw new Error(`${variant.variantId}: presentation ${event.presentationMode} is not allowed`);
 const totalBeats=Math.max(4,...variant.notes.map(n=>n.startBeat+n.duration));
 const harmonyTimeline=harmonyTimelineFor(variant,event,totalBeats);
 return {id:variant.variantId,title:event.title||variant.variantId,key,bpm:sessionPlan.bpm,meter:variant.meter||[4,4],notes:variant.notes.map(n=>({...n})),chords:harmonyTimeline.map(x=>x.chord),harmonyTimeline,totalBeats,unitBeats:4};
}

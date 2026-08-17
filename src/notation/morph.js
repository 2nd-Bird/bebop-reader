const diffIndices=(parent,current)=>{
  if(!parent||!current)return [];
  const a=parent.notes||[],b=current.notes||[],out=[];
  const n=Math.max(a.length,b.length);
  for(let i=0;i<n;i++){
    const x=a[i],y=b[i];
    if(!x||!y||x.pitch!==y.pitch||x.midi!==y.midi||x.startBeat!==y.startBeat||x.duration!==y.duration||!!x.rest!==!!y.rest)out.push(i);
  }
  return out;
};
const diffHarmonyBeats=(parent,current)=>{
  const a=parent?.harmonyTimeline||[],b=current?.harmonyTimeline||[];
  const map=new Map(a.map(x=>[Number(x.beat),String(x.chord)]));
  return b.filter(x=>map.get(Number(x.beat))!==String(x.chord)).map(x=>Number(x.beat));
};

export function morphDescriptor({variant,parentVariant=null}={}){
  if(!variant)return {active:false,type:'NONE',indices:[],harmonyBeats:[]};
  const type=variant.morphType||'NONE';
  const explicit=Array.isArray(variant.morphTargets)?variant.morphTargets:[];
  const indices=explicit.length?explicit:diffIndices(parentVariant,variant);
  const explicitHarmony=Array.isArray(variant.harmonyMorphTargets)?variant.harmonyMorphTargets:[];
  const harmonyBeats=explicitHarmony.length?explicitHarmony:diffHarmonyBeats(parentVariant,variant);
  const active=type!=='NONE'&&(indices.length>0||harmonyBeats.length>0);
  return {active,type,indices,harmonyBeats,parentVariantId:variant.parentVariant||null};
}

export function applyMorphHighlight(container,descriptor,{active=true}={}){
  if(!container)return;
  const indices=new Set(descriptor?.indices||[]),harmonyBeats=new Set((descriptor?.harmonyBeats||[]).map(Number));
  container.querySelectorAll('[data-note-index]').forEach(node=>{
    const i=Number(node.dataset.noteIndex);
    const hit=active&&indices.has(i);
    node.classList.toggle('morph-note',hit);
    node.classList.toggle('morph-insert',hit&&descriptor?.type==='INSERT');
    node.classList.toggle('morph-extend',hit&&descriptor?.type==='EXTEND');
    node.classList.toggle('morph-change',hit&&descriptor?.type==='CHANGE');
  });
  container.querySelectorAll('[data-harmony-beat]').forEach(node=>node.classList.toggle('morph-harmony',active&&harmonyBeats.has(Number(node.dataset.harmonyBeat))));
}

export function clearMorphHighlight(container){
  if(!container)return;
  container.querySelectorAll('.morph-note,.morph-insert,.morph-extend,.morph-change,.morph-harmony').forEach(node=>node.classList.remove('morph-note','morph-insert','morph-extend','morph-change','morph-harmony'));
}

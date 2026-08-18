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

export function morphDescriptor({variant,parentVariant=null}={}){
  if(!variant)return {active:false,type:'NONE',indices:[]};
  const type=variant.morphType||'NONE';
  const explicit=Array.isArray(variant.morphTargets)?variant.morphTargets:[];
  const indices=explicit.length?explicit:diffIndices(parentVariant,variant);
  return {active:type!=='NONE'&&indices.length>0,type,indices,parentVariantId:variant.parentVariant||null};
}

export function applyMorphHighlight(container,descriptor,{active=true}={}){
  if(!container)return;
  const indices=new Set(descriptor?.indices||[]);
  container.querySelectorAll('[data-note-index]').forEach(node=>{
    const i=Number(node.dataset.noteIndex);
    const hit=active&&indices.has(i);
    node.classList.toggle('morph-note',hit);
    node.classList.toggle('morph-insert',hit&&descriptor?.type==='INSERT');
    node.classList.toggle('morph-extend',hit&&descriptor?.type==='EXTEND');
    node.classList.toggle('morph-change',hit&&descriptor?.type==='CHANGE');
    node.classList.toggle('morph-densify',hit&&descriptor?.type==='DENSIFY');
  });
}

export function clearMorphHighlight(container){
  if(!container)return;
  container.querySelectorAll('.morph-note,.morph-insert,.morph-extend,.morph-change,.morph-densify').forEach(node=>node.classList.remove('morph-note','morph-insert','morph-extend','morph-change','morph-densify'));
}

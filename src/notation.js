const NS='http://www.w3.org/2000/svg';
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const LETTER={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
const BASE_E4=4*7+LETTER.E;

function el(name,attrs={}){
  const n=document.createElementNS(NS,name);
  Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));
  return n;
}
function pitchStep(p){
  const m=String(p||'').match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return 4;
  return Number(m[3])*7+LETTER[m[1]]-BASE_E4;
}
function pitchY(stave,p){
  const bottom=typeof stave.getYForLine==='function'?stave.getYForLine(4):88;
  return bottom-pitchStep(p)*5;
}
function accidental(p){return String(p||'').includes('#')?'♯':String(p||'').includes('b')?'♭':'';}
function resultColor(resultNotes,n){
  if(!resultNotes||n.rest)return '#111';
  const r=resultNotes.find(x=>x.startBeat===n.startBeat&&x.target===n.pitch);
  return r ? (r.ok?'#248a67':'#d35f52') : '#111';
}
function xForBeat(beat,total,left,right){return left+(beat/Math.max(1,total))*(right-left);}
function drawLedger(svg,x,y,step){
  if(step<=-2){for(let s=-2;s>=step;s-=2){const yy=y-(s-step)*5;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
  if(step>=10){for(let s=10;s<=step;s+=2){const yy=y+(step-s)*5;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
}
function beamGroups(notes){
  const groups=[];let g=[];let bucket=null;
  const flush=()=>{if(g.length>=2)groups.push([...g]);g=[];bucket=null;};
  notes.forEach((n,i)=>{
    const b=Math.floor(n.startBeat+1e-6);
    const eighth=!n.rest&&Math.abs(n.duration-.5)<1e-6;
    if(!eighth){flush();return;}
    if(bucket!==null&&(b!==bucket||Math.abs(notes[g[g.length-1]].startBeat+.5-n.startBeat)>.01))flush();
    bucket=b;g.push(i);
  });flush();return groups;
}
function drawRest(svg,x,stave,duration){
  const y=(typeof stave.getYForLine==='function'?stave.getYForLine(2):68)+10;
  const glyph=duration===.5?'𝄾':duration===2?'𝄼':duration===4?'𝄻':'𝄽';
  const t=el('text',{x,y,'text-anchor':'middle','font-size':29,fill:'#111','font-family':'serif'});t.textContent=glyph;svg.appendChild(t);
}
function drawFlag(svg,x,y,up,color){
  const d=up?`M ${x} ${y} C ${x+12} ${y+5}, ${x+11} ${y+16}, ${x+2} ${y+21}`:`M ${x} ${y} C ${x-12} ${y-5}, ${x-11} ${y-16}, ${x-2} ${y-21}`;
  svg.appendChild(el('path',{d,fill:'none',stroke:color,'stroke-width':4,'stroke-linecap':'round'}));
}
function drawManualNotes(svg,stave,ex,left,right,resultNotes){
  const xs=ex.notes.map(n=>xForBeat(n.startBeat,ex.totalBeats,left,right));
  const ys=ex.notes.map(n=>n.rest?null:pitchY(stave,n.pitch));
  const groups=beamGroups(ex.notes);const beamMap=new Map();
  groups.forEach(indices=>{
    const avg=indices.reduce((s,i)=>s+pitchStep(ex.notes[i].pitch),0)/indices.length;const up=avg<4;
    const first=indices[0],last=indices[indices.length-1];
    const base1=ys[first]+(up?-34:34),base2=ys[last]+(up?-34:34);
    const delta=clamp(base2-base1,-8,8);const y1=base1,y2=base1+delta;
    indices.forEach(i=>{const t=(xs[i]-xs[first])/Math.max(1,xs[last]-xs[first]);beamMap.set(i,{up,beamY:y1+(y2-y1)*t});});
    svg.appendChild(el('line',{x1:xs[first]+(up?6:-6),y1,x2:xs[last]+(up?6:-6),y2,stroke:'#111','stroke-width':5.2,'stroke-linecap':'butt'}));
  });

  ex.notes.forEach((n,i)=>{
    const x=xs[i];if(n.rest){drawRest(svg,x,stave,n.duration);return;}
    const y=ys[i],step=pitchStep(n.pitch),color=resultColor(resultNotes,n);drawLedger(svg,x,y,step);
    const acc=accidental(n.pitch);if(acc){const a=el('text',{x:x-18,y:y+6,'text-anchor':'middle','font-size':22,fill:color,'font-family':'serif'});a.textContent=acc;svg.appendChild(a);}
    const filled=n.duration<=1;const head=el('ellipse',{cx:x,cy:y,rx:n.duration===4?8.8:7.2,ry:n.duration===4?5.1:4.7,fill:filled?color:'#f2ead8',stroke:color,'stroke-width':filled?1:2,transform:`rotate(-18 ${x} ${y})`});svg.appendChild(head);
    if(n.duration===4)return;
    const bm=beamMap.get(i);const up=bm?bm.up:step<4;const stemX=x+(up?6:-6);const stemEnd=bm?bm.beamY:y+(up?-34:34);
    svg.appendChild(el('line',{x1:stemX,x2:stemX,y1:y,y2:stemEnd,stroke:color,'stroke-width':1.8}));
    if(Math.abs(n.duration-.5)<1e-6&&!bm)drawFlag(svg,stemX,stemEnd,up,color);
  });
  return {xs,ys};
}
function drawBarlines(svg,ex,left,right,stave){
  const top=typeof stave.getYForLine==='function'?stave.getYForLine(0):48,bottom=typeof stave.getYForLine==='function'?stave.getYForLine(4):88;
  for(let beat=4;beat<=ex.totalBeats;beat+=4){const x=xForBeat(beat,ex.totalBeats,left,right);svg.appendChild(el('line',{x1:x,x2:x,y1:top,y2:bottom,stroke:'#111','stroke-width':beat===ex.totalBeats?1.8:1.2}));}
}
export function renderNotation(container,ex,{resultNotes=null,showTime=true}={}){
  container.innerHTML='';if(!window.VexFlow){container.innerHTML='<div class="score-error">譜面エンジンを読み込めません</div>';return;}
  const VF=window.VexFlow,W=720,H=190,renderer=new VF.Renderer(container,VF.Renderer.Backends.SVG);renderer.resize(W,H);const ctx=renderer.getContext();
  const stave=new VF.Stave(18,48,W-36);stave.addClef('treble');if(showTime)stave.addTimeSignature('4/4');stave.setContext(ctx).draw();
  const svg=container.querySelector('svg');if(!svg)return;
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width','100%');svg.removeAttribute('height');svg.style.height='auto';svg.style.display='block';
  const staveStart=typeof stave.getNoteStartX==='function'?stave.getNoteStartX():112;const staveEnd=typeof stave.getNoteEndX==='function'?stave.getNoteEndX():690;
  const left=Math.max(132,staveStart+18),right=Math.min(690,staveEnd-16);
  const {xs}=drawManualNotes(svg,stave,ex,left,right,resultNotes);drawBarlines(svg,ex,left,right,stave);
  const points=ex.notes.map((n,i)=>({beat:n.startBeat,duration:n.duration,rest:n.rest,x:clamp(xs[i]/W*100,8,96)}));
  container.dataset.timeline=JSON.stringify({points,endX:clamp(right/W*100,points[0]?.x||18,97)});
}
function percentAtBeat(timeline,ex,beat){
  const points=(timeline?.points||[]).filter(p=>!p.rest);if(!points.length)return 20+beat/ex.totalBeats*70;
  if(beat<=points[0].beat)return points[0].x;
  for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1];if(beat>=a.beat&&beat<b.beat){const t=(beat-a.beat)/Math.max(.001,b.beat-a.beat);return a.x+(b.x-a.x)*t;}}
  const last=points[points.length-1],t=clamp((beat-last.beat)/Math.max(.001,ex.totalBeats-last.beat),0,1);return last.x+((timeline?.endX||96)-last.x)*t;
}
export function playheadPercent(container,ex,progress){let timeline=null;try{timeline=JSON.parse(container?.dataset?.timeline||'null');}catch{}return percentAtBeat(timeline,ex,clamp(progress,0,1)*ex.totalBeats);}

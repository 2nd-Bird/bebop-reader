import {SCORE_W,SCORE_H,STAFF_TOP,STAFF_BOTTOM,NOTE_RIGHT,diatonicStep,noteLayout,timelineFor,percentAtBeat} from './notation/layout.js';

const NS='http://www.w3.org/2000/svg';
function el(name,attrs={}){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;}
function accidental(p){return String(p||'').includes('#')?'♯':String(p||'').includes('b')?'♭':'';}
function resultColor(resultNotes,n){if(!resultNotes||n.rest)return '#111';const r=resultNotes.find(x=>x.startBeat===n.startBeat&&x.target===n.pitch);return r?(r.ok?'#248a67':'#d35f52'):'#111';}

function drawLedger(svg,x,y,step){
  if(step<=-2){for(let s=-2;s>=step;s-=2){const yy=STAFF_BOTTOM-s*5;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
  if(step>=10){for(let s=10;s<=step;s+=2){const yy=STAFF_BOTTOM-s*5;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
}
function beamGroups(notes){const groups=[];let g=[];let bucket=null;const flush=()=>{if(g.length>=2)groups.push([...g]);g=[];bucket=null;};notes.forEach((n,i)=>{const b=Math.floor(n.startBeat+1e-6),eighth=!n.rest&&Math.abs(n.duration-.5)<1e-6;if(!eighth){flush();return;}if(bucket!==null&&(b!==bucket||Math.abs(notes[g[g.length-1]].startBeat+.5-n.startBeat)>.01))flush();bucket=b;g.push(i);});flush();return groups;}
function drawRest(svg,x,duration){const glyph=duration===.5?'𝄾':duration===2?'𝄼':duration===4?'𝄻':'𝄽';const t=el('text',{x,y:78,'text-anchor':'middle','font-size':29,fill:'#111','font-family':'serif'});t.textContent=glyph;svg.appendChild(t);}
function drawFlag(svg,x,y,up,color){const d=up?`M ${x} ${y} C ${x+12} ${y+5}, ${x+11} ${y+16}, ${x+2} ${y+21}`:`M ${x} ${y} C ${x-12} ${y-5}, ${x-11} ${y-16}, ${x-2} ${y-21}`;svg.appendChild(el('path',{d,fill:'none',stroke:color,'stroke-width':4,'stroke-linecap':'round'}));}

function drawNotes(svg,ex,resultNotes){
  const layout=noteLayout(ex),groups=beamGroups(ex.notes),beamMap=new Map();
  groups.forEach(indices=>{
    const avg=indices.reduce((s,i)=>s+diatonicStep(ex.notes[i].pitch),0)/indices.length,up=avg<4,first=indices[0],last=indices[indices.length-1];
    const firstY=layout[first].y,lastY=layout[last].y,base1=firstY+(up?-34:34),base2=lastY+(up?-34:34),delta=Math.max(-8,Math.min(8,base2-base1)),y1=base1,y2=base1+delta;
    indices.forEach(i=>{const t=(layout[i].x-layout[first].x)/Math.max(1,layout[last].x-layout[first].x);beamMap.set(i,{up,beamY:y1+(y2-y1)*t});});
    svg.appendChild(el('line',{x1:layout[first].x+(up?6:-6),y1,x2:layout[last].x+(up?6:-6),y2,stroke:'#111','stroke-width':5.2}));
  });

  layout.forEach((pos,i)=>{
    const n=ex.notes[i],x=pos.x;if(n.rest){drawRest(svg,x,n.duration);return;}
    const y=pos.y,step=diatonicStep(n.pitch),color=resultColor(resultNotes,n);drawLedger(svg,x,y,step);
    const acc=accidental(n.pitch);if(acc){const a=el('text',{x:x-18,y:y+6,'text-anchor':'middle','font-size':22,fill:color,'font-family':'serif'});a.textContent=acc;svg.appendChild(a);}
    const filled=n.duration<=1;svg.appendChild(el('ellipse',{cx:x,cy:y,rx:n.duration===4?8.8:7.2,ry:n.duration===4?5.1:4.7,fill:filled?color:'#f2ead8',stroke:color,'stroke-width':filled?1:2,transform:`rotate(-18 ${x} ${y})`,'data-note-index':i}));
    if(n.duration===4)return;
    const bm=beamMap.get(i),up=bm?bm.up:step<4,stemX=x+(up?6:-6),stemEnd=bm?bm.beamY:y+(up?-34:34);svg.appendChild(el('line',{x1:stemX,x2:stemX,y1:y,y2:stemEnd,stroke:color,'stroke-width':1.8}));if(Math.abs(n.duration-.5)<1e-6&&!bm)drawFlag(svg,stemX,stemEnd,up,color);
  });

  for(let beat=4;beat<ex.totalBeats;beat+=4){const x=150+(beat/ex.totalBeats)*(NOTE_RIGHT-150);svg.appendChild(el('line',{x1:x,x2:x,y1:STAFF_TOP,y2:STAFF_BOTTOM,stroke:'#111','stroke-width':1.2}));}
  return layout;
}

export function renderNotation(container,ex,{resultNotes=null,showTime=true}={}){
  container.innerHTML='';
  if(!window.VexFlow){container.innerHTML='<div class="score-error">譜面エンジンを読み込めません</div>';return;}
  container.style.position='relative';
  const base=document.createElement('div');base.className='score-base';container.appendChild(base);
  const VF=window.VexFlow,renderer=new VF.Renderer(base,VF.Renderer.Backends.SVG);renderer.resize(SCORE_W,SCORE_H);const ctx=renderer.getContext();
  const stave=new VF.Stave(18,48,SCORE_W-36);stave.addClef('treble');if(showTime)stave.addTimeSignature('4/4');stave.setContext(ctx).draw();
  const baseSvg=base.querySelector('svg');if(baseSvg){baseSvg.setAttribute('viewBox',`0 0 ${SCORE_W} ${SCORE_H}`);baseSvg.setAttribute('width','100%');baseSvg.removeAttribute('height');baseSvg.style.display='block';}

  const overlay=el('svg',{viewBox:`0 0 ${SCORE_W} ${SCORE_H}`,width:'100%','aria-hidden':'true'});overlay.classList.add('score-note-layer');Object.assign(overlay.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',overflow:'visible'});container.appendChild(overlay);
  const layout=drawNotes(overlay,ex,resultNotes);
  const timeline=timelineFor(ex);container.dataset.timeline=JSON.stringify(timeline);container.dataset.noteCount=String(layout.length);
}

export function playheadPercent(container,ex,progress){let timeline=null;try{timeline=JSON.parse(container?.dataset?.timeline||'null');}catch{}return percentAtBeat(timeline,ex,Math.max(0,Math.min(1,progress))*ex.totalBeats);}

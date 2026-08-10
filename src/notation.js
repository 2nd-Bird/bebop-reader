import {SCORE_H,diatonicStep,scoreWidthFor,buildGeometry,noteLayout,timelineFor,xAtBeat} from './notation/layout.js';

const NS='http://www.w3.org/2000/svg';
function el(name,attrs={}){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;}
function accidental(p){return String(p||'').includes('#')?'♯':String(p||'').includes('b')?'♭':'';}
function resultColor(resultNotes,n){if(!resultNotes||n.rest)return '#111';const r=resultNotes.find(x=>x.startBeat===n.startBeat&&x.target===n.pitch);return r?(r.readOk?'#248a67':'#d35f52'):'#111';}

function drawLedger(svg,x,y,step,g){
  if(step<=-2){for(let s=-2;s>=step;s-=2){const yy=g.staffBottom-s*g.halfStep;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
  if(step>=10){for(let s=10;s<=step;s+=2){const yy=g.staffBottom-s*g.halfStep;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
}
function beamGroups(notes){const groups=[];let g=[];let bucket=null;const flush=()=>{if(g.length>=2)groups.push([...g]);g=[];bucket=null;};notes.forEach((n,i)=>{const b=Math.floor(n.startBeat+1e-6),eighth=!n.rest&&Math.abs(n.duration-.5)<1e-6;if(!eighth){flush();return;}if(bucket!==null&&(b!==bucket||Math.abs(notes[g[g.length-1]].startBeat+.5-n.startBeat)>.01))flush();bucket=b;g.push(i);});flush();return groups;}
function drawRest(svg,x,duration,g){const glyph=duration===.5?'𝄾':duration===2?'𝄼':duration===4?'𝄻':'𝄽';const t=el('text',{x,y:(g.staffTop+g.staffBottom)/2+10,'text-anchor':'middle','font-size':29,fill:'#111','font-family':'serif'});t.textContent=glyph;svg.appendChild(t);}
function drawFlag(svg,x,y,up,color){const d=up?`M ${x} ${y} C ${x+12} ${y+5}, ${x+11} ${y+16}, ${x+2} ${y+21}`:`M ${x} ${y} C ${x-12} ${y-5}, ${x-11} ${y-16}, ${x-2} ${y-21}`;svg.appendChild(el('path',{d,fill:'none',stroke:color,'stroke-width':4,'stroke-linecap':'round'}));}

function drawNotes(svg,ex,g,resultNotes){
  const layout=noteLayout(ex,g),groups=beamGroups(ex.notes),beamMap=new Map();
  groups.forEach(indices=>{
    const avg=indices.reduce((s,i)=>s+diatonicStep(ex.notes[i].pitch),0)/indices.length,up=avg<4,first=indices[0],last=indices[indices.length-1];
    const firstY=layout[first].y,lastY=layout[last].y,base1=firstY+(up?-34:34),base2=lastY+(up?-34:34),delta=Math.max(-8,Math.min(8,base2-base1)),y1=base1,y2=base1+delta;
    indices.forEach(i=>{const t=(layout[i].x-layout[first].x)/Math.max(1,layout[last].x-layout[first].x);beamMap.set(i,{up,beamY:y1+(y2-y1)*t});});
    svg.appendChild(el('line',{x1:layout[first].x+(up?6:-6),y1,x2:layout[last].x+(up?6:-6),y2,stroke:'#111','stroke-width':5.2}));
  });
  layout.forEach((pos,i)=>{
    const n=ex.notes[i],x=pos.x;if(n.rest){drawRest(svg,x,n.duration,g);return;}
    const y=pos.y,step=diatonicStep(n.pitch),color=resultColor(resultNotes,n);drawLedger(svg,x,y,step,g);
    const acc=accidental(n.pitch);if(acc){const a=el('text',{x:x-18,y:y+6,'text-anchor':'middle','font-size':22,fill:color,'font-family':'serif'});a.textContent=acc;svg.appendChild(a);}
    const filled=n.duration<=1;svg.appendChild(el('ellipse',{cx:x,cy:y,rx:n.duration===4?8.8:7.2,ry:n.duration===4?5.1:4.7,fill:filled?color:'#f2ead8',stroke:color,'stroke-width':filled?1:2,transform:`rotate(-18 ${x} ${y})`,'data-note-index':i}));
    if(n.duration===4)return;
    const bm=beamMap.get(i),up=bm?bm.up:step<4,stemX=x+(up?6:-6),stemEnd=bm?bm.beamY:y+(up?-34:34);svg.appendChild(el('line',{x1:stemX,x2:stemX,y1:y,y2:stemEnd,stroke:color,'stroke-width':1.8}));if(Math.abs(n.duration-.5)<1e-6&&!bm)drawFlag(svg,stemX,stemEnd,up,color);
  });
  for(let beat=4;beat<=ex.totalBeats;beat+=4){const x=g.noteLeft+beat*g.beatWidth;svg.appendChild(el('line',{x1:x,x2:x,y1:g.staffTop,y2:g.staffBottom,stroke:'#111','stroke-width':beat===ex.totalBeats?1.8:1.2}));}
  return layout;
}

export function renderNotation(container,ex,{resultNotes=null,showTime=true}={}){
  container.innerHTML='';if(!window.VexFlow){container.innerHTML='<div class="score-error">譜面エンジンを読み込めません</div>';return null;}
  const viewport=container.parentElement;const viewportWidth=Math.max(280,viewport?.clientWidth||340);const canvasWidth=scoreWidthFor(ex,viewportWidth);
  container.style.position='relative';container.style.width=`${canvasWidth}px`;container.style.height=`${SCORE_H}px`;
  const base=document.createElement('div');base.className='score-base';base.style.width=`${canvasWidth}px`;base.style.height=`${SCORE_H}px`;container.appendChild(base);
  const VF=window.VexFlow,renderer=new VF.Renderer(base,VF.Renderer.Backends.SVG);renderer.resize(canvasWidth,SCORE_H);const ctx=renderer.getContext();
  const stave=new VF.Stave(10,24,canvasWidth-20);stave.addClef('treble');if(showTime)stave.addTimeSignature('4/4');stave.setContext(ctx).draw();
  const y0=stave.getYForLine(0),y4=stave.getYForLine(4);const g=buildGeometry(ex,{canvasWidth,staffY0:y0,staffY4:y4,noteStartX:stave.getNoteStartX()+10});
  const baseSvg=base.querySelector('svg');if(baseSvg){baseSvg.setAttribute('viewBox',`0 0 ${canvasWidth} ${SCORE_H}`);baseSvg.setAttribute('width',canvasWidth);baseSvg.setAttribute('height',SCORE_H);baseSvg.style.display='block';}
  const overlay=el('svg',{viewBox:`0 0 ${canvasWidth} ${SCORE_H}`,width:canvasWidth,height:SCORE_H,'aria-hidden':'true'});overlay.classList.add('score-note-layer');Object.assign(overlay.style,{position:'absolute',inset:'0',width:`${canvasWidth}px`,height:`${SCORE_H}px`,pointerEvents:'none',overflow:'visible'});container.appendChild(overlay);
  const layout=drawNotes(overlay,ex,g,resultNotes);const timeline=timelineFor(ex,g);container.dataset.timeline=JSON.stringify(timeline);container.dataset.noteCount=String(layout.length);container.dataset.scoreWidth=String(canvasWidth);
  viewport?.classList.toggle('score-scrollable',canvasWidth>viewportWidth+4);return {canvasWidth,geometry:g,layout,timeline};
}

export function playheadX(container,ex,progress){let timeline=null;try{timeline=JSON.parse(container?.dataset?.timeline||'null');}catch{}return xAtBeat(timeline,ex,Math.max(0,Math.min(1,progress))*ex.totalBeats);}

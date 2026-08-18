import {SCORE_H,diatonicStep,scoreWidthFor,buildGeometry,noteLayout,timelineFor,xAtBeat,beatX} from './notation/layout.js';

const NS='http://www.w3.org/2000/svg';
const KEY_ACCIDENTALS={F:{B:'b'},Bb:{B:'b',E:'b'}};
function el(name,attrs={}){const n=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,String(v)));return n;}
function accidentalGlyph(token){return token==='#'?'♯':token==='b'?'♭':token==='n'?'♮':'';}
export function displayAccidental(pitch,key='C'){
  const m=String(pitch||'').match(/^([A-G])([#b]?)(-?\d+)$/);if(!m)return '';
  const [,letter,actual]=m,expected=KEY_ACCIDENTALS[key]?.[letter]||'';
  if(actual===expected)return '';
  if(!actual&&expected)return '♮';
  return accidentalGlyph(actual);
}
function resultColor(resultNotes,n){if(!resultNotes||n.rest)return '#111';const r=resultNotes.find(x=>x.startBeat===n.startBeat&&x.target===n.pitch);return r?(r.readOk?'#248a67':'#d35f52'):'#111';}
export const flagCountForDuration=duration=>duration<=.25+1e-9?2:duration<=.5+1e-9?1:0;

function drawLedger(svg,x,y,step,g){
  if(step<=-2){for(let s=-2;s>=step;s-=2){const yy=g.staffBottom-s*g.halfStep;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
  if(step>=10){for(let s=10;s<=step;s+=2){const yy=g.staffBottom-s*g.halfStep;svg.appendChild(el('line',{x1:x-12,x2:x+12,y1:yy,y2:yy,stroke:'#111','stroke-width':1.4}));}}
}
function beamGroups(notes){
  const groups=[];let g=[];let bucket=null;
  const flush=()=>{if(g.length>=2)groups.push([...g]);g=[];bucket=null;};
  notes.forEach((n,i)=>{
    const b=Math.floor(n.startBeat+1e-6),beamable=!n.rest&&flagCountForDuration(n.duration)>0;
    if(!beamable){flush();return;}
    if(g.length){const prev=notes[g[g.length-1]],contiguous=Math.abs(prev.startBeat+prev.duration-n.startBeat)<.01;if(b!==bucket||!contiguous)flush();}
    bucket=b;g.push(i);
  });
  flush();return groups;
}
function drawRest(svg,x,duration,g){const glyph=duration<=.25+1e-9?'𝄿':duration<=.5+1e-9?'𝄾':duration===2?'𝄼':duration===4?'𝄻':'𝄽';const t=el('text',{x,y:(g.staffTop+g.staffBottom)/2+10,'text-anchor':'middle','font-size':29,fill:'#111','font-family':'serif'});t.textContent=glyph;svg.appendChild(t);}
function drawFlag(svg,x,y,up,color){const d=up?`M ${x} ${y} C ${x+12} ${y+5}, ${x+11} ${y+16}, ${x+2} ${y+21}`:`M ${x} ${y} C ${x-12} ${y-5}, ${x-11} ${y-16}, ${x-2} ${y-21}`;svg.appendChild(el('path',{d,fill:'none',stroke:color,'stroke-width':4,'stroke-linecap':'round'}));}
function drawHarmony(svg,ex,g){
  const timeline=ex.harmonyTimeline?.length?ex.harmonyTimeline:(ex.chords?.[0]?[{beat:0,chord:ex.chords[0]}]:[]);
  timeline.forEach((h,i)=>{const x=beatX(h.beat,g)+(i===0?2:4),t=el('text',{x,y:17,'font-size':13,'font-weight':700,fill:'#6f5b31','font-family':'ui-sans-serif,system-ui,sans-serif','data-harmony-beat':h.beat});t.textContent=h.chord;svg.appendChild(t);if(i>0)svg.appendChild(el('line',{x1:beatX(h.beat,g),x2:beatX(h.beat,g),y1:20,y2:g.staffTop-3,stroke:'#b79a5a','stroke-width':1,'stroke-dasharray':'2 2'}));});
}

function drawNotes(svg,ex,g,resultNotes){
  const layout=noteLayout(ex,g),groups=beamGroups(ex.notes),beamMap=new Map();
  groups.forEach(indices=>{
    const avg=indices.reduce((s,i)=>s+diatonicStep(ex.notes[i].pitch),0)/indices.length,up=avg<4,first=indices[0],last=indices[indices.length-1];
    const firstY=layout[first].y,lastY=layout[last].y,base1=firstY+(up?-34:34),base2=lastY+(up?-34:34),delta=Math.max(-8,Math.min(8,base2-base1)),y1=base1,y2=base1+delta;
    indices.forEach(i=>{const t=(layout[i].x-layout[first].x)/Math.max(1,layout[last].x-layout[first].x);beamMap.set(i,{up,beamY:y1+(y2-y1)*t});});
    svg.appendChild(el('line',{x1:layout[first].x+(up?6:-6),y1,x2:layout[last].x+(up?6:-6),y2,stroke:'#111','stroke-width':5.2}));
    const sixteenthRuns=[];let run=[];const flushRun=()=>{if(run.length)sixteenthRuns.push([...run]);run=[];};
    indices.forEach(i=>{if(flagCountForDuration(ex.notes[i].duration)>=2)run.push(i);else flushRun();});flushRun();
    for(const r of sixteenthRuns){
      const offset=up?7:-7;
      if(r.length>=2){const a=r[0],b=r[r.length-1],ay=beamMap.get(a).beamY+offset,by=beamMap.get(b).beamY+offset;svg.appendChild(el('line',{x1:layout[a].x+(up?6:-6),y1:ay,x2:layout[b].x+(up?6:-6),y2:by,stroke:'#111','stroke-width':4.2}));}
      else{const i=r[0],bm=beamMap.get(i),stemX=layout[i].x+(up?6:-6),towardNext=i!==indices[indices.length-1],dx=towardNext?(up?10:-10):(up?-10:10),y=bm.beamY+offset;svg.appendChild(el('line',{x1:stemX,y1:y,x2:stemX+dx,y2:y,stroke:'#111','stroke-width':4.2}));}
    }
  });
  layout.forEach((pos,i)=>{
    const n=ex.notes[i],x=pos.x;if(n.rest){drawRest(svg,x,n.duration,g);return;}
    const y=pos.y,step=diatonicStep(n.pitch),color=resultColor(resultNotes,n);drawLedger(svg,x,y,step,g);
    const acc=displayAccidental(n.pitch,ex.key||'C');if(acc){const a=el('text',{x:x-18,y:y+6,'text-anchor':'middle','font-size':22,fill:color,'font-family':'serif'});a.textContent=acc;svg.appendChild(a);}
    const filled=n.duration<=1;svg.appendChild(el('ellipse',{cx:x,cy:y,rx:n.duration===4?8.8:7.2,ry:n.duration===4?5.1:4.7,fill:filled?color:'#f2ead8',stroke:color,'stroke-width':filled?1:2,transform:`rotate(-18 ${x} ${y})`,'data-note-index':i}));
    if(n.duration===4)return;
    const bm=beamMap.get(i),up=bm?bm.up:step<4,stemX=x+(up?6:-6),stemEnd=bm?bm.beamY:y+(up?-34:34);svg.appendChild(el('line',{x1:stemX,x2:stemX,y1:y,y2:stemEnd,stroke:color,'stroke-width':1.8}));
    if(!bm){const flags=flagCountForDuration(n.duration);for(let f=0;f<flags;f++)drawFlag(svg,stemX,stemEnd+(up?7:-7)*f,up,color);}
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
  const stave=new VF.Stave(10,24,canvasWidth-20);stave.addClef('treble');if(ex.key&&ex.key!=='C')stave.addKeySignature(ex.key);if(showTime)stave.addTimeSignature('4/4');stave.setContext(ctx).draw();
  const y0=stave.getYForLine(0),y4=stave.getYForLine(4);const g=buildGeometry(ex,{canvasWidth,staffY0:y0,staffY4:y4,noteStartX:stave.getNoteStartX()+10});
  const baseSvg=base.querySelector('svg');if(baseSvg){baseSvg.setAttribute('viewBox',`0 0 ${canvasWidth} ${SCORE_H}`);baseSvg.setAttribute('width',canvasWidth);baseSvg.setAttribute('height',SCORE_H);baseSvg.style.display='block';}
  const overlay=el('svg',{viewBox:`0 0 ${canvasWidth} ${SCORE_H}`,width:canvasWidth,height:SCORE_H,'aria-hidden':'true'});overlay.classList.add('score-note-layer');Object.assign(overlay.style,{position:'absolute',inset:'0',width:`${canvasWidth}px`,height:`${SCORE_H}px`,pointerEvents:'none',overflow:'visible'});container.appendChild(overlay);
  drawHarmony(overlay,ex,g);const layout=drawNotes(overlay,ex,g,resultNotes);const timeline=timelineFor(ex,g);container.dataset.timeline=JSON.stringify(timeline);container.dataset.noteCount=String(layout.length);container.dataset.scoreWidth=String(canvasWidth);
  viewport?.classList.toggle('score-scrollable',canvasWidth>viewportWidth+4);return {canvasWidth,geometry:g,layout,timeline};
}

export function playheadX(container,ex,progress){let timeline=null;try{timeline=JSON.parse(container?.dataset?.timeline||'null');}catch{}return xAtBeat(timeline,ex,Math.max(0,Math.min(1,progress))*ex.totalBeats);}

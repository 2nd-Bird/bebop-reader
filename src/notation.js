const DUR = d => d===.5?'8':d===1?'q':d===2?'h':d===4?'w':'q';
const vexKey = p => p ? `${p[0].toLowerCase()}${p.includes('#')?'#':p.includes('b')?'b':''}/${p.match(/\d+/)?.[0]||4}` : 'b/4';
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));

function percentAtBeat(timeline,ex,beat){
  const points=timeline?.points||[];
  if(!points.length)return 18+beat/ex.totalBeats*74;
  if(beat<=points[0].beat)return points[0].x;
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1];
    if(beat>=a.beat&&beat<b.beat){
      const t=(beat-a.beat)/Math.max(.001,b.beat-a.beat);
      return a.x+(b.x-a.x)*t;
    }
  }
  const last=points[points.length-1];
  const t=clamp((beat-last.beat)/Math.max(.001,ex.totalBeats-last.beat));
  return last.x+((timeline.endX||96)-last.x)*t;
}

function drawMeasureLines(svg,timeline,ex){
  if(!svg||ex.totalBeats<=4)return;
  const NS='http://www.w3.org/2000/svg';
  for(let beat=4;beat<ex.totalBeats;beat+=4){
    const x=720*percentAtBeat(timeline,ex,beat)/100;
    const line=document.createElementNS(NS,'line');
    line.setAttribute('x1',x);line.setAttribute('x2',x);
    line.setAttribute('y1','48');line.setAttribute('y2','88');
    line.setAttribute('stroke','#111');line.setAttribute('stroke-width','1.5');
    line.setAttribute('data-barline','true');svg.appendChild(line);
  }
}

export function renderNotation(container,ex,{resultNotes=null,showTime=true}={}){
  container.innerHTML='';
  if(!window.VexFlow){container.innerHTML='<div class="score-error">譜面エンジンを読み込めません</div>';return;}
  const VF=window.VexFlow,W=720,H=190;
  const renderer=new VF.Renderer(container,VF.Renderer.Backends.SVG);
  renderer.resize(W,H);const ctx=renderer.getContext();
  const stave=new VF.Stave(18,48,W-36);
  stave.addClef('treble');if(showTime)stave.addTimeSignature('4/4');stave.setContext(ctx).draw();

  const vnotes=ex.notes.map(n=>{
    const duration=DUR(n.duration)+(n.rest?'r':'');
    const sn=new VF.StaveNote({clef:'treble',keys:[vexKey(n.pitch)],duration});
    if(resultNotes&&!n.rest){
      const r=resultNotes.find(x=>x.startBeat===n.startBeat&&x.target===n.pitch);
      sn.setStyle({fillStyle:r?.ok?'#248a67':'#d35f52',strokeStyle:r?.ok?'#248a67':'#d35f52'});
    }
    return sn;
  });

  // VexFlow's official single-voice helper. It formats every tickable and auto-beams 8ths.
  VF.Formatter.FormatAndDraw(ctx,stave,vnotes,{autoBeam:true,alignRests:true});

  const noteStart=typeof stave.getNoteStartX==='function'?stave.getNoteStartX()+8:120;
  const noteEnd=typeof stave.getNoteEndX==='function'?stave.getNoteEndX()-12:690;
  const span=Math.max(80,noteEnd-noteStart);
  const points=vnotes.map((v,i)=>{
    const raw=typeof v.getAbsoluteX==='function'?v.getAbsoluteX():NaN;
    const fallback=noteStart+(ex.notes[i].startBeat/Math.max(1,ex.totalBeats))*span;
    const px=Number.isFinite(raw)&&raw>noteStart-30&&raw<noteEnd+30?raw:fallback;
    return {beat:ex.notes[i].startBeat,duration:ex.notes[i].duration,rest:ex.notes[i].rest,x:clamp(px/W*100,8,96)};
  });
  const last=points[points.length-1];
  const endX=clamp(noteEnd/W*100,points[0]?.x||18,97);
  const timeline={points,endX};container.dataset.timeline=JSON.stringify(timeline);

  const svg=container.querySelector('svg');
  if(svg){
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width','100%');svg.removeAttribute('height');svg.style.height='auto';svg.style.display='block';
    drawMeasureLines(svg,timeline,ex);
  }
}

export function playheadPercent(container,ex,progress){
  let timeline=null;try{timeline=JSON.parse(container?.dataset?.timeline||'null');}catch{}
  return percentAtBeat(timeline,ex,clamp(progress,0,1)*ex.totalBeats);
}

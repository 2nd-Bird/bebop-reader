const DUR = d => d===.5?'8':d===1?'q':d===2?'h':d===4?'w':'q';
const vexKey = p => p ? `${p[0].toLowerCase()}${p.includes('#')?'#':p.includes('b')?'b':''}/${p.match(/\d+/)?.[0]||4}` : 'b/4';
export function renderNotation(container,ex,{resultNotes=null,showTime=true}={}){
  container.innerHTML=''; if(!window.VexFlow){container.innerHTML='<div class="score-error">譜面エンジンを読み込めません</div>';return;}
  const VF=window.VexFlow; const W=720,H=190; const renderer=new VF.Renderer(container,VF.Renderer.Backends.SVG);renderer.resize(W,H);const ctx=renderer.getContext();
  const stave=new VF.Stave(18,48,W-36);stave.addClef('treble'); if(showTime)stave.addTimeSignature('4/4');stave.setContext(ctx).draw();
  const vnotes=ex.notes.map((n,i)=>{
    const duration=DUR(n.duration)+(n.rest?'r':''); const sn=new VF.StaveNote({clef:'treble',keys:[vexKey(n.pitch)],duration});
    if(resultNotes&&!n.rest){const r=resultNotes.find(x=>x.startBeat===n.startBeat&&x.target===n.pitch);sn.setStyle({fillStyle:r?.ok?'#248a67':'#d35f52',strokeStyle:r?.ok?'#248a67':'#d35f52'});}
    return sn;
  });
  const voice=new VF.Voice({num_beats:ex.totalBeats,beat_value:4}).setStrict(false);voice.addTickables(vnotes);
  new VF.Formatter().joinVoices([voice]).format([voice],W-120);voice.draw(ctx,stave);
  const svg=container.querySelector('svg');if(svg){svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width','100%');svg.removeAttribute('height');svg.style.height='auto';svg.style.display='block';}
}

const NS='http://www.w3.org/2000/svg';
function targetAt(ex,t){const spb=60/ex.bpm;return ex.notes.find(n=>!n.rest&&t>=n.startBeat*spb-.04&&t<=(n.startBeat+n.duration)*spb+.04)||null;}
export function renderPitchGuide(container,ex,result){
  container.innerHTML='';
  const trace=result?.trace||[],voiced=ex.notes.filter(n=>!n.rest);if(!voiced.length)return;
  const W=720,H=230,left=24,right=18,top=22,bottom=28,totalSec=ex.totalBeats*60/ex.bpm;
  const targetMidis=voiced.map(n=>n.midi),traceMidis=trace.map(p=>p.midi).filter(Number.isFinite);
  const lo=Math.floor(Math.min(...targetMidis,...(traceMidis.length?traceMidis:targetMidis))-2),hi=Math.ceil(Math.max(...targetMidis,...(traceMidis.length?traceMidis:targetMidis))+2);
  const y=m=>top+(hi-m)/Math.max(1,hi-lo)*(H-top-bottom),x=t=>left+t/totalSec*(W-left-right);
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.setAttribute('width','100%');svg.classList.add('pitch-guide-svg');
  for(let b=0;b<=ex.totalBeats;b++){const ln=document.createElementNS(NS,'line'),xx=x(b*60/ex.bpm);ln.setAttribute('x1',xx);ln.setAttribute('x2',xx);ln.setAttribute('y1',top);ln.setAttribute('y2',H-bottom);ln.setAttribute('class',b%4===0?'guide-grid measure':'guide-grid');svg.appendChild(ln);}
  voiced.forEach(n=>{const r=document.createElementNS(NS,'rect'),start=n.startBeat*60/ex.bpm,end=(n.startBeat+n.duration)*60/ex.bpm;r.setAttribute('x',x(start));r.setAttribute('y',y(n.midi)-6);r.setAttribute('width',Math.max(5,x(end)-x(start)-2));r.setAttribute('height','12');r.setAttribute('rx','6');r.setAttribute('class','target-note-bar');svg.appendChild(r);});
  for(let i=1;i<trace.length;i++){
    const a=trace[i-1],b=trace[i];if(b.t-a.t>.12)continue;const target=targetAt(ex,(a.t+b.t)/2);if(!target)continue;
    const err=Math.abs(((a.midi+b.midi)/2-target.midi)*100),line=document.createElementNS(NS,'line');
    line.setAttribute('x1',x(a.t));line.setAttribute('y1',y(a.midi));line.setAttribute('x2',x(b.t));line.setAttribute('y2',y(b.midi));line.setAttribute('class',err<=40?'sung-trace hit':err<=80?'sung-trace near':'sung-trace miss');svg.appendChild(line);
  }
  container.appendChild(svg);
}

const LETTER={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
const BASE_E4=4*7+LETTER.E;
export const SCORE_H=178;
const LEFT_GUTTER=112;
const RIGHT_PAD=22;
const MIN_BEAT_PX=52;
const MIN_NOTE_PX=24;

export function diatonicStep(pitch){
  const m=String(pitch||'').match(/^([A-G])([#b]?)(-?\d+)$/);
  if(!m)return 0;
  return Number(m[3])*7+LETTER[m[1]]-BASE_E4;
}

function maxStartsPerBeat(ex){
  const buckets=new Map();
  ex.notes.forEach(n=>{const b=Math.floor(n.startBeat+1e-6);buckets.set(b,(buckets.get(b)||0)+1);});
  return Math.max(1,...buckets.values());
}

export function scoreWidthFor(ex,viewportWidth=340){
  const beatWidth=Math.max(MIN_BEAT_PX,maxStartsPerBeat(ex)*MIN_NOTE_PX);
  const content=LEFT_GUTTER+ex.totalBeats*beatWidth+RIGHT_PAD;
  return Math.max(Math.floor(viewportWidth||340),content);
}

export function buildGeometry(ex,{canvasWidth,staffY0,staffY4,noteStartX}={}){
  const staffTop=Math.min(staffY0??70,staffY4??110);
  const staffBottom=Math.max(staffY0??70,staffY4??110);
  const lineGap=(staffBottom-staffTop)/4;
  const halfStep=lineGap/2;
  const noteLeft=Math.max(LEFT_GUTTER,Number(noteStartX)||LEFT_GUTTER);
  const available=Math.max(120,(canvasWidth||340)-noteLeft-RIGHT_PAD);
  const beatWidth=available/Math.max(1,ex.totalBeats);
  const noteRight=noteLeft+ex.totalBeats*beatWidth;
  return {canvasWidth,staffTop,staffBottom,lineGap,halfStep,noteLeft,noteRight,beatWidth};
}

export function pitchY(pitch,g){return g.staffBottom-diatonicStep(pitch)*g.halfStep;}
export function beatX(beat,g){return g.noteLeft+beat*g.beatWidth;}

export function noteLayout(ex,g){
  return ex.notes.map((n,index)=>({index,beat:n.startBeat,duration:n.duration,rest:n.rest,pitch:n.pitch,x:beatX(n.startBeat,g),y:n.rest?null:pitchY(n.pitch,g)}));
}

export function timelineFor(ex,g){
  const items=noteLayout(ex,g);
  return {points:items.map(n=>({beat:n.beat,duration:n.duration,rest:n.rest,x:n.x})),endX:g.noteRight,canvasWidth:g.canvasWidth};
}

export function xAtBeat(timeline,ex,beat){
  const points=(timeline?.points||[]).filter(p=>!p.rest);
  if(!points.length)return LEFT_GUTTER;
  if(beat<=points[0].beat)return points[0].x;
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1];
    if(beat>=a.beat&&beat<b.beat){const t=(beat-a.beat)/Math.max(.001,b.beat-a.beat);return a.x+(b.x-a.x)*t;}
  }
  const last=points[points.length-1];
  const t=Math.max(0,Math.min(1,(beat-last.beat)/Math.max(.001,ex.totalBeats-last.beat)));
  return last.x+((timeline?.endX||last.x)-last.x)*t;
}

const LETTER={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
const BASE_E4=4*7+LETTER.E;
export const SCORE_W=720;
export const SCORE_H=190;
export const STAFF_TOP=48;
export const STAFF_BOTTOM=88;
export const NOTE_LEFT=150;
export const NOTE_RIGHT=682;

export function diatonicStep(pitch){
  const m=String(pitch||'').match(/^([A-G])([#b]?)(-?\d+)$/);
  if(!m)return 0;
  return Number(m[3])*7+LETTER[m[1]]-BASE_E4;
}

export const pitchY=pitch=>STAFF_BOTTOM-diatonicStep(pitch)*5;
export const beatX=(beat,totalBeats)=>NOTE_LEFT+(beat/Math.max(1,totalBeats))*(NOTE_RIGHT-NOTE_LEFT);

export function noteLayout(ex){
  return ex.notes.map((n,index)=>({
    index,
    beat:n.startBeat,
    duration:n.duration,
    rest:n.rest,
    pitch:n.pitch,
    x:beatX(n.startBeat,ex.totalBeats),
    y:n.rest?null:pitchY(n.pitch),
  }));
}

export function timelineFor(ex){
  const items=noteLayout(ex);
  return {points:items.map(n=>({beat:n.beat,duration:n.duration,rest:n.rest,x:n.x/SCORE_W*100})),endX:NOTE_RIGHT/SCORE_W*100};
}

export function percentAtBeat(timeline,ex,beat){
  const points=(timeline?.points||[]).filter(p=>!p.rest);
  if(!points.length)return NOTE_LEFT/SCORE_W*100;
  if(beat<=points[0].beat)return points[0].x;
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1];
    if(beat>=a.beat&&beat<b.beat){
      const t=(beat-a.beat)/Math.max(.001,b.beat-a.beat);
      return a.x+(b.x-a.x)*t;
    }
  }
  const last=points[points.length-1];
  const t=Math.max(0,Math.min(1,(beat-last.beat)/Math.max(.001,ex.totalBeats-last.beat)));
  return last.x+((timeline?.endX||NOTE_RIGHT/SCORE_W*100)-last.x)*t;
}

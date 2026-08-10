import {playheadX} from '../notation.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export function resetFollower(score,viewport,playhead,ex){
  if(viewport)viewport.scrollLeft=0;
  const x=playheadX(score,ex,0);
  if(playhead)playhead.style.left=`${x}px`;
  return x;
}

export function updateFollower(score,viewport,playhead,ex,progress,{autoScroll=true}={}){
  if(!score||!viewport||!playhead)return 0;
  const x=playheadX(score,ex,progress);
  const maxScroll=Math.max(0,score.scrollWidth-viewport.clientWidth);
  if(autoScroll&&maxScroll>2){
    const anchor=viewport.clientWidth*.38;
    const target=clamp(x-anchor,0,maxScroll);
    viewport.scrollLeft=target;
  }
  playhead.style.left=`${x-viewport.scrollLeft}px`;
  return x;
}

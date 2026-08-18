import {scoreAttempt} from '../scoring.js';

const avg=(rows,key)=>rows.length?rows.reduce((sum,row)=>sum+Number(row?.[key]||0),0)/rows.length:0;
const round=n=>Math.round(Number(n)||0);
const starsFor=(readScore,noteAccuracy)=>readScore>=92&&noteAccuracy>=90?5:readScore>=80&&noteAccuracy>=75?4:readScore>=65&&noteAccuracy>=55?3:readScore>=45?2:1;

export function scoreFreeFlow({event,samples=[],latencyMs=0}={}){
 const slots=event?.freeFlowSlots||[],bpm=Number(event?.scoreModel?.bpm||60),spb=60/bpm;
 if(!slots.length)throw new Error(`${event?.eventId||'FREE_FLOW'}: freeFlowSlots are required`);
 const matchedBars=[];
 for(const slot of slots){
  const startSec=Number(slot.beat)*spb,endSec=(Number(slot.beat)+4)*spb;
  const slotSamples=samples.filter(s=>s.t>=startSec-.2&&s.t<=endSec+.2).map(s=>({...s,t:s.t-startSec}));
  const candidates=(slot.candidateModels||[]).map(model=>({variantId:model.sourceVariantId,result:scoreAttempt(model,slotSamples,latencyMs)}));
  if(!candidates.length)throw new Error(`${event.eventId}: bar ${slot.barIndex+1} has no FREE_FLOW candidates`);
  candidates.sort((a,b)=>b.result.readScore-a.result.readScore||b.result.noteAccuracy-a.result.noteAccuracy||b.result.flow-a.result.flow);
  const best=candidates[0];
  matchedBars.push({barIndex:slot.barIndex,beat:slot.beat,cue:Boolean(slot.cue),visibleVariantId:slot.visibleVariantId||null,matchedVariantId:best.variantId,...best.result});
 }
 const cueBars=matchedBars.filter(row=>row.cue),freeBars=matchedBars.filter(row=>!row.cue),successfulFree=freeBars.filter(row=>row.readScore>=65),diversity=[...new Set(successfulFree.map(row=>row.matchedVariantId))];
 const continuity=round(avg(matchedBars,'continuity')),noteAccuracy=round(avg(matchedBars,'noteAccuracy')),timingCoarse=round(avg(matchedBars,'timingCoarse')),pitch=round(avg(matchedBars,'pitch')),time=round(avg(matchedBars,'time')),flow=continuity,readScore=round(avg(matchedBars,'readScore')),overall=round((pitch+time+flow)/3);
 const cuePassed=cueBars.length===3&&cueBars.every(row=>row.readScore>=65),freeFlowPassed=continuity>=70&&cuePassed&&successfulFree.length>=7&&diversity.length>=2;
 const notes=matchedBars.flatMap(row=>(row.notes||[]).map(note=>({...note,startBeat:Number(note.startBeat)+row.beat,barIndex:row.barIndex,matchedVariantId:row.matchedVariantId})));
 const trace=matchedBars.flatMap(row=>(row.trace||[]).map(point=>({...point,t:Number((Number(point.t)+row.beat*spb).toFixed(3)),barIndex:row.barIndex}))).sort((a,b)=>a.t-b.t);
 const sampleCount=matchedBars.reduce((sum,row)=>sum+(row.sampleCount||0),0),pitchedFrameCount=matchedBars.reduce((sum,row)=>sum+(row.pitchedFrameCount||0),0),maxRms=Math.max(0,...matchedBars.map(row=>Number(row.maxRms)||0));
 const stars=starsFor(readScore,noteAccuracy),coaching=freeFlowPassed?'合図から、既知の動きを止めずにつなげた。':'合図を受けて、知っている動きを拍の中でつなごう。';
 return{mode:'free-flow',stars,readScore,noteAccuracy,timingCoarse,continuity,pitch,time,flow,overall,notes,trace,sampleCount,pitchedFrameCount,maxRms,pitchMode:'movable-do-octave-folded',matchedBars,successfulFreeBars:successfulFree.length,freeBarCount:freeBars.length,matchedVariantIds:diversity,variantDiversity:diversity.length,cuePassed,freeFlowPassed,coaching};
}

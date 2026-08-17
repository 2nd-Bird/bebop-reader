import { EXERCISES } from './exercises.js';
import { mutateV3 } from './storage-v3.js';
const KEY='bebop-reader-state-v2';
const defaults={
  mastery:{}, attempts:{}, streak:0,lastPracticeDate:null,totalAttempts:0,
  settings:{solfege:false, preferredBpm:72, latencyMs:0},
  session:[],sessionIndex:0,lastResult:null
};
export function loadState(){
  try { const raw=JSON.parse(localStorage.getItem(KEY)||'{}');return {...defaults,...raw,settings:{...defaults.settings,...(raw.settings||{})}}; }
  catch { return structuredClone(defaults); }
}
export function saveState(s){localStorage.setItem(KEY,JSON.stringify(s));}
export function mutate(fn){const s=loadState();fn(s);saveState(s);return s;}
export function masteryOf(id){return loadState().mastery[id]||0;}
export function recordAttempt(exercise,result){
  return mutate(s=>{
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    if(s.lastPracticeDate!==today){
      if(s.lastPracticeDate){const d=(new Date(today)-new Date(s.lastPracticeDate))/86400000;s.streak=d===1?s.streak+1:1;} else s.streak=1;
      s.lastPracticeDate=today;
    }
    s.totalAttempts=(s.totalAttempts||0)+1;
    s.attempts[exercise.id]=(s.attempts[exercise.id]||0)+1;
    if(result.mode==='mic'){
      let m=s.mastery[exercise.id]||0;
      if(result.stars>=5)m=Math.min(5,m+1);
      else if(result.stars===4)m=Math.min(5,m+.75);
      else if(result.stars===3)m=Math.min(5,m+.25);
      s.mastery[exercise.id]=m;
    }
    s.lastResult={...result,exerciseId:exercise.id,at:Date.now()};
  });
}
export function setSettings(patch){
  const legacy=mutate(s=>Object.assign(s.settings,patch));
  try{mutateV3(s=>Object.assign(s.settings,patch));}catch{}
  return legacy;
}
export function cMastery(){const s=loadState();return EXERCISES.length?Math.round(EXERCISES.reduce((a,e)=>a+(s.mastery[e.id]||0),0)/(5*EXERCISES.length)*100):0;}
export const storageKey=KEY;

import { primeAudio } from '../audio/context.js';
import { schedulerSignals } from '../curriculum/mastery.js';
import { STAGES } from '../curriculum/stages.js';
import { buildDailySessionPlan } from '../curriculum/scheduler.js';
import { loadStateV3, beginSessionV3, recordSessionEventV3, completeSessionV3 } from '../storage-v3.js';
import { createSessionView } from '../ui/sessionView.js';
import { createSessionEngine } from './engine.js';

export function mountSession({ app, navigate }) {
  const params=new URLSearchParams(location.search),state=loadStateV3(),override=Number(params.get('stage')),maxStage=STAGES.length-1;
  const currentStage=Number.isInteger(override)&&override>=0&&override<=maxStage?override:state.stageProgress.currentStage;
  const debug=params.get('debug')==='1',signals=schedulerSignals(state);
  const formId=debug&&params.get('form')?params.get('form'):null;
  const requestedFlow=debug?(params.get('flow')||'').toUpperCase():'';
  const flowActionOverride=['REPEAT','MUTATION','CONNECT','TRADE','RECALL','ONE_CHORUS'].includes(requestedFlow)?requestedFlow:null;
  const requestedKey=debug?(params.get('key')||'C'):'C',key=debug&&['C','F','Bb'].includes(requestedKey)?requestedKey:'C';
  const requestedEvents=debug?Number(params.get('events')):NaN,requestedBeats=debug?Number(params.get('beats')):NaN;
  const eventCount=Number.isInteger(requestedEvents)&&requestedEvents>=1&&requestedEvents<=20?requestedEvents:20;
  const targetSessionBeats=Number.isFinite(requestedBeats)&&requestedBeats>=16?requestedBeats:320;
  const plan = buildDailySessionPlan({ currentStage, key, bpm: 60, eventCount, targetSessionBeats, formId, flowActionOverride, ...signals });
  const view = createSessionView({ app, navigate, key:plan.key });
  const latencyMs = state.settings?.latencyMs || 0,persistSession=!(debug&&plan.key!=='C');
  const engine = createSessionEngine({ plan, view, latencyMs, onEventResult:persistSession?(event,result)=>recordSessionEventV3(event,result):null, onSessionComplete:persistSession?(summary)=>completeSessionV3(plan,summary):null });
  view.bindStart({ onPointerDown: () => primeAudio(), onClick: () => { if(persistSession)beginSessionV3(plan);engine.start(); } });
  return () => engine.stop();
}

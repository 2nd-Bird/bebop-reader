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
  const flowActionOverride=['CONNECT','TRADE','RECALL'].includes(requestedFlow)?requestedFlow:null;
  const requestedEvents=debug?Number(params.get('events')):NaN,requestedBeats=debug?Number(params.get('beats')):NaN;
  const eventCount=Number.isInteger(requestedEvents)&&requestedEvents>=1&&requestedEvents<=20?requestedEvents:20;
  const targetSessionBeats=Number.isFinite(requestedBeats)&&requestedBeats>=16?requestedBeats:320;
  const plan = buildDailySessionPlan({ currentStage, key: 'C', bpm: 60, eventCount, targetSessionBeats, formId, flowActionOverride, ...signals });
  const view = createSessionView({ app, navigate });
  const latencyMs = state.settings?.latencyMs || 0;
  const engine = createSessionEngine({ plan, view, latencyMs, onEventResult:(event,result)=>recordSessionEventV3(event,result), onSessionComplete:(summary)=>completeSessionV3(plan,summary) });
  view.bindStart({ onPointerDown: () => primeAudio(), onClick: () => { beginSessionV3(plan); engine.start(); } });
  return () => engine.stop();
}

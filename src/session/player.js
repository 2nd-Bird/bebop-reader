import { primeAudio } from '../audio/context.js';
import { schedulerSignals } from '../curriculum/mastery.js';
import { buildDailySessionPlan } from '../curriculum/scheduler.js';
import { loadStateV3, beginSessionV3, recordSessionEventV3, completeSessionV3 } from '../storage-v3.js';
import { createSessionView } from '../ui/sessionView.js';
import { createSessionEngine } from './engine.js';

export function mountSession({ app, navigate }) {
  const state=loadStateV3(),override=Number(new URLSearchParams(location.search).get('stage'));
  const currentStage=Number.isInteger(override)&&override>=0&&override<=3?override:state.stageProgress.currentStage;
  const signals=schedulerSignals(state);
  const plan = buildDailySessionPlan({ currentStage, key: 'C', bpm: 60, eventCount: 20, ...signals });
  const view = createSessionView({ app, navigate });
  const latencyMs = state.settings?.latencyMs || 0;
  const engine = createSessionEngine({ plan, view, latencyMs, onEventResult:(event,result)=>recordSessionEventV3(event,result), onSessionComplete:(summary)=>completeSessionV3(plan,summary) });
  view.bindStart({ onPointerDown: () => primeAudio(), onClick: () => { beginSessionV3(plan); engine.start(); } });
  return () => engine.stop();
}

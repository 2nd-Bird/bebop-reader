import { primeAudio } from '../audio/context.js';
import { buildDailySessionPlan } from '../curriculum/scheduler.js';
import { loadState } from '../storage.js';
import { createSessionView } from '../ui/sessionView.js';
import { createSessionEngine } from './engine.js';

export function mountSession({ app, navigate }) {
  const plan = buildDailySessionPlan({ currentStage: 3, key: 'C', bpm: 60, eventCount: 20 });
  const view = createSessionView({ app, navigate });
  const latencyMs = loadState().settings?.latencyMs || 0;
  const engine = createSessionEngine({ plan, view, latencyMs });
  view.bindStart({ onPointerDown: () => primeAudio(), onClick: () => engine.start() });
  return () => engine.stop();
}

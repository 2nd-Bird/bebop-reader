import { scoreAttempt } from '../scoring.js';
import { scoreFreeFlow } from './freeFlowScoring.js';

export function scoreEvent({ event, scoreModel, samples, transport, latencyMs = 0 }) {
  const startTime = transport.timeAtBeat(event.singStartBeat);
  const endTime = transport.timeAtBeat(event.singEndBeat);
  const relative = samples
    .filter(s => s.t >= startTime - 0.2 && s.t <= endTime + 0.2)
    .map(s => ({ ...s, t: s.t - startTime }));
  const result = event?.scoringPolicy==='FREE_FLOW'?scoreFreeFlow({event,samples:relative,latencyMs}):scoreAttempt(scoreModel, relative, latencyMs);
  return { ...result, eventId: event.eventId, familyId: event.familyId || null, variantId: event.variantId || scoreModel.id };
}

import { scoreAttempt } from '../scoring.js';

const guideModelFor=(scoreModel,transport)=>({
  id:scoreModel.id||scoreModel.sourceVariantId||'session-event',
  key:scoreModel.key||'C',
  bpm:Number(scoreModel.bpm)||Number(transport?.bpm)||60,
  totalBeats:Number(scoreModel.totalBeats)||4,
  notes:(scoreModel.notes||[]).map(n=>({pitch:n.pitch,midi:n.midi,startBeat:n.startBeat,duration:n.duration,rest:Boolean(n.rest)})),
});

export function scoreEvent({ event, scoreModel, samples, transport, latencyMs = 0 }) {
  const startTime = transport.timeAtBeat(event.singStartBeat);
  const endTime = transport.timeAtBeat(event.singEndBeat);
  const relative = samples
    .filter(s => s.t >= startTime - 0.2 && s.t <= endTime + 0.2)
    .map(s => ({ ...s, t: s.t - startTime }));
  const result = scoreAttempt(scoreModel, relative, latencyMs);
  return { ...result, eventId: event.eventId, familyId: event.familyId || null, variantId: event.variantId || scoreModel.id, scoreGuideModel:guideModelFor(scoreModel,transport) };
}

const avg = (items, key) => items.length ? items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length : 0;

function starsFor(readScore, noteAccuracy, voicedEvents) {
  if (!voicedEvents) return 0;
  if (readScore >= 92 && noteAccuracy >= 90) return 5;
  if (readScore >= 80 && noteAccuracy >= 75) return 4;
  if (readScore >= 65 && noteAccuracy >= 55) return 3;
  if (readScore >= 45) return 2;
  return 1;
}

export function summarizeSession(eventResults) {
  const micResults = eventResults.filter(r => r?.mode === 'mic');
  const readScore = Math.round(avg(micResults, 'readScore'));
  const noteAccuracy = Math.round(avg(micResults, 'noteAccuracy'));
  const timingCoarse = Math.round(avg(micResults, 'timingCoarse'));
  const continuity = Math.round(avg(micResults, 'continuity'));
  const pitch = Math.round(avg(micResults, 'pitch'));
  const time = Math.round(avg(micResults, 'time'));
  const flow = Math.round(avg(micResults, 'flow'));
  const voicedEvents = micResults.filter(r => (r.pitchedFrameCount || 0) > 0).length;
  const stars = starsFor(readScore, noteAccuracy, voicedEvents);
  return { mode: 'mic', stars, readScore, noteAccuracy, timingCoarse, continuity, pitch, time, flow, eventCount: eventResults.length, voicedEvents, eventResults };
}

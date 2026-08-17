import { findExercise } from '../exercises.js';

export function buildTransportDemoPlan() {
  const ids = ['p01', 'p02', 'p03', 'p05', 'p10'];
  const sequence = Array.from({ length: 20 }, (_, i) => ids[i % ids.length]);
  const events = sequence.map((id, i) => {
    const scoreModel = findExercise(id);
    const startBeat = i * 16;
    return {
      eventId: `transport-${String(i + 1).padStart(2, '0')}`,
      familyId: `legacy-${id}`,
      variantId: id,
      startBeat,
      prepareBeat: startBeat + 4,
      singStartBeat: startBeat + 8,
      singEndBeat: startBeat + 12,
      endBeat: startBeat + 16,
      presentationMode: 'COLD_READ',
      scoringPolicy: 'READING',
      scoreModel,
    };
  });
  return {
    sessionId: 'v09-transport-demo',
    bpm: 60,
    key: 'C',
    form: 'training-4',
    beatsPerBar: 4,
    countInBars: 1,
    events,
    totalBars: events.length * 4,
    totalBeats: events.length * 16,
  };
}

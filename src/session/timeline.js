const endBeatOf = e => e.endBeat ?? e.feedbackEndBeat ?? e.singEndBeat;

export function createTimeline(sessionPlan) {
  const events = [...(sessionPlan.events || [])].sort((a, b) => a.startBeat - b.startBeat);

  function validate() {
    let previousEnd = -Infinity;
    const ids = new Set();
    for (const event of events) {
      if (!event.eventId) throw new Error('eventId is required');
      if (ids.has(event.eventId)) throw new Error(`duplicate eventId: ${event.eventId}`);
      ids.add(event.eventId);
      const endBeat = endBeatOf(event);
      for (const key of ['startBeat', 'prepareBeat', 'singStartBeat', 'singEndBeat']) {
        if (!Number.isFinite(event[key])) throw new Error(`${event.eventId}: ${key} must be finite`);
      }
      if (!(event.startBeat <= event.prepareBeat && event.prepareBeat <= event.singStartBeat && event.singStartBeat < event.singEndBeat && event.singEndBeat <= endBeat)) {
        throw new Error(`${event.eventId}: invalid event phase ordering`);
      }
      if (event.startBeat < previousEnd - 1e-9) throw new Error(`${event.eventId}: event overlap`);
      previousEnd = endBeat;
    }
    if (Number.isFinite(sessionPlan.totalBeats) && events.length && previousEnd > sessionPlan.totalBeats + 1e-9) {
      throw new Error('events exceed session totalBeats');
    }
    return true;
  }

  function eventAtBeat(beat) {
    return events.find(e => beat >= e.startBeat && beat < endBeatOf(e)) || null;
  }

  function phaseAtBeat(beat) {
    const event = eventAtBeat(beat);
    if (!event) return { event: null, phase: 'SPACE' };
    if (event.modelStartBeat != null && beat >= event.modelStartBeat && beat < event.modelEndBeat) return { event, phase: 'MODEL' };
    if (beat < event.prepareBeat) return { event, phase: 'SPACE' };
    if (beat < event.singStartBeat) return { event, phase: 'AUDIATE' };
    if (beat < event.singEndBeat) return { event, phase: 'SING' };
    return { event, phase: 'FEEDBACK' };
  }

  function nextEvent(beat) {
    return events.find(e => e.startBeat > beat) || null;
  }

  validate();
  return { events, validate, eventAtBeat, phaseAtBeat, nextEvent };
}

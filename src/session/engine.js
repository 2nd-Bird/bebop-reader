import { ensureAudio, getAudioContext } from '../audio/context.js';
import { scheduleCountIn } from '../audio/countIn.js';
import { startGroove } from '../audio/groove.js';
import { initMic, startSessionCapture, stopSessionCapture, getSessionSamples, stopMic } from '../mic.js';
import { scoreEvent } from '../scoring/eventScoring.js';
import { summarizeSession } from '../scoring/sessionScoring.js';
import { createTransport } from './transport.js';
import { createTimeline } from './timeline.js';

const clamp01 = n => Math.max(0, Math.min(1, n));

export function createSessionEngine({ plan, view, latencyMs = 0 }) {
  const timeline = createTimeline(plan);
  let transport = null;
  let grooveStop = null;
  let raf = 0;
  let running = false;
  let displayedEventId = null;
  let lastPhase = null;
  const scored = new Set();
  const results = [];

  function scoreOne(event, samples = getSessionSamples()) {
    if (!event || scored.has(event.eventId)) return null;
    const result = scoreEvent({ event, scoreModel: event.scoreModel, samples, transport, latencyMs });
    scored.add(event.eventId);
    results.push(result);
    return result;
  }

  async function finish() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
    const samples = stopSessionCapture();
    for (const event of timeline.events) {
      if (!scored.has(event.eventId) && transport.currentBeat() >= event.singEndBeat) scoreOne(event, samples);
    }
    grooveStop?.();
    transport.stop();
    stopMic();
    view.setCount(null);
    view.showSummary(summarizeSession(results));
  }

  function frame() {
    if (!running) return;
    const beat = transport.currentBeat();
    const pos = transport.position();
    if (beat >= plan.totalBeats) { finish(); return; }

    if (beat < 0) {
      const countInBeats = plan.countInBars * plan.beatsPerBar;
      const countNo = Math.max(1, Math.min(countInBeats, Math.floor(beat) + countInBeats + 1));
      view.setCount(countNo);
      view.setPhase('SPACE');
      view.update({ beat, bar: 0, beatInBar: countNo, totalBeats: plan.totalBeats, progress: 0, event: null, phase: 'COUNT_IN' });
      raf = requestAnimationFrame(frame);
      return;
    }

    view.setCount(null);
    const { event, phase } = timeline.phaseAtBeat(beat);
    if (event && beat >= event.prepareBeat && displayedEventId !== event.eventId) {
      displayedEventId = event.eventId;
      view.showEvent(event, event.scoreModel);
    }
    if (phase !== lastPhase) {
      lastPhase = phase;
      view.setPhase(phase);
    }
    if (event && beat >= event.singEndBeat && !scored.has(event.eventId)) {
      const result = scoreOne(event);
      if (result) view.showFeedback(result);
    }
    const noteProgress = event ? clamp01((beat - event.singStartBeat) / (event.singEndBeat - event.singStartBeat)) : 0;
    view.update({ beat, bar: pos.bar, beatInBar: pos.beatInBar, totalBeats: plan.totalBeats, progress: noteProgress, event, phase });
    raf = requestAnimationFrame(frame);
  }

  return {
    async start() {
      if (running) return;
      try {
        view.setStarting();
        await Promise.all([ensureAudio(), initMic()]);
        const ctx = getAudioContext();
        transport = createTransport({ audioContext: ctx, bpm: plan.bpm, beatsPerBar: plan.beatsPerBar });
        const countInBeats = plan.countInBars * plan.beatsPerBar;
        const origin = ctx.currentTime + countInBeats * transport.secondsPerBeat + 0.12;
        transport.startAt(origin);
        scheduleCountIn(transport, { fromBeat: -countInBeats, toBeat: 0 });
        await startSessionCapture();
        grooveStop = startGroove({ transport, key: plan.key });
        running = true;
        raf = requestAnimationFrame(frame);
      } catch (error) {
        running = false;
        grooveStop?.();
        stopSessionCapture();
        stopMic();
        view.showError(error);
      }
    },

    stop() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      grooveStop?.();
      stopSessionCapture();
      transport?.stop();
      stopMic();
      document.body.classList.remove('attempting');
    },
  };
}

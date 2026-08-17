import { ensureAudio, getAudioContext } from '../audio/context.js';
import { scheduleCountIn } from '../audio/countIn.js';
import { startGroove } from '../audio/groove.js';
import { scheduleModelPhrase } from '../audio/model.js';
import { findEchoSlot, scheduleDelayedRetry } from '../curriculum/recovery.js';
import { initMic, startSessionCapture, stopSessionCapture, getSessionSamples, stopMic } from '../mic.js';
import { scoreEvent } from '../scoring/eventScoring.js';
import { summarizeSession } from '../scoring/sessionScoring.js';
import { createTransport } from './transport.js';
import { createTimeline } from './timeline.js';

const clamp01 = n => Math.max(0, Math.min(1, n));

export function createSessionEngine({ plan, view, latencyMs = 0, onEventResult = null, onSessionComplete = null }) {
  const timeline = createTimeline(plan);
  let transport = null, grooveStop = null, raf = 0, running = false, interrupted = false;
  let activeEventId = null, displayedEventId = null, lastPhase = null, audioContext = null;
  const scored = new Set(), results = [], modelStops = [], occupiedEchoSlots = new Set(), echoWindows = [];

  const cancelModels = () => { modelStops.splice(0).forEach(stop => stop?.()); };
  const stopOutput = () => { grooveStop?.(); grooveStop = null; cancelModels(); };

  function scheduleFutureModels(fromBeat = 0) {
    for (const event of timeline.events) {
      if (event.modelPolicy === 'TEACHER_CALL' && event.modelStartBeat >= fromBeat) {
        modelStops.push(scheduleModelPhrase({ transport, scoreModel: event.scoreModel, startBeat: event.modelStartBeat, volume: .18, type: 'triangle' }));
      }
    }
    for (const echo of echoWindows) {
      if (echo.startBeat < fromBeat) continue;
      const source = timeline.events.find(event => event.eventId === echo.sourceEventId);
      if (source) modelStops.push(scheduleModelPhrase({ transport, scoreModel: source.scoreModel, startBeat: echo.startBeat, volume: .18, type: 'triangle' }));
    }
  }

  function startOutput(fromBeat = 0) {
    grooveStop = startGroove({ transport, key: plan.key, totalBeats: plan.totalBeats, fromBeat, primeBeats: 16, lookaheadSec: 8 });
    scheduleFutureModels(fromBeat);
  }

  function scheduleRecovery(event,result){
    if(!event||!result||result.stars>=3)return;
    const echoSlot=findEchoSlot(timeline.events,event,occupiedEchoSlots);
    if(echoSlot){
      occupiedEchoSlots.add(echoSlot.eventId);
      echoWindows.push({eventId:echoSlot.eventId,startBeat:echoSlot.startBeat,endBeat:echoSlot.prepareBeat,sourceEventId:event.eventId});
      if(!interrupted) modelStops.push(scheduleModelPhrase({transport,scoreModel:event.scoreModel,startBeat:echoSlot.startBeat,volume:.18,type:'triangle'}));
    }
    scheduleDelayedRetry(timeline.events,event,{minGapEvents:2});
  }

  function scoreOne(event, samples = getSessionSamples()) {
    if (!event || scored.has(event.eventId)) return null;
    const result = scoreEvent({ event, scoreModel: event.scoreModel, samples, transport, latencyMs });
    scored.add(event.eventId); results.push(result); scheduleRecovery(event,result); onEventResult?.(event,result); return result;
  }

  function detachLifecycle() {
    document.removeEventListener('visibilitychange', onVisibilityChange);
    audioContext?.removeEventListener?.('statechange', onAudioStateChange);
  }

  function interrupt(reason = 'background') {
    if (!running || interrupted || !transport) return;
    const beat = transport.currentBeat();
    const state = beat >= 0 ? timeline.phaseAtBeat(beat) : { event: null, phase: 'COUNT_IN' };
    const samples = stopSessionCapture();

    // If the answer window finished, preserve the completed attempt. If it was cut in half,
    // do not penalize the learner; reserve a later retry and mark this slot handled.
    if (state.event && !scored.has(state.event.eventId)) {
      if (beat >= state.event.singEndBeat) scoreOne(state.event, samples);
      else if (beat >= state.event.singStartBeat) {
        scored.add(state.event.eventId);
        scheduleDelayedRetry(timeline.events, state.event, { minGapEvents: 1 });
      }
    }

    transport.pause();
    stopOutput();
    cancelAnimationFrame(raf);
    interrupted = true;
    document.body.classList.remove('attempting');
    view.showInterrupted({ reason, onResume: resume });
  }

  async function resume() {
    if (!running || !interrupted || !transport) return;
    try {
      view.setResuming();
      await ensureAudio();
      const boundary = transport.resumeAtBoundary({ boundaryBeats: 16, leadSec: .35 });
      activeEventId = null; displayedEventId = null; lastPhase = null;
      view.clearScore();
      startOutput(boundary);
      await startSessionCapture();
      interrupted = false;
      view.setRunning();
      raf = requestAnimationFrame(frame);
    } catch (error) {
      view.showInterrupted({ reason: 'audio', onResume: resume, error });
    }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'hidden') interrupt('background');
  }

  function onAudioStateChange() {
    if (running && !interrupted && audioContext && audioContext.state !== 'running') interrupt('audio');
  }

  async function finish() {
    if (!running) return;
    running = false; interrupted = false; cancelAnimationFrame(raf); detachLifecycle();
    const samples = stopSessionCapture();
    for (const event of timeline.events) if (!scored.has(event.eventId) && transport.currentBeat() >= event.singEndBeat) scoreOne(event, samples);
    stopOutput(); transport.stop(); stopMic(); view.setCount(null);
    const summary=summarizeSession(results);onSessionComplete?.(summary,plan);view.showSummary(summary);
  }

  function frame() {
    if (!running || interrupted) return;
    const beat = transport.currentBeat(), pos = transport.position();
    if (beat >= plan.totalBeats) { finish(); return; }
    if (beat < 0) {
      const countInBeats = plan.countInBars * plan.beatsPerBar;
      const countNo = Math.max(1, Math.min(countInBeats, Math.floor(beat) + countInBeats + 1));
      view.setCount(countNo); if (lastPhase !== 'COUNT_IN') { lastPhase = 'COUNT_IN'; view.setPhase('SPACE'); }
      view.update({ beat, bar: 0, beatInBar: countNo, totalBeats: plan.totalBeats, progress: 0, event: null, phase: 'COUNT_IN', audio: grooveStop?.status?.() || null });
      raf = requestAnimationFrame(frame); return;
    }
    view.setCount(null);
    const state = timeline.phaseAtBeat(beat), event = state.event;
    let phase = state.phase;
    const echo = echoWindows.find(x=>beat>=x.startBeat&&beat<x.endBeat); if(echo)phase='ECHO';
    if (event?.eventId !== activeEventId) { activeEventId = event?.eventId || null; displayedEventId = null; view.clearScore(); }
    if (event && beat >= event.prepareBeat && displayedEventId !== event.eventId) { displayedEventId = event.eventId; view.showEvent(event, event.scoreModel); }
    if (phase !== lastPhase) { lastPhase = phase; view.setPhase(phase); }
    if (event && beat >= event.singEndBeat && !scored.has(event.eventId)) { const result = scoreOne(event); if (result) view.showFeedback(result); }
    const noteProgress = event ? clamp01((beat - event.singStartBeat) / (event.singEndBeat - event.singStartBeat)) : 0;
    view.update({ beat, bar: pos.bar, beatInBar: pos.beatInBar, totalBeats: plan.totalBeats, progress: noteProgress, event, phase, audio: grooveStop?.status?.() || null });
    raf = requestAnimationFrame(frame);
  }

  return {
    async start() {
      if (running) return;
      try {
        view.setStarting(); await Promise.all([ensureAudio(), initMic()]);
        audioContext = getAudioContext(); transport = createTransport({ audioContext, bpm: plan.bpm, beatsPerBar: plan.beatsPerBar });
        const countInBeats = plan.countInBars * plan.beatsPerBar, origin = audioContext.currentTime + countInBeats * transport.secondsPerBeat + 0.12;
        transport.startAt(origin);
        scheduleCountIn(transport, { fromBeat: -countInBeats, toBeat: 0 });
        startOutput(0);
        await startSessionCapture();
        document.addEventListener('visibilitychange', onVisibilityChange);
        audioContext.addEventListener?.('statechange', onAudioStateChange);
        view.setRunning(); running = true; raf = requestAnimationFrame(frame);
      } catch (error) { running = false; interrupted = false; stopOutput(); stopSessionCapture(); stopMic(); detachLifecycle(); view.showError(error); }
    },
    stop() {
      if (!running) return;
      running = false; interrupted = false; cancelAnimationFrame(raf); detachLifecycle(); stopOutput(); stopSessionCapture(); transport?.stop(); stopMic(); document.body.classList.remove('attempting');
    },
  };
}

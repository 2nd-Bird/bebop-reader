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
  let transport = null, grooveStop = null, raf = 0, running = false;
  let activeEventId = null, displayedEventId = null, lastPhase = null;
  const scored = new Set(), results = [], modelStops = [], occupiedEchoSlots = new Set(), echoWindows = [];

  function scheduleRecovery(event,result){
    if(!event||!result||result.stars>=3)return;
    const echoSlot=findEchoSlot(timeline.events,event,occupiedEchoSlots);
    if(echoSlot){occupiedEchoSlots.add(echoSlot.eventId);modelStops.push(scheduleModelPhrase({transport,scoreModel:event.scoreModel,startBeat:echoSlot.startBeat,volume:.105,type:'triangle'}));echoWindows.push({eventId:echoSlot.eventId,startBeat:echoSlot.startBeat,endBeat:echoSlot.prepareBeat,sourceEventId:event.eventId});}
    scheduleDelayedRetry(timeline.events,event,{minGapEvents:2});
  }

  function scoreOne(event, samples = getSessionSamples()) {
    if (!event || scored.has(event.eventId)) return null;
    const result = scoreEvent({ event, scoreModel: event.scoreModel, samples, transport, latencyMs });
    scored.add(event.eventId); results.push(result); scheduleRecovery(event,result); onEventResult?.(event,result); return result;
  }

  async function finish() {
    if (!running) return;
    running = false; cancelAnimationFrame(raf);
    const samples = stopSessionCapture();
    for (const event of timeline.events) if (!scored.has(event.eventId) && transport.currentBeat() >= event.singEndBeat) scoreOne(event, samples);
    grooveStop?.(); modelStops.forEach(stop=>stop?.()); transport.stop(); stopMic(); view.setCount(null);
    const summary=summarizeSession(results);onSessionComplete?.(summary,plan);view.showSummary(summary);
  }

  function frame() {
    if (!running) return;
    const beat = transport.currentBeat(), pos = transport.position();
    if (beat >= plan.totalBeats) { finish(); return; }
    if (beat < 0) {
      const countInBeats = plan.countInBars * plan.beatsPerBar;
      const countNo = Math.max(1, Math.min(countInBeats, Math.floor(beat) + countInBeats + 1));
      view.setCount(countNo); if (lastPhase !== 'COUNT_IN') { lastPhase = 'COUNT_IN'; view.setPhase('SPACE'); }
      view.update({ beat, bar: 0, beatInBar: countNo, totalBeats: plan.totalBeats, progress: 0, event: null, phase: 'COUNT_IN' });
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
    view.update({ beat, bar: pos.bar, beatInBar: pos.beatInBar, totalBeats: plan.totalBeats, progress: noteProgress, event, phase });
    raf = requestAnimationFrame(frame);
  }

  return {
    async start() {
      if (running) return;
      try {
        view.setStarting(); await Promise.all([ensureAudio(), initMic()]);
        const ctx = getAudioContext(); transport = createTransport({ audioContext: ctx, bpm: plan.bpm, beatsPerBar: plan.beatsPerBar });
        const countInBeats = plan.countInBars * plan.beatsPerBar, origin = ctx.currentTime + countInBeats * transport.secondsPerBeat + 0.12;
        transport.startAt(origin); scheduleCountIn(transport, { fromBeat: -countInBeats, toBeat: 0 }); await startSessionCapture();
        grooveStop = startGroove({ transport, key: plan.key });
        for(const event of timeline.events) if(event.modelPolicy==='TEACHER_CALL') modelStops.push(scheduleModelPhrase({transport,scoreModel:event.scoreModel,startBeat:event.modelStartBeat,volume:.1}));
        view.setRunning(); running = true; raf = requestAnimationFrame(frame);
      } catch (error) { running = false; grooveStop?.(); modelStops.forEach(stop=>stop?.()); stopSessionCapture(); stopMic(); view.showError(error); }
    },
    stop() { if (!running) return; running = false; cancelAnimationFrame(raf); grooveStop?.(); modelStops.forEach(stop=>stop?.()); stopSessionCapture(); transport?.stop(); stopMic(); document.body.classList.remove('attempting'); },
  };
}

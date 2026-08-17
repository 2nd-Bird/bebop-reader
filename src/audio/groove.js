import { getAudioContext, getMasterBus } from './context.js';
import { scheduleClickAtTime } from './countIn.js';

const KEY_FREQ = { C: 130.81 };

function scheduleTone({ time, freq, duration, volume, type = 'sine' }) {
  const ctx = getAudioContext();
  const out = getMasterBus();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), time + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(gain);
  gain.connect(out);
  osc.start(time);
  osc.stop(time + duration + 0.02);
  return () => { try { osc.stop(); } catch {} };
}

export function grooveEvents({ fromBeat = 0, toBeat = 16, key = 'C', beatsPerBar = 4 } = {}) {
  const root = KEY_FREQ[key] || KEY_FREQ.C;
  const events = [];
  for (let beat = Math.max(0, Math.ceil(fromBeat)); beat < toBeat; beat += 1) {
    const beatInBar = beat % beatsPerBar;
    events.push({ kind: 'click', beat, accent: beatInBar === 0, level: beatInBar === 0 ? 0.95 : 0.72 });
    if (beatInBar === 0) events.push({ kind: 'tone', beat, freq: root, durationBeats: 0.72, volume: 0.18, type: 'triangle' });
    if (beatInBar === 2) events.push({ kind: 'tone', beat, freq: root * 1.5, durationBeats: 0.55, volume: 0.12, type: 'triangle' });
  }
  return events;
}

export function startGroove({ transport, key = 'C', totalBeats = Infinity, fromBeat = 0, lookaheadSec = 8, intervalMs = 500, primeBeats = 16 } = {}) {
  const ctx = getAudioContext();
  let nextBeat = Math.max(0, Math.ceil(fromBeat));
  let stopped = false;
  let scheduledBeats = nextBeat;
  const cancelNodes = [];

  const scheduleThroughBeat = beatLimit => {
    const endBeat = Math.min(totalBeats, Math.max(nextBeat, Math.ceil(beatLimit)));
    if (endBeat <= nextBeat) return;
    for (const event of grooveEvents({ fromBeat: nextBeat, toBeat: endBeat, key, beatsPerBar: transport.beatsPerBar })) {
      const scheduledTime = transport.timeAtBeat(event.beat);
      if (scheduledTime < ctx.currentTime - 0.03) continue;
      const time = Math.max(scheduledTime, ctx.currentTime + 0.008);
      if (event.kind === 'click') {
        cancelNodes.push(scheduleClickAtTime(time, { accent: event.accent, level: event.level }));
      } else {
        cancelNodes.push(scheduleTone({
          time,
          freq: event.freq,
          duration: Math.max(0.04, event.durationBeats * transport.secondsPerBeat),
          volume: event.volume,
          type: event.type,
        }));
      }
    }
    scheduledBeats = Math.max(scheduledBeats, endBeat);
    nextBeat = endBeat;
  };

  // Prime four bars on the AudioContext clock. On resume, prime from the chosen event boundary.
  scheduleThroughBeat(Math.min(totalBeats, nextBeat + primeBeats));

  const schedule = () => {
    if (stopped || transport.state === 'stopped' || transport.state === 'paused') return;
    const horizonBeat = transport.beatAtTime(ctx.currentTime + lookaheadSec);
    scheduleThroughBeat(horizonBeat);
  };

  const timer = setInterval(schedule, intervalMs);
  const stop = () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
    for (const cancel of cancelNodes) cancel();
  };
  stop.status = () => ({ nextBeat, scheduledBeats, lookaheadSec, contextState: ctx.state });
  return stop;
}

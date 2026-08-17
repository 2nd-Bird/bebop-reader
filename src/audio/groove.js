import { getAudioContext, getMasterBus } from './context.js';

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
}

export function grooveEvents({ fromBeat = 0, toBeat = 16, key = 'C', beatsPerBar = 4 } = {}) {
  const root = KEY_FREQ[key] || KEY_FREQ.C;
  const events = [];
  for (let beat = Math.max(0, Math.ceil(fromBeat)); beat < toBeat; beat += 1) {
    const beatInBar = beat % beatsPerBar;
    events.push({ beat, freq: beatInBar === 0 ? 1760 : 1320, durationBeats: 0.055, volume: beatInBar === 0 ? 0.18 : 0.115, type: 'square' });
    if (beatInBar === 0) events.push({ beat, freq: root, durationBeats: 0.72, volume: 0.16, type: 'triangle' });
    if (beatInBar === 2) events.push({ beat, freq: root * 1.5, durationBeats: 0.55, volume: 0.10, type: 'triangle' });
  }
  return events;
}

export function startGroove({ transport, key = 'C', totalBeats = Infinity, lookaheadSec = 8, intervalMs = 500, primeBeats = 16 } = {}) {
  const ctx = getAudioContext();
  let nextBeat = 0;
  let stopped = false;
  let scheduledBeats = 0;

  const scheduleThroughBeat = beatLimit => {
    const endBeat = Math.min(totalBeats, Math.max(nextBeat, Math.floor(beatLimit) + 1));
    if (endBeat <= nextBeat) return;
    for (const event of grooveEvents({ fromBeat: nextBeat, toBeat: endBeat, key, beatsPerBar: transport.beatsPerBar })) {
      const time = transport.timeAtBeat(event.beat);
      if (time < ctx.currentTime - 0.03) continue;
      scheduleTone({
        time: Math.max(time, ctx.currentTime + 0.008),
        freq: event.freq,
        duration: Math.max(0.04, event.durationBeats * transport.secondsPerBeat),
        volume: event.volume,
        type: event.type,
      });
    }
    scheduledBeats = Math.max(scheduledBeats, endBeat);
    nextBeat = endBeat;
  };

  // iOS Safari can delay short JS timers while the mic analyser is busy. Prime four bars now,
  // while START still has a healthy count-in lead, then maintain a wide absolute-time horizon.
  scheduleThroughBeat(Math.min(totalBeats, primeBeats));

  const schedule = () => {
    if (stopped || transport.state === 'stopped') return;
    const horizonBeat = transport.beatAtTime(ctx.currentTime + lookaheadSec);
    scheduleThroughBeat(horizonBeat);
  };

  const timer = setInterval(schedule, intervalMs);
  const stop = () => { stopped = true; clearInterval(timer); };
  stop.status = () => ({ nextBeat, scheduledBeats, lookaheadSec, contextState: ctx.state });
  return stop;
}

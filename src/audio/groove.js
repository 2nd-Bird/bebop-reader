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

export function startGroove({ transport, key = 'C', lookaheadSec = 0.2, intervalMs = 50 } = {}) {
  const ctx = getAudioContext();
  const root = KEY_FREQ[key] || KEY_FREQ.C;
  let nextBeat = 0;
  let stopped = false;

  const schedule = () => {
    if (stopped || transport.state === 'stopped') return;
    const horizon = ctx.currentTime + lookaheadSec;
    while (transport.timeAtBeat(nextBeat) <= horizon) {
      const time = transport.timeAtBeat(nextBeat);
      if (time >= ctx.currentTime - 0.015) {
        const beatInBar = nextBeat % transport.beatsPerBar;
        scheduleTone({ time, freq: beatInBar === 0 ? 1760 : 1320, duration: 0.045, volume: beatInBar === 0 ? 0.07 : 0.045, type: 'square' });
        if (beatInBar === 0) scheduleTone({ time, freq: root, duration: transport.secondsPerBeat * 0.72, volume: 0.09, type: 'triangle' });
        if (beatInBar === 2) scheduleTone({ time, freq: root * 1.5, duration: transport.secondsPerBeat * 0.55, volume: 0.055, type: 'triangle' });
      }
      nextBeat += 1;
    }
  };

  schedule();
  const timer = setInterval(schedule, intervalMs);
  return () => {
    stopped = true;
    clearInterval(timer);
  };
}

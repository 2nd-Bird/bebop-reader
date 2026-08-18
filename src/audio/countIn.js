import { getAudioContext, getMasterBus } from './context.js';

function scheduleClick(time, accent) {
  const ctx = getAudioContext();
  const out = getMasterBus();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(accent ? 1174.66 : 880, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(accent ? 0.32 : 0.22, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
  osc.connect(gain);
  gain.connect(out);
  osc.start(time);
  osc.stop(time + 0.075);
}

export function scheduleCountIn(transport, { fromBeat = -4, toBeat = 0 } = {}) {
  const scheduled = [];
  for (let beat = fromBeat; beat < toBeat; beat += 1) {
    const time = transport.timeAtBeat(beat);
    scheduleClick(time, beat === fromBeat);
    scheduled.push({ beat, time });
  }
  return scheduled;
}

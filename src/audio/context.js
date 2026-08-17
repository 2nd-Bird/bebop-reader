let ctx = null;
let master = null;

export function getAudioContext() {
  if (!ctx || ctx.state === 'closed') {
    ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
    master = null;
  }
  return ctx;
}

export function getMasterBus() {
  const c = getAudioContext();
  if (!master) {
    master = c.createGain();
    master.gain.value = 0.82;
    master.connect(c.destination);
  }
  return master;
}

function silentPing() {
  const c = getAudioContext();
  const out = getMasterBus();
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = c.currentTime + 0.001;
  osc.frequency.setValueAtTime(440, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.00035, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
  osc.connect(gain);
  gain.connect(out);
  osc.start(t);
  osc.stop(t + 0.022);
}

export function primeAudio() {
  const c = getAudioContext();
  try {
    if (c.state !== 'running') c.resume();
    silentPing();
  } catch {}
  return c.state;
}

export async function ensureAudio() {
  const c = getAudioContext();
  if (c.state !== 'running') await c.resume();
  if (c.state !== 'running') {
    throw new Error('音声出力を開始できません。もう一度タップしてください');
  }
  getMasterBus();
  return c.state;
}

export function audioTime() {
  return getAudioContext().currentTime;
}

export function audioStatus() {
  return ctx?.state || 'uninitialized';
}

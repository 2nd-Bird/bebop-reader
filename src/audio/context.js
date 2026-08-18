let ctx = null;
let master = null;
let audioSessionState = { supported: false, type: 'unavailable', lastRequested: null, error: null };

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

function setAudioSessionType(type) {
  const session = navigator.audioSession;
  if (!session || !('type' in session)) {
    audioSessionState = { supported: false, type: 'unavailable', lastRequested: type, error: null };
    return audioSessionState;
  }
  try {
    session.type = type;
    audioSessionState = { supported: true, type: session.type, lastRequested: type, error: null };
  } catch (error) {
    audioSessionState = { supported: true, type: session.type || 'unknown', lastRequested: type, error: String(error?.message || error) };
  }
  return audioSessionState;
}

// WebKit may change the native audio category when getUserMedia starts. Reset before capture,
// then explicitly request the simultaneous playback/recording category after capture begins.
export function prepareDuplexAudioSession() {
  return setAudioSessionType('auto');
}

export function activateDuplexAudioSession() {
  return setAudioSessionType('play-and-record');
}

export function restorePlaybackAudioSession() {
  const session = navigator.audioSession;
  if (!session || !('type' in session)) return audioSessionState;
  try { session.type = 'playback'; } catch {}
  try { session.type = 'auto'; } catch {}
  audioSessionState = { supported: true, type: session.type || 'auto', lastRequested: 'auto', error: null };
  return audioSessionState;
}

export function audioSessionStatus() {
  const session = navigator.audioSession;
  if (session && 'type' in session) return { ...audioSessionState, supported: true, type: session.type || audioSessionState.type };
  return { ...audioSessionState };
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

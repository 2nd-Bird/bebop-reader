const mod = (n, d) => ((n % d) + d) % d;

export function createTransport({ audioContext, bpm, beatsPerBar = 4 }) {
  if (!audioContext) throw new Error('audioContext is required');
  if (!(bpm > 0)) throw new Error('bpm must be > 0');
  if (!(beatsPerBar > 0)) throw new Error('beatsPerBar must be > 0');

  const secondsPerBeat = 60 / bpm;
  let originTime = null;
  let state = 'idle';
  let pausedBeat = 0;

  const requireStarted = () => {
    if (originTime == null) throw new Error('transport has not started');
  };

  return {
    bpm,
    beatsPerBar,
    secondsPerBeat,

    get state() { return state; },
    get originTime() { return originTime; },

    startAt(audioTime) {
      if (!Number.isFinite(audioTime)) throw new Error('start time must be finite');
      originTime = audioTime;
      pausedBeat = 0;
      state = 'running';
      return originTime;
    },

    currentBeat(audioTime = audioContext.currentTime) {
      if (originTime == null) return 0;
      if (state === 'paused' || state === 'stopped') return pausedBeat;
      return (audioTime - originTime) / secondsPerBeat;
    },

    timeAtBeat(beat) {
      requireStarted();
      return originTime + beat * secondsPerBeat;
    },

    beatAtTime(audioTime) {
      requireStarted();
      return (audioTime - originTime) / secondsPerBeat;
    },

    position(audioTime = audioContext.currentTime) {
      const beat = this.currentBeat(audioTime);
      if (beat < 0) return { beat, bar: 0, beatInBar: mod(Math.floor(beat), beatsPerBar) + 1 };
      return { beat, bar: Math.floor(beat / beatsPerBar) + 1, beatInBar: mod(Math.floor(beat), beatsPerBar) + 1 };
    },

    pause() {
      if (state !== 'running') return pausedBeat;
      pausedBeat = this.currentBeat(audioContext.currentTime);
      state = 'paused';
      return pausedBeat;
    },

    resumeAtBoundary({ boundaryBeats = beatsPerBar, leadSec = 0.06 } = {}) {
      if (state !== 'paused') return this.currentBeat();
      const boundary = Math.ceil((pausedBeat - 1e-9) / boundaryBeats) * boundaryBeats;
      originTime = audioContext.currentTime + leadSec - boundary * secondsPerBeat;
      pausedBeat = boundary;
      state = 'running';
      return boundary;
    },

    stop() {
      if (state === 'running') pausedBeat = this.currentBeat(audioContext.currentTime);
      state = 'stopped';
      return pausedBeat;
    },
  };
}

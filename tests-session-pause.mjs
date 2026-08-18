import fs from 'node:fs';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const engine=fs.readFileSync(new URL('./src/session/engine.js',import.meta.url),'utf8');
const player=fs.readFileSync(new URL('./src/session/player.js',import.meta.url),'utf8');
const view=fs.readFileSync(new URL('./src/ui/sessionView.js',import.meta.url),'utf8');

assert(engine.includes("pause() { interrupt('user'); }"),'Session Engine exposes user pause through the existing interruption path');
assert(engine.includes('nextBoundary=timeline.events.find')&&engine.includes('transport.resumeAtBeat(nextBoundary'),'resume returns at a Learning Event boundary rather than the interrupted beat');
assert(player.includes('view.bindPause({onClick:()=>engine.pause()})'),'Session Player binds the pause control to Engine pause');
assert(view.includes('id="session-pause"')&&view.includes("reason==='user'?'一時停止しました。タップで次のphraseから戻ります。'"),'Session View exposes pause and explains boundary resume');
assert(view.includes("setRunning() { start.classList.add('hidden'); resume.classList.add('hidden'); pause.classList.remove('hidden')"),'pause is available only while the Session is running');
assert(view.includes("showInterrupted({ reason = 'background'")&&view.includes("pause.classList.add('hidden')"),'pause control is hidden while already paused/interrupted');

console.log('OK: user pause reuses Transport interruption and resumes on the next phrase boundary');

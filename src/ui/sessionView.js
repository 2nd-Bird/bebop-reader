import { renderNotation } from '../notation.js';
import { resetFollower, updateFollower } from '../notation/follow.js';
import { applyMorphHighlight, clearMorphHighlight } from '../notation/morph.js';

const phaseCopy = {
  SPACE: ['LISTEN', '拍とCの中にいる'],
  MODEL: ['TEACHER CALL', '耳で受け取る'],
  ECHO: ['ANSWER ECHO', '答えを拍の中で聴く'],
  AUDIATE: ['SEE · AUDIATE', '譜面から先に音を聴く'],
  SING: ['SING', '止まらず、その場所で歌う'],
  FEEDBACK: ['FLOW', '音楽は続く'],
};
const starsHTML = n => `<div class="star-row" aria-label="${n} of 5 stars">${[1,2,3,4,5].map(i => `<span class="${i <= n ? 'on' : ''}">★</span>`).join('')}</div>`;

export function createSessionView({ app, navigate }) {
  app.innerHTML = `<div class="app-shell is-compact session-v09"><header class="topbar"><button class="brand session-close"><span class="brand-mark">B</span><span><b>Bebop Reader</b><small>READ → SING → FLOW</small></span></button><div class="key-pill"><span>KEY</span><b>C</b></div></header><main class="session-main"><div class="session-meta"><button class="icon-btn session-close">×</button><div class="session-progress"><div id="session-progress-fill"></div></div><span id="session-position">READY</span></div><section class="session-intro"><span class="eyebrow">V0.9 · CONTINUOUS SESSION</span><h1>音楽を止めずに読む。</h1><p>最初の4カウント後は、beatが流れ続けます。</p></section><section class="score-card score-card-v08 session-score-card"><div class="morph-badge hidden" id="session-morph"></div><div class="score-wrap" id="session-score-viewport"><div id="session-score"></div><div id="session-playhead" class="playhead"></div></div><div class="session-empty" id="session-empty">次の譜面は音楽の中で現れます</div></section><div class="session-phase" id="session-phase"><span class="pulse-dot"></span><b>READY</b><small>STARTを一度タップ</small></div><div class="session-count hidden" id="session-count">1</div><div class="session-feedback" id="session-feedback"></div><button class="primary big" id="session-start">START <span>→</span></button><div class="session-debug hidden" id="session-debug"></div></main><div class="build-tag">v0.9 slice</div></div>`;
  const root = app.querySelector('.session-v09'), score = root.querySelector('#session-score'), viewport = root.querySelector('#session-score-viewport'), playhead = root.querySelector('#session-playhead'), phase = root.querySelector('#session-phase'), count = root.querySelector('#session-count'), feedback = root.querySelector('#session-feedback'), start = root.querySelector('#session-start'), progress = root.querySelector('#session-progress-fill'), position = root.querySelector('#session-position'), empty = root.querySelector('#session-empty'), debug = root.querySelector('#session-debug'), morph = root.querySelector('#session-morph');
  const debugEnabled = new URLSearchParams(location.search).get('debug') === '1'; if (debugEnabled) debug.classList.remove('hidden');
  let currentEvent = null, currentScoreModel = null;
  root.querySelectorAll('.session-close').forEach(btn => btn.onclick = () => navigate('/'));
  return {
    bindStart({ onPointerDown, onClick }) { start.onpointerdown = onPointerDown; start.onclick = onClick; },
    setStarting() { start.disabled = true; start.textContent = 'STARTING…'; },
    setRunning() { start.classList.add('hidden'); },
    setCount(value) { if (value == null) count.classList.add('hidden'); else { count.textContent = String(value); count.classList.remove('hidden'); } },
    clearScore() { currentEvent = null; currentScoreModel = null; clearMorphHighlight(score); morph.classList.add('hidden'); score.innerHTML = ''; playhead.classList.remove('active'); empty.classList.remove('hidden'); },
    showEvent(event, scoreModel) {
      currentEvent = event; currentScoreModel = scoreModel; empty.classList.add('hidden'); renderNotation(score, scoreModel); resetFollower(score, viewport, playhead, scoreModel); playhead.classList.add('active');
      if(event.morph?.active){ morph.textContent=`GROW · ${event.morph.type}`; morph.classList.remove('hidden'); applyMorphHighlight(score,event.morph); } else morph.classList.add('hidden');
    },
    setPhase(name) { const [label, sub] = phaseCopy[name] || [name, '']; phase.innerHTML = `<span class="pulse-dot ${name === 'SING' ? 'live' : name === 'AUDIATE' ? 'gold' : name==='MODEL'||name==='ECHO' ? 'model' : ''}"></span><b>${label}</b><small>${sub}</small>`; document.body.classList.toggle('attempting', name === 'SING'); },
    update({ beat, bar, beatInBar, totalBeats, progress: noteProgress, event, phase: phaseName, audio = null }) {
      const pct = Math.max(0, Math.min(100, beat / totalBeats * 100)); progress.style.width = `${pct}%`; position.textContent = beat < 0 ? 'COUNT IN' : `BAR ${bar} · ${beatInBar}`;
      if (currentEvent && currentScoreModel && event?.eventId === currentEvent.eventId) updateFollower(score, viewport, playhead, currentScoreModel, noteProgress, { autoScroll: true });
      if (debugEnabled) debug.textContent = `beat ${beat.toFixed(2)} | bar ${bar}:${beatInBar} | ${event?.eventId || '-'} | ${event?.presentationMode||'-'} | ${phaseName} | audio ${audio?.contextState||'-'} | groove→${audio?.scheduledBeats??'-'}`;
    },
    showFeedback(result) { feedback.textContent = result.stars >= 3 ? '✓' : '△'; feedback.classList.add('show'); setTimeout(() => feedback.classList.remove('show'), 650); },
    showError(error) { start.disabled = false; start.textContent = 'もう一度 START'; phase.innerHTML = `<span class="pulse-dot error"></span><b>開始できませんでした</b><small>${String(error?.message || error)}</small>`; },
    showSummary(summary) { document.body.classList.remove('attempting'); playhead.classList.remove('active'); root.querySelector('.session-main').innerHTML = `<section class="result-hero result-hero-v08 session-summary"><span class="eyebrow">SESSION COMPLETED</span>${starsHTML(summary.stars || 0)}<h1>音楽の中で読み切った。</h1><p>${summary.eventCount} events · Reading ${summary.readScore}</p></section><section class="performance-details card"><div class="micro-metrics"><span>Pitch ${summary.pitch}</span><span>Time ${summary.time}</span><span>Flow ${summary.flow}</span></div></section><button class="primary big" id="session-done">今日へ戻る →</button>`; root.querySelector('#session-done').onclick = () => navigate('/'); },
  };
}

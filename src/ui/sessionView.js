import { renderNotation } from '../notation.js';
import { resetFollower, updateFollower } from '../notation/follow.js';
import { applyMorphHighlight, clearMorphHighlight } from '../notation/morph.js';

const phaseCopy = {
  SPACE: ['LISTEN', '拍とCの中にいる'],
  MODEL: ['LISTEN', '耳で受け取る'],
  ECHO: ['LISTEN AGAIN', '答えを拍の中で聴く'],
  AUDIATE: ['SEE', '譜面から先に音を聴く'],
  SING: ['SING', '止まらず、その場所で歌う'],
  FEEDBACK: ['FLOW', '音楽は続く'],
};
const morphCopy={INSERT:'間を埋める',EXTEND:'少し伸びる',CHANGE:'少し変わる',DENSIFY:'少し細かく'};
const starsHTML = n => `<div class="star-row" aria-label="${n} of 5 stars">${[1,2,3,4,5].map(i => `<span class="${i <= n ? 'on' : ''}">★</span>`).join('')}</div>`;

function applyScoreVisibility(score,event,scoreModel,rendered){
  if(event?.scoreVisibility!=='PARTIAL'||!rendered?.geometry)return;
  const visibleBeats=Math.max(0,Math.min(scoreModel.totalBeats,Number(event.visibleBeats)||scoreModel.totalBeats/2)),g=rendered.geometry;
  const left=g.noteLeft+visibleBeats*g.beatWidth,mask=document.createElement('div');
  mask.className='score-recall-mask';mask.style.left=`${left}px`;mask.style.width=`${Math.max(0,rendered.canvasWidth-left)}px`;mask.setAttribute('aria-hidden','true');score.appendChild(mask);
}

export function createSessionView({ app, navigate }) {
  app.innerHTML = `<div class="app-shell is-compact session-v09"><header class="topbar"><button class="brand session-close"><span class="brand-mark">B</span><span><b>Bebop Reader</b><small>READ → SING → FLOW</small></span></button><div class="key-pill"><span>KEY</span><b>C</b></div></header><main class="session-main"><div class="session-meta"><button class="icon-btn session-close">×</button><div class="session-progress"><div id="session-progress-fill"></div></div><span id="session-position">READY</span></div><section class="session-intro"><span class="eyebrow">CONTINUOUS SESSION</span><h1>音楽を止めずに読む。</h1><p>最初の4カウント後は、beatが流れ続けます。</p></section><section class="score-card score-card-v08 session-score-card"><div class="morph-badge hidden" id="session-morph"></div><div class="score-wrap" id="session-score-viewport"><div id="session-score"></div><div id="session-playhead" class="playhead"></div></div><div class="session-empty" id="session-empty">次の譜面は音楽の中で現れます</div></section><div class="session-phase" id="session-phase"><span class="pulse-dot"></span><b>READY</b><small>STARTを一度タップ</small></div><div class="session-count hidden" id="session-count">1</div><div class="session-feedback" id="session-feedback"></div><button class="primary big" id="session-start">START <span>→</span></button><button class="primary big hidden" id="session-resume">RESUME <span>→</span></button><div class="session-debug hidden" id="session-debug"></div></main><div class="build-tag">v0.9 slice</div></div>`;
  const root = app.querySelector('.session-v09'), score = root.querySelector('#session-score'), viewport = root.querySelector('#session-score-viewport'), playhead = root.querySelector('#session-playhead'), phase = root.querySelector('#session-phase'), count = root.querySelector('#session-count'), feedback = root.querySelector('#session-feedback'), start = root.querySelector('#session-start'), resume = root.querySelector('#session-resume'), progress = root.querySelector('#session-progress-fill'), position = root.querySelector('#session-position'), empty = root.querySelector('#session-empty'), debug = root.querySelector('#session-debug'), morph = root.querySelector('#session-morph');
  const debugEnabled = new URLSearchParams(location.search).get('debug') === '1'; if (debugEnabled) debug.classList.remove('hidden');
  let currentEvent = null, currentScoreModel = null;
  root.querySelectorAll('.session-close').forEach(btn => btn.onclick = () => navigate('/'));
  return {
    bindStart({ onPointerDown, onClick }) { start.onpointerdown = onPointerDown; start.onclick = onClick; },
    setStarting() { start.disabled = true; start.textContent = 'STARTING…'; },
    setRunning() { start.classList.add('hidden'); resume.classList.add('hidden'); resume.disabled = false; resume.innerHTML = 'RESUME <span>→</span>'; },
    setResuming() { resume.disabled = true; resume.textContent = 'RESUMING…'; },
    showInterrupted({ reason = 'background', onResume, error = null } = {}) {
      document.body.classList.remove('attempting');
      resume.onclick = onResume;
      resume.disabled = false;
      resume.innerHTML = 'RESUME ON NEXT PHRASE <span>→</span>';
      resume.classList.remove('hidden');
      const sub = error ? String(error?.message || error) : reason === 'audio' ? '音声が止まりました。タップで次のphraseから戻ります。' : 'アプリに戻りました。タップで次のphraseから戻ります。';
      phase.innerHTML = `<span class="pulse-dot gold"></span><b>PAUSED</b><small>${sub}</small>`;
    },
    setCount(value) { if (value == null) count.classList.add('hidden'); else { count.textContent = String(value); count.classList.remove('hidden'); } },
    clearScore() { currentEvent = null; currentScoreModel = null; clearMorphHighlight(score); morph.classList.add('hidden'); score.innerHTML = ''; playhead.classList.remove('active'); empty.classList.remove('hidden'); },
    showEvent(event, scoreModel) {
      currentEvent = event; currentScoreModel = scoreModel; empty.classList.add('hidden'); const rendered=renderNotation(score, scoreModel); applyScoreVisibility(score,event,scoreModel,rendered); resetFollower(score, viewport, playhead, scoreModel); playhead.classList.add('active');
      if(event.presentationMode==='FLOW'){morph.textContent=event.flowAction==='RECALL'?'後半は思い出して':event.flowAction==='CONNECT'?'4小節つなげる':'続けて歌う';morph.classList.remove('hidden');}
      else if(event.morph?.active){ morph.textContent=morphCopy[event.morph.type]||'少し変わる'; morph.classList.remove('hidden'); applyMorphHighlight(score,event.morph); }
      else morph.classList.add('hidden');
    },
    setPhase(name) { const [label, sub] = phaseCopy[name] || [name, '']; phase.innerHTML = `<span class="pulse-dot ${name === 'SING' ? 'live' : name === 'AUDIATE' ? 'gold' : name==='MODEL'||name==='ECHO' ? 'model' : ''}"></span><b>${label}</b><small>${sub}</small>`; document.body.classList.toggle('attempting', name === 'SING'); },
    update({ beat, bar, beatInBar, totalBeats, progress: noteProgress, event, phase: phaseName, audio = null }) {
      const pct = Math.max(0, Math.min(100, beat / totalBeats * 100)); progress.style.width = `${pct}%`; position.textContent = beat < 0 ? 'COUNT IN' : `BAR ${bar} · ${beatInBar}`;
      if (currentEvent && currentScoreModel && event?.eventId === currentEvent.eventId) updateFollower(score, viewport, playhead, currentScoreModel, noteProgress, { autoScroll: true });
      if (debugEnabled) {
        const session = audio?.audioSession;
        debug.textContent = `beat ${beat.toFixed(2)} | bar ${bar}:${beatInBar} | ${event?.eventId || '-'} | ${event?.presentationMode||'-'} | ${phaseName} | ctx ${audio?.contextState||'-'} | session ${session?.type||'-'}${session?.error?'!':''} | groove→${audio?.scheduledBeats??'-'}`;
      }
    },
    showFeedback(result) { feedback.textContent = result.stars >= 3 ? '✓' : '△'; feedback.classList.add('show'); setTimeout(() => feedback.classList.remove('show'), 650); },
    showError(error) { start.disabled = false; start.textContent = 'もう一度 START'; phase.innerHTML = `<span class="pulse-dot error"></span><b>開始できませんでした</b><small>${String(error?.message || error)}</small>`; },
    showSummary(summary) { document.body.classList.remove('attempting'); playhead.classList.remove('active'); root.querySelector('.session-main').innerHTML = `<section class="result-hero result-hero-v08 session-summary"><span class="eyebrow">SESSION COMPLETED</span>${starsHTML(summary.stars || 0)}<h1>音楽の中で読み切った。</h1><p>Reading ${summary.readScore}</p></section><section class="performance-details card"><div class="micro-metrics"><span>Pitch ${summary.pitch}</span><span>Time ${summary.time}</span><span>Flow ${summary.flow}</span></div></section><button class="primary big" id="session-done">今日へ戻る →</button>`; root.querySelector('#session-done').onclick = () => navigate('/'); },
  };
}

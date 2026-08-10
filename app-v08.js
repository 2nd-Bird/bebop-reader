import {EXERCISES,GROUPS,GROUP_LABELS,findExercise,solfege} from './src/exercises.js';
import {loadState,mutate,masteryOf,recordAttempt,setSettings,cMastery,storageKey} from './src/storage.js';
import {renderNotation} from './src/notation.js';
import {resetFollower,updateFollower} from './src/notation/follow.js';
import {demoPhrase,countIn,ensureAudio,primeAudio} from './src/audio.js';
import {initMic,capture,micStatus,stopMic} from './src/mic.js';
import {scoreAttempt} from './src/scoring.js';
import {renderPitchGuide} from './src/pitchGuide.js';

const $=(q,r=document)=>r.querySelector(q),app=$('#app');
const ICON={Pitch:'●',Scale:'↗',Arpeggio:'◇',Rhythm:'♪',Phrase:'⌁'};let busy=false;
const esc=s=>String(s??'').replace(/[&<>']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[c]));
const nav=p=>location.hash=p.startsWith('#')?p:`#${p}`;
const parts=()=>location.hash.replace(/^#/,'').split('/').filter(Boolean);
const bpm=()=>{const m=cMastery();return m>=75?96:m>=45?84:m>=20?72:60};

function toast(text){let t=$('.toast-v3');if(!t){t=document.createElement('div');t.className='toast-v3';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}
function level(s=loadState()){const ls=[...new Set(EXERCISES.map(e=>e.level||1))].sort((a,b)=>a-b);let u=ls[0]||1;for(const l of ls){if(l>u)break;const a=EXERCISES.filter(e=>(e.level||1)===l);if(a.length&&a.every(e=>(s.mastery[e.id]||0)>=2)){const n=ls.find(x=>x>l);if(n)u=n}else break}return u;}
const levelName=l=>({1:'ド・ソ',2:'＋ ミ',3:'＋ レ',4:'＋ ファ',5:'＋ ラ',6:'＋ シ・高いド',7:'和音と音階',8:'リズムとジャズ語彙'})[l]||'C Major';
function daily(){const s=loadState(),l=level(s),all=EXERCISES.map((e,i)=>({e,i,m:s.mastery[e.id]||0,a:s.attempts[e.id]||0})).filter(x=>(x.e.level||1)<=l),cur=all.filter(x=>(x.e.level||1)===l),out=[];[...all.filter(x=>x.a&&x.m<2).sort((a,b)=>a.m-b.m||a.i-b.i),...cur.filter(x=>!x.a),...cur.filter(x=>x.a).sort((a,b)=>a.m-b.m),...all.filter(x=>(x.e.level||1)<l&&x.m>=2).slice(-3)].forEach(x=>{if(x&&!out.some(e=>e.id===x.e.id))out.push(x.e)});return out.slice(0,9);}

function shell(html,{compact=false,active='home'}={}){
  app.innerHTML=`<div class="app-shell ${compact?'is-compact':''}"><header class="topbar"><button class="brand" data-nav="/"><span class="brand-mark">B</span><span><b>Bebop Reader</b><small>READ → SING → FLOW</small></span></button><div class="key-pill"><span>KEY</span><b>C</b></div></header><main>${html}</main>${compact?'':`<nav class="bottom-nav">${[['home','/','今日','◉'],['library','/library','教材','▤'],['progress','/progress','進捗','◫'],['settings','/settings','設定','⚙']].map(([id,p,l,i])=>`<button data-nav="${p}" class="${active===id?'active':''}"><span>${i}</span><small>${l}</small></button>`).join('')}</nav>`}<div class="build-tag">v0.8</div></div>`;
  document.querySelectorAll('[data-nav]').forEach(e=>e.onclick=()=>nav(e.dataset.nav));
}

function home(){
  const s=loadState(),d=daily(),l=level(s);
  shell(`<section class="hero"><div class="eyebrow">TODAY · 7 MIN</div><h1>譜面を見て、<br><em>そのまま歌う。</em></h1><p>まずはドとソ。パッと見で歌える音を確実に増やし、そこからジャズの線へ進む。</p></section><section class="today-card card"><div class="today-top"><div><span class="label">READING SET · ${levelName(l)}</span><h2>${d.length} phrases</h2></div><div class="tempo-badge"><span>♩</span><b>${bpm()}</b></div></div><div class="mini-path">${d.slice(0,7).map((e,i)=>`<span class="${i?'':'now'}">${ICON[e.group]}</span>`).join('<i></i>')}</div><button class="primary big" id="start">はじめる <span>→</span></button></section><section class="metrics-grid"><div class="metric card"><span>STREAK</span><b>${s.streak||0}<small>日</small></b><em>連続</em></div><div class="metric card"><span>C MAJOR</span><b>${cMastery()}<small>%</small></b><em>mastery</em></div></section><section class="locked-worlds"><div class="world active"><b>C</b><span>Major</span><small>NOW</small></div><div class="world"><b>F</b><span>Major</span><small>LOCKED</small></div><div class="world"><b>B♭</b><span>Major</span><small>LOCKED</small></div></section>`,{active:'home'});
  $('#start').onclick=()=>{const ids=d.map(e=>e.id);mutate(x=>{x.session=ids;x.sessionIndex=0});nav(`/practice/${ids[0]}`)};
}

function practiceHeader(ex){const s=loadState(),i=s.session?.indexOf(ex.id),n=s.session?.length||0;return `<div class="practice-meta"><button class="icon-btn" data-nav="/">×</button><div class="lesson-progress"><div style="width:${i>=0&&n?(i+1)/n*100:25}%"></div></div><span>${i>=0&&n?`${i+1}/${n}`:'PRACTICE'}</span></div>`;}

function setFollower(ex,p,{auto=true}={}){const score=$('#score'),viewport=$('#score-viewport'),ph=$('#playhead');if(score&&viewport&&ph)updateFollower(score,viewport,ph,ex,p,{autoScroll:auto});}

function practice(ex){
  const st=loadState().settings;
  shell(`${practiceHeader(ex)}<section class="practice-title"><div><span class="eyebrow">${GROUP_LABELS[ex.group]}</span><h1>${esc(ex.title)}</h1></div><div class="practice-spec"><span>C</span><span>♩ ${ex.bpm}</span></div></section>${ex.chords?.length?`<div class="chord-strip">${ex.chords.map(esc).join('<i>→</i>')}</div>`:''}<section class="score-card score-card-v08"><div class="score-wrap" id="score-viewport"><div id="score"></div><div id="playhead" class="playhead"></div></div><div class="solfege-row ${st.solfege?'':'hidden'}">${ex.notes.map(n=>`<span style="flex:${n.duration}">${n.rest?'':solfege(n.pitch,ex.key)}</span>`).join('')}</div></section><div id="state" class="attempt-state"><span class="pulse-dot"></span><b>譜面から先に音を聴く</b><small>4カウント後、1小節を止まらず歌う</small></div><div id="count" class="count-display hidden">1</div><div class="practice-actions"><button class="secondary" id="listen">▶ お手本</button><button class="primary sing" id="sing"><span class="mic-icon">●</span> 歌う</button></div><div id="fallback" class="fallback hidden"><b>マイク入力を確認</b><p>採点なしでも練習できます。</p><button class="secondary" id="self">採点なしで練習</button></div>`,{compact:true});
  renderNotation($('#score'),ex);resetFollower($('#score'),$('#score-viewport'),$('#playhead'),ex);
  $('#listen').onpointerdown=()=>primeAudio();$('#sing').onpointerdown=()=>primeAudio();
  $('#listen').onclick=async()=>{
    if(busy)return;busy=true;const b=$('#listen'),s=$('#sing'),ph=$('#playhead'),state=$('#state');b.disabled=s.disabled=true;const old=b.innerHTML;b.innerHTML='♪ 再生中';
    try{resetFollower($('#score'),$('#score-viewport'),ph,ex);ph.classList.add('active');state.innerHTML='<span class="pulse-dot gold"></span><b>お手本</b><small>1小節を目と耳でひとまとまりにする</small>';await demoPhrase(ex,p=>setFollower(ex,p));}
    catch(e){toast(e.message||String(e));}
    finally{ph.classList.remove('active');b.disabled=s.disabled=false;b.innerHTML=old;state.innerHTML='<span class="pulse-dot"></span><b>譜面から先に音を聴く</b><small>4カウント後、1小節を止まらず歌う</small>';busy=false;}
  };
  $('#sing').onclick=()=>attempt(ex);
}

async function attempt(ex){
  if(busy)return;busy=true;const sing=$('#sing'),listen=$('#listen'),state=$('#state'),count=$('#count'),ph=$('#playhead'),score=$('#score'),viewport=$('#score-viewport');sing.disabled=listen.disabled=true;
  try{
    await Promise.all([ensureAudio(),initMic()]);state.innerHTML='<span class="pulse-dot gold"></span><b>COUNT IN</b><small>4拍後に入る</small>';count.classList.remove('hidden');await countIn(ex.bpm,b=>count.textContent=b);count.classList.add('hidden');
    state.innerHTML='<span class="pulse-dot live"></span><b>SING</b><small>譜面を先へ読む</small>';document.body.classList.add('attempting');resetFollower(score,viewport,ph,ex);ph.classList.add('active');
    const dur=ex.totalBeats*60/ex.bpm,samples=await capture(dur,ex,p=>setFollower(ex,p));ph.classList.remove('active');document.body.classList.remove('attempting');
    const r=scoreAttempt(ex,samples,loadState().settings.latencyMs||0);recordAttempt(ex,r);nav(`/result/${ex.id}`);
  }catch(e){document.body.classList.remove('attempting');count.classList.add('hidden');$('#fallback').classList.remove('hidden');state.innerHTML='<span class="pulse-dot error"></span><b>マイク入力を確認</b><small>'+esc(e.message||e)+'</small>';$('#self').onclick=()=>selfPractice(ex);sing.disabled=listen.disabled=false;}
  finally{busy=false;}
}

async function selfPractice(ex){
  await ensureAudio();await countIn(ex.bpm);const ph=$('#playhead'),score=$('#score'),viewport=$('#score-viewport'),dur=ex.totalBeats*60/ex.bpm,start=performance.now();resetFollower(score,viewport,ph,ex);ph.classList.add('active');await new Promise(ok=>{const f=()=>{const p=Math.min(1,(performance.now()-start)/1000/dur);setFollower(ex,p);p>=1?ok():requestAnimationFrame(f)};f()});ph.classList.remove('active');recordAttempt(ex,{mode:'self',stars:null,coaching:'採点なしで完走しました。'});nav(`/result/${ex.id}`);
}

function nextExercise(id){const s=loadState(),i=s.session?.indexOf(id);if(i>=0&&i<s.session.length-1)return s.session[i+1];return EXERCISES[(EXERCISES.findIndex(e=>e.id===id)+1)%EXERCISES.length].id;}
const starsHTML=n=>`<div class="star-row" aria-label="${n} of 5 stars">${[1,2,3,4,5].map(i=>`<span class="${i<=n?'on':''}">★</span>`).join('')}</div>`;
const resultTitle=r=>r.stars>=5?'流れた。':r.stars>=4?'読めている。':r.stars>=3?'もう一度で定着。':'もう一度、耳に戻す。';

function result(ex){
  const r=loadState().lastResult;if(!r||r.exerciseId!==ex.id){nav(`/practice/${ex.id}`);return;}
  shell(`<section class="result-hero result-hero-v08"><span class="eyebrow">READ & SING</span>${r.mode==='mic'?starsHTML(r.stars||0):'<div class="self-complete"><b>完走</b></div>'}<h1>${r.mode==='mic'?resultTitle(r):'1小節完走'}</h1><p>${esc(r.coaching||'')}</p></section><section class="result-score-card score-card score-card-v08"><div class="score-wrap" id="result-score-viewport"><div id="result-score"></div></div></section><div class="result-actions result-actions-v08"><button class="secondary big" id="retry">もう一度</button><button class="primary big" id="next">次へ →</button></div>${r.mode==='mic'?`<details class="performance-details card"><summary>歌唱の詳細を見る</summary><div class="detail-copy">採点の内部値。読譜の進行判定は上の星を使います。</div><div class="micro-metrics"><span>Pitch ${r.pitch}</span><span>Time ${r.time}</span><span>Flow ${r.flow}</span></div><div id="pitch-guide"></div></details>`:''}`,{compact:true});
  renderNotation($('#result-score'),ex);$('#retry').onclick=()=>nav(`/practice/${ex.id}`);$('#next').onclick=()=>nav(`/practice/${nextExercise(ex.id)}`);if(r.mode==='mic')renderPitchGuide($('#pitch-guide'),ex,r);
}

function library(){shell(`<section class="page-title"><span class="eyebrow">LIBRARY · C MAJOR</span><h1>教材</h1><p>移動ドで、読める音を段階的に増やす。</p></section>${GROUPS.map(g=>`<section class="library-group"><div class="group-head"><div class="group-icon">${ICON[g]}</div><div><h2>${GROUP_LABELS[g]}</h2></div></div><div class="exercise-list">${EXERCISES.filter(e=>e.group===g).map(e=>`<button class="exercise-row" data-nav="/practice/${e.id}"><div><span>${esc(e.title)}</span><small>Level ${e.level} · ♩${e.bpm}</small></div><div class="mastery-dots">${[1,2,3,4,5].map(i=>`<i class="${i<=Math.floor(masteryOf(e.id))?'on':''}"></i>`).join('')}</div></button>`).join('')}</div></section>`).join('')}`,{active:'library'});}
function progress(){const l=level();shell(`<section class="page-title"><span class="eyebrow">MAP</span><h1>ジャズ言語への道</h1><p>現在の読譜セット：${levelName(l)}</p></section><section class="mastery-hero card"><div class="big-number">${cMastery()}<small>%</small></div><div><span>C MAJOR</span><h2>${levelName(l)}</h2><p>星を重ねて、確実になったら次の音へ</p></div></section><div class="skill-map"><div class="map-node done"><span>01</span><div><b>C Major</b><small>移動ドの即読</small></div><em>ACTIVE</em></div><i></i><div class="map-node locked"><span>02</span><div><b>F Major</b><small>同じ度数を移調</small></div><em>LOCKED</em></div><i></i><div class="map-node locked"><span>03</span><div><b>B♭ Major</b></div><em>LOCKED</em></div><i></i><div class="map-node future"><span>04</span><div><b>12-Bar Blues</b></div><em>PHASE 2</em></div></div>`,{active:'progress'});}
function settings(){const st=loadState().settings,d=micStatus();shell(`<section class="page-title"><span class="eyebrow">SETTINGS</span><h1>耳と端末を合わせる</h1></section><section class="settings-card card"><div class="setting-row"><div><b>移動ド表示</b><small>通常はOFF。必要な時だけ表示。</small></div><label class="switch"><input id="sol" type="checkbox" ${st.solfege?'checked':''}><span></span></label></div><div class="setting-row column"><div><b>入力レイテンシ補正</b></div><div class="range-line"><input id="lat" type="range" min="-200" max="400" step="10" value="${st.latencyMs||0}"><output id="latout">${st.latencyMs||0} ms</output></div></div></section><section class="settings-card card"><div class="setting-row"><div><b>マイクをテスト</b><small id="miclabel">${d.status}</small></div><button class="secondary small" id="mictest">テスト</button></div></section><button class="danger-text" id="reset">学習データをリセット</button>`,{active:'settings'});$('#sol').onchange=e=>setSettings({solfege:e.target.checked});$('#lat').oninput=e=>{$('#latout').textContent=`${e.target.value} ms`;setSettings({latencyMs:Number(e.target.value)})};$('#mictest').onclick=async()=>{const label=$('#miclabel');label.textContent='listening…';try{await initMic();let n=0;const timer=setInterval(()=>{const m=micStatus();label.textContent=`${m.note} · input ${Number(m.rms||0).toFixed(3)}`;if(++n>12){clearInterval(timer);stopMic();}},120);}catch(e){label.textContent=e.message||String(e)}};$('#reset').onclick=()=>{localStorage.removeItem(storageKey);location.reload()};}

function render(){const p=parts();if(!p.length)return home();if(p[0]==='practice'){const e=findExercise(p[1]);return e?practice(e):home();}if(p[0]==='result'){const e=findExercise(p[1]);return e?result(e):home();}if(p[0]==='library')return library();if(p[0]==='progress')return progress();if(p[0]==='settings')return settings();home();}
window.addEventListener('hashchange',render);if(!location.hash)location.hash='#/';else render();

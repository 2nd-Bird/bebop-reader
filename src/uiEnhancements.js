import {findExercise} from './exercises.js';
import {loadState} from './storage.js';
import {demoPhrase,ensureAudio} from './audio.js';
import {playheadPercent,renderNotation} from './notation.js';
import {renderPitchGuide} from './pitchGuide.js';

const $=q=>document.querySelector(q);
const esc=s=>String(s??'').replace(/[&<>']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[c]));
function route(){return location.hash.replace(/^#/,'').split('/').filter(Boolean);}
function currentExercise(){const p=route();return p[1]?findExercise(p[1]):null;}
function toast(text){let t=$('.toast-v3');if(!t){t=document.createElement('div');t.className='toast-v3';document.body.appendChild(t);}t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600);}

function enhancePractice(){
  const ex=currentExercise(),btn=$('#listen'),ph=$('#playhead'),score=$('#score'),state=$('#state'),sing=$('#sing');
  if(!ex||!btn||!ph||!score||btn.dataset.v3==='1')return;
  btn.dataset.v3='1';
  btn.onclick=async()=>{
    if(btn.disabled)return;
    btn.disabled=true;if(sing)sing.disabled=true;
    const old=btn.innerHTML;btn.innerHTML='♪ 再生中';
    if(state)state.innerHTML='<span class="pulse-dot gold"></span><b>お手本</b><small>譜面と音の位置を結ぶ</small>';
    try{
      await ensureAudio();
      const dur=ex.totalBeats*60/ex.bpm,start=performance.now();
      ph.style.left=`${playheadPercent(score,ex,0)}%`;ph.classList.add('active');
      const anim=new Promise(ok=>{const f=()=>{const p=Math.min(1,(performance.now()-start)/1000/dur);ph.style.left=`${playheadPercent(score,ex,p)}%`;p>=1?ok():requestAnimationFrame(f)};f()});
      await Promise.all([demoPhrase(ex),anim]);
    }catch(e){toast(e.message||String(e));}
    finally{
      ph.classList.remove('active');btn.disabled=false;if(sing)sing.disabled=false;btn.innerHTML=old;
      if(state)state.innerHTML='<span class="pulse-dot"></span><b>譜面から先に音を聴く</b><small>4カウント後、最初の音符から入る</small>';
    }
  };
}

function enhanceResult(){
  const ex=currentExercise(),r=loadState().lastResult;if(!ex||!r||r.exerciseId!==ex.id||r.mode!=='mic')return;
  const old=$('.note-analysis');
  if(old&&!$('.pitch-analysis')){
    const section=document.createElement('section');section.className='pitch-analysis card';
    section.innerHTML=`<div class="section-head compact"><div><span class="eyebrow">PITCH GUIDE</span><h3>歌った軌跡</h3></div><div class="guide-key"><span class="hit">●</span>合っている <span class="miss">●</span>外れている</div></div><div id="pitch-guide"></div>`;
    old.replaceWith(section);renderPitchGuide($('#pitch-guide'),ex,r);
    const resultScore=$('#result-score');if(resultScore)renderNotation(resultScore,ex);
  }
  document.querySelectorAll('.fallback p').forEach(p=>{if(p.textContent.includes('最大入力')||p.textContent.includes('pitch frames'))p.textContent='歌声の軌跡を検出できませんでした。設定のマイクテストで入力を確認できます。';});
}

function enhance(){requestAnimationFrame(()=>{const p=route();if(p[0]==='practice')enhancePractice();if(p[0]==='result')enhanceResult();});}
window.addEventListener('hashchange',enhance);
new MutationObserver(enhance).observe(document.getElementById('app'),{childList:true,subtree:true});
enhance();

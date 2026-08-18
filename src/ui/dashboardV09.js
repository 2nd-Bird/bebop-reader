import { loadStateV3 } from '../storage-v3.js';
import { schedulerSignals, cBluesStageReady, nextCBluesFlowAction } from '../curriculum/mastery.js';
import { STAGES, stageByNumber } from '../curriculum/stages.js';
import { familyById, familiesForStage } from '../curriculum/phraseFamilyRegistry.js';
import { musicalFormById } from '../curriculum/musicalForms.js';
import { isFamilyMastered } from '../curriculum/mastery.js';

const esc=s=>String(s??'').replace(/[&<>']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;'}[c]));
const pct=n=>Math.round(Math.max(0,Math.min(1,Number(n)||0))*100);
const FLOW_COPY={REPEAT:'同じ動きを2小節続ける',MUTATION:'2小節目を少し変える',CONNECT:'4小節つなげる',TRADE:'聴いて、譜面で返す',RECALL:'後半を思い出して歌う',ONE_CHORUS:'1コーラスを読み切る'};
const keyLabel=key=>key==='Bb'?'B♭':key;

function bindNav(root,navigate){root.querySelectorAll('[data-v09-nav]').forEach(el=>el.onclick=()=>navigate(el.dataset.v09Nav));}
function shell(app,html,{active='home'}={}){
  app.innerHTML=`<div class="app-shell home-v09"><header class="topbar"><button class="brand" data-v09-nav="/"><span class="brand-mark">B</span><span><b>Bebop Reader</b><small>READ → SING → FLOW</small></span></button><div class="key-pill"><span>KEY</span><b>C</b></div></header><main>${html}</main><nav class="bottom-nav">${[['home','/','今日','◉'],['library','/library','教材','▤'],['progress','/progress','進捗','◫'],['settings','/settings','設定','⚙']].map(([id,path,label,icon])=>`<button data-v09-nav="${path}" class="${active===id?'active':''}"><span>${icon}</span><small>${label}</small></button>`).join('')}</nav><div class="build-tag">v0.9</div></div>`;
  return app.querySelector('.home-v09');
}
function familyMetric(record){if(!record?.attempts)return 0;const reading=Number(record.reading)||0,cold=record.coldReadAttempts?Number(record.coldRead)||0:0;return pct(reading*.45+cold*.55);}
function displayFamiliesForStage(stage){const direct=familiesForStage(stage.stage);if(direct.length)return direct;return(stage.unlock?.integrationFamilyIds||[]).map(familyById).filter(Boolean);}
function keyWorldCards(keyProgress){
  return ['C','F','Bb'].map(key=>{const unlocked=Boolean(keyProgress?.[key]?.unlocked),current=key==='C',state=current?'NOW':unlocked?'OPEN':'LATER';return`<div class="world ${current?'active':''} ${unlocked?'':'locked'}"><b>${keyLabel(key)}</b><span>Major</span><small>${state}</small></div>`;}).join('');
}
function currentSnapshot(state){
  const stageNo=state.stageProgress?.currentStage??0,stage=stageByNumber(stageNo)||STAGES[0],families=displayFamiliesForStage(stage),signals=schedulerSignals(state),due=signals.dueFamilyIds.map(familyById).filter(Boolean),weak=signals.weakFamilyIds.map(familyById).filter(Boolean);
  const focus=[...due.filter(f=>families.includes(f)),...weak.filter(f=>families.includes(f)),...families].filter((f,i,a)=>f&&a.findIndex(x=>x.familyId===f.familyId)===i).slice(0,2);
  const readiness=families.length?Math.round(families.reduce((sum,f)=>sum+familyMetric(state.familyMastery?.[f.familyId]),0)/families.length):0;
  const forms=(stage.unlock?.forms||[]).map(musicalFormById).filter(Boolean),stage14Ready=stageNo>=14&&cBluesStageReady(state.familyMastery||{}),nextFlow=stageNo>=14&&!stage14Ready?nextCBluesFlowAction(state.familyMastery||{}):null;
  const activeForm=stageNo>=14?(stage14Ready?musicalFormById('rhythm-changes-32'):musicalFormById('c-blues-12')):(forms.find(f=>f.status==='ACTIVE')||null);
  return{stageNo,stage,families,due,weak,focus,readiness,forms,activeForm,stage14Ready,nextFlow,keyProgress:state.keyProgress||{C:{unlocked:true},F:{unlocked:false},Bb:{unlocked:false}}};
}
export function renderV09Home({app,navigate}){
  const state=loadStateV3(),x=currentSnapshot(state),last=state.lastSessionResult;
  const familyText=x.focus.length?x.focus.map(f=>f.title).join(' · '):x.stage.title;
  const flowText=x.stageNo>=14&&!x.stage14Ready&&x.nextFlow?` · ${FLOW_COPY[x.nextFlow]||'FLOW'}`:'';
  const focusText=x.activeForm?`${x.activeForm.title} · ${familyText}${flowText}`:familyText;
  const root=shell(app,`<section class="hero v09-hero"><div class="eyebrow">TODAY · CONTINUOUS SESSION</div><h1>音楽を止めずに、<br><em>読む。</em></h1><p>聴く → 見る → 頭で鳴らす → 歌う。失敗しても流れは止めず、あとで同じ動きへ戻る。</p></section><section class="today-card card v09-today"><div class="today-top"><div><span class="label">STAGE ${x.stageNo} · ${esc(x.stage.title)}</span><h2>${esc(focusText)}</h2></div><div class="tempo-badge"><span>♩</span><b>60</b></div></div><div class="v09-flow-strip"><span>LISTEN</span><i>→</i><span>SEE</span><i>→</i><span>SING</span><i>→</i><span>FLOW</span></div><div class="v09-gate"><small>次にできること</small><b>${esc(x.stage.gate)}</b></div><button class="primary big" id="v09-start">セッションを始める <span>→</span></button><small class="v09-duration">約5分 · 音楽は止まりません</small></section><section class="metrics-grid"><div class="metric card"><span>STREAK</span><b>${state.streak||0}<small>日</small></b><em>${state.totalSessions||0} sessions</em></div><div class="metric card"><span>READINESS</span><b>${x.readiness}<small>%</small></b><em>${x.due.length?`${x.due.length} review due`:'on track'}</em></div></section>${last?`<section class="card v09-last"><span class="label">LAST SESSION</span><div><b>${last.stars||0}★</b><span>Reading ${last.readScore??'—'}</span><span>Pitch ${last.pitch??'—'}</span><span>Flow ${last.flow??'—'}</span></div></section>`:''}<section class="locked-worlds">${keyWorldCards(x.keyProgress)}</section>`,{active:'home'});
  bindNav(root,navigate);root.querySelector('#v09-start').onclick=()=>navigate('/session');
}
export function renderV09Library({app,navigate}){
  const state=loadStateV3(),current=state.stageProgress?.currentStage??0,unlocked=new Set(state.stageProgress?.unlockedStages||[0]),stage14Ready=cBluesStageReady(state.familyMastery||{}),nextFlow=!stage14Ready?nextCBluesFlowAction(state.familyMastery||{}):null;
  const sections=STAGES.map(stage=>{
    const open=unlocked.has(stage.stage)||stage.stage===current,direct=familiesForStage(stage.stage),forms=(stage.unlock?.forms||[]).map(musicalFormById).filter(Boolean);
    const familyRows=direct.map(f=>`<div class="v09-family-row ${open?'':'locked'}"><div><b>${esc(f.title)}</b><small>${open?'五線譜から歌って身につける動き':'前のStageが安定すると開きます'}</small></div><div class="v09-family-score"><span>${open?'READ · SING':'LOCKED'}</span></div></div>`).join('');
    const formRows=forms.map(form=>{
      const rhythmLocked=form.formId==='rhythm-changes-32'&&!stage14Ready,active=open&&form.status==='ACTIVE'&&!rhythmLocked;
      const nextStep=nextFlow?`C Blues · ${FLOW_COPY[nextFlow]||'FLOWを続ける'}`:'C Bluesの現在のFLOWを安定させる';
      const detail=!open?'前のStageが安定すると開きます':rhythmLocked?nextStep:'既知の動きをformの中で読み、つなげる';
      return`<div class="v09-family-row ${open?'':'locked'}"><div><b>${esc(form.title)}</b><small>${detail}</small></div><div class="v09-family-score"><span>${active?'READ · FLOW':open?'NEXT':'LOCKED'}</span></div></div>`;
    }).join('');
    return`<section class="v09-family-list"><div class="group-head"><div><span class="eyebrow">STAGE ${stage.stage}</span><h2>${esc(stage.title)}</h2><small>${esc(stage.gate)}</small></div></div>${familyRows}${formRows}</section>`;
  }).join('');
  const root=shell(app,`<section class="page-title"><span class="eyebrow">CURRICULUM · C</span><h1>歌って身につける順番。</h1><p>理論問題ではなく、普通の譜面が少しずつ育っていきます。</p></section>${sections}`,{active:'library'});
  bindNav(root,navigate);
}
export function renderV09Progress({app,navigate}){
  const state=loadStateV3(),x=currentSnapshot(state);
  const stageNodes=STAGES.map(s=>{const unlocked=(state.stageProgress?.unlockedStages||[0]).includes(s.stage),active=s.stage===x.stageNo;return`<div class="v09-stage-node ${active?'active':unlocked?'done':'locked'}"><span>0${s.stage+1}</span><div><b>${esc(s.title)}</b><small>${esc(s.gate)}</small></div><em>${active?'CURRENT':unlocked?'OPEN':'LOCKED'}</em></div>`}).join('<i class="v09-stage-link"></i>');
  const allFamilies=STAGES.flatMap(s=>familiesForStage(s.stage));
  const familyRows=allFamilies.map(f=>{const record=state.familyMastery?.[f.familyId],unlocked=f.stage<=x.stageNo,mastered=isFamilyMastered(record,f.familyId);return`<div class="v09-family-row ${unlocked?'':'locked'}"><div><b>${esc(f.title)}</b><small>Stage ${f.stage} · ${record?.attempts||0} tries · ${record?.coldReadAttempts||0} no-hint reads</small></div><div class="v09-family-score"><span>${mastered?'READY':unlocked?`${familyMetric(record)}%`:'—'}</span><div><i style="width:${unlocked?familyMetric(record):0}%"></i></div></div></div>`}).join('');
  const root=shell(app,`<section class="page-title"><span class="eyebrow">READING PROGRESS</span><h1>ジャズの線へ進む。</h1><p>同じ動きを、ヒントが消えても五線譜から歌えるようになると次へ進みます。</p></section><section class="mastery-hero card"><div class="big-number">${x.readiness}<small>%</small></div><div><span>STAGE ${x.stageNo}</span><h2>${esc(x.stage.title)}</h2><p>${esc(x.stage.gate)}</p></div></section><div class="v09-stage-map">${stageNodes}</div><section class="v09-family-list"><div class="group-head"><div><h2>KEY UNLOCK</h2><small>Stageとは別の読譜軸</small></div></div><div class="locked-worlds">${keyWorldCards(x.keyProgress)}</div></section><section class="v09-family-list"><div class="group-head"><div><h2>動き</h2><small>${x.due.length} review · ${x.weak.length} weak</small></div></div>${familyRows}</section>`,{active:'progress'});
  bindNav(root,navigate);
}

確認した。**v0.9 Vertical Slice は「app-v08.js に Transport を足す」のではなく、v0.8 の動作資産を残したまま、Continuous Session の実行系を横に新設し、最後に Home の START だけ差し替える**のが正しいです。

Product SPEC自身も、`v0.8を壊さず → Transport / Session Engineを独立実装 → #/session 専用route → 実機検証 → Home START切替 → legacy整理`を明示しています。 Product SPEC v0.9  
 現行 `main` は commit `f332322...`、実行入口は実際に `app-v08.js` です。

# **結論：移行後の責務配置**

app-v08.js  
    │  
    │  START / route だけ  
    ▼  
session/player.js  
    │  
    ├── curriculum/scheduler.js ── SessionPlanを生成  
    │  
    └── session/engine.js  
            │  
            ├── session/transport.js  ← 唯一の時間軸  
            │       │  
            │       ├── audio/groove.js  
            │       ├── audio/model.js  
            │       ├── score cue / playhead  
            │       └── event phase  
            │  
            ├── mic.js ───────── continuous capture  
            │  
            ├── scoring/eventScoring.js  
            │  
            └── notation/morph.js

**Transportを `app-v08.js` に挿入しない。**  
 `app-v08.js` は「Sessionを開始する」だけ。音楽時間を進める責任は完全に `src/session/` に閉じ込めます。

---

# **1\. app-v08.js：何を残すか**

現在ここには、旧schedulerからcapture、採点、画面遷移まで全部入っています。

### **Vertical Slice中も残す**

$  
esc()  
nav()  
parts()  
toast()

shell()

home()  
library()  
progress()  
settings()

render()  
hashchange listener

つまり、

**アプリの外枠・既存画面・routerは当面そのまま。**

HomeもUI自体はかなり再利用できます。SPECも Home / Library / Progress / Settings の大枠維持を認めています。 

Product SPEC v0.9

ただし `home()` 内の

const d \= daily()  
const l \= level()  
...  
$('\#start').onclick \= ...

だけは最終的にv0.9へ交換します。

---

# **2\. app-v08.js：外へ出すもの**

## **完全にCurriculum層へ移す**

現在冒頭にある、

bpm()  
level()  
levelName()  
daily()

これは全部 `app-v08.js` からなくす。

現在の `daily()` は「最大9 exerciseを選ぶ」旧Macro Gameそのものです。

置換先：

src/curriculum/  
  stages.js  
  phraseFamilies.js  
  variants.js  
  mastery.js  
  scheduler.js

SPECも固定9 exercise selectorをSchedulerへ置き換えるとしています。 

Product SPEC v0.9

---

## **Continuous Sessionでは使わない**

以下は**legacy v0.8 flow**として隔離します。

practiceHeader()  
setFollower()  
practice()  
attempt()  
selfPractice()  
nextExercise()  
result()  
resultTitle()

特に `attempt()` がv0.9と真逆です。

現在は、

ensureAudio  
initMic  
↓  
countIn  
↓  
capture 1 exercise  
↓  
scoreAttempt  
↓  
/resultへnavigate

です。

v0.9では、

prime  
↓  
count-in 一度  
↓  
Transport START  
↓  
5〜7分 continuous capture  
↓  
Eventごとにwindowをslice  
↓  
score  
↓  
music continues

になります。SPECでも明示されています。 

Product SPEC v0.9

したがって `attempt()` を改造するのではなく、**新Session Engineで置換**します。

---

# **3\. ただし最初から app-v08.js から削除しない**

ここは重要です。

Vertical Slice完成までは、

\#/practice/:id  
\#/result/:id

を残します。

そして新しく、

\#/session

だけ追加する。

つまり一時的には、

function render() {  
  const p \= parts();

  if (\!p.length) return home();

  if (p\[0\] \=== 'session')  
    return mountSession();

  // legacy  
  if (p\[0\] \=== 'practice') ...  
  if (p\[0\] \=== 'result') ...

  ...  
}

とします。

これなら**renderer・mic・audioの既存実機確認環境を失わず、v0.8とv0.9を同じiPhoneで比較できます。**

SPECのMigration Strategyそのものです。 

Product SPEC v0.9

---

# **4\. 最初に作るべきファイル：AudioContextの一本化**

ここは予定より重要です。

現在、

`src/audio.js`

let ctx \= null

でAudioContextを所有しています。

ところが `src/mic.js` も、

let ctx \= null  
...  
ctx \= new AudioContext()

と**別AudioContextを持っています。**

さらにcapture時間は、

const start \= performance.now()  
...  
t \= (now-start)/1000

です。

これはv0.9 SPECの、

AudioContext clockをTransportの基準時刻とする  
 Session全体でcaptureしEvent SING Windowごとにslice

と両立しません。 

Product SPEC v0.9

なので最初にこれを作ります。

## **ADD**

## **`src/audio/context.js`**

責務：

getAudioContext()  
getMasterBus()

primeAudio()  
ensureAudio()

audioTime() // ctx.currentTime

**AudioContextはこのファイルだけが生成する。**

---

## **MODIFY**

## **`src/audio.js`**

今のファイルを消さない。

ここから、

getCtx()  
master  
primeAudio()  
ensureAudio()

だけ `audio/context.js` へ移動。

既存APIはre-exportして、

export {  
  primeAudio,  
  ensureAudio  
} from './audio/context.js'

としておく。

旧 `practice()` を壊しません。

現在の

demoPhrase()  
countIn()

もlegacy用として一旦残します。

---

## **MODIFY**

## **`src/mic.js`**

自前のAudioContextを削除。

\-let ctx \= null  
\+import { getAudioContext } from './audio/context.js'

さらにVertical Slice用APIを追加します。

startSessionCapture()  
stopSessionCapture()  
getSessionSamples()

sampleは、

{  
  t: ctx.currentTime,   // 絶対AudioContext time  
  hz,  
  rms,  
  clarity  
}

にする。

**exerciseを見てsampleをfilterしない。**

現行 `capture(durationSec, exercise...)` はlegacy wrapperとして残してよいです。

---

# **5\. Transport本体**

## **ADD**

## **`src/session/transport.js`**

これはv0.9の中心です。

Transportが持つのは、

{  
  bpm,  
  beatsPerBar,  
  originTime,  
  state  
}

程度でよい。

最低API：

createTransport({ audioContext, bpm, beatsPerBar })

transport.startAt(audioTime)

transport.currentBeat()  
transport.timeAtBeat(beat)  
transport.beatAtTime(audioTime)

transport.position()  
// {  
//   beat,  
//   bar,  
//   beatInBar  
// }

transport.pause()  
transport.resumeAtBoundary()  
transport.stop()

### **特に重要なルール**

Transportは、

setTimeout(...)  
performance.now()  
CSS animation time  
Audio.currentTime

を基準にしない。

唯一、

audioContext.currentTime

を見る。

SPECが明示する最重要技術要件です。 

Product SPEC v0.9

---

# **6\. Count-inもTransport clockへ載せる**

ここは現在の `countIn()` をそのまま使わない方がいい。

現在はWebAudioで音をscheduleしたあと、

await sleep(spb \* 4 \* 1000 \+ 50)

しています。

Vertical Sliceでは例えば、

Transport beat 0 \= Grooveの最初の頭

として、

\-4  COUNT 1  
\-3  COUNT 2  
\-2  COUNT 3  
\-1  COUNT 4  
 0  GROOVE START

と扱うのが一番きれいです。

## **ADD**

## **`src/audio/countIn.js`**

scheduleCountIn(transport, {  
  fromBeat: \-4,  
  toBeat: 0  
})

音は必ず、

transport.timeAtBeat(-4)  
transport.timeAtBeat(-3)  
...

へWeb Audio schedulingする。

こうすれば、

**count-in → groove の境界で絶対に時計が切り替わりません。**

---

# **7\. Session Timeline**

## **ADD**

## **`src/session/timeline.js`**

Curriculum Schedulerが出したSession Planを、実行可能なbeat timelineにします。

SPECのEvent：

{  
  eventId,  
  familyId,  
  variantId,

  startBeat,  
  prepareBeat,  
  singStartBeat,  
  singEndBeat,

  presentationMode,  
  modelPolicy,  
  morphPolicy,  
  scoringPolicy  
}

をそのまま扱います。 

Product SPEC v0.9

APIは、

createTimeline(sessionPlan)

timeline.eventAtBeat(beat)  
timeline.phaseAtBeat(beat)  
timeline.nextEvent(beat)  
timeline.validate()

程度。

`phaseAtBeat()` から、

PREPARE  
MODEL  
AUDIATE  
SING  
FEEDBACK  
SPACE

を求めます。

**EventごとにsetTimeoutを作らない。**

---

# **8\. Session Engine**

## **ADD**

## **`src/session/engine.js`**

Transportを「どう使ってSessionを進めるか」はここ。

責務：

Session Planを受け取る  
↓  
Transport生成  
↓  
continuous mic capture開始  
↓  
count-in  
↓  
groove  
↓  
Event phase更新  
↓  
score cue  
↓  
sing window  
↓  
Event scoring  
↓  
feedback  
↓  
次Event  
↓  
Session finish

重要なのは、

**Engine自身も時計を持たない。**

毎frame、

const beat \= transport.currentBeat()  
const phase \= timeline.phaseAtBeat(beat)

と問い直します。

`requestAnimationFrame()` は描画更新のトリガーには使うが、

elapsed \+= ...

のような時間計算には使わない。

---

# **9\. app-v08.js とEngineの間にViewを1枚置く**

直接EngineからDOMを触らせない方がいいです。

## **ADD**

## **`src/session/player.js`**

こいつが `#/session` のcontroller。

export async function mountSession({ app, navigate }) {  
  const plan \= buildDailySessionPlan(...)  
  const view \= createSessionView(...)  
  const engine \= createSessionEngine(...)

  await engine.start(plan)  
}  
---

## **ADD**

## **`src/ui/sessionView.js`**

DOM責務だけ。

表示：

SESSION progress  
Bar / Beat

score viewport  
playhead

SEE / LISTEN / SING  
軽い ✓ / △

count-in overlay  
pause

Session中には、

「歌う」  
「お手本」  
「次へ」

ボタンを出さない。

SPECの変更点と一致します。 

Product SPEC v0.9

---

# **10\. Notationは触らない**

これはかなり強く推します。

## **KEEP AS-IS**

src/notation.js  
src/notation/layout.js  
src/notation/follow.js

現行rendererはVexFlowの実staff位置からgeometryを構築し、

C4 補助線  
G4 第二線

を守るところまで来ています。

followも現在、

updateFollower(..., progress)

という単純な外部APIです。

これはv0.9との相性が非常にいい。

Session Engine側で、

const progress \=  
  (transport.currentBeat() \- event.singStartBeat)  
  / phrase.totalBeats;

updateFollower(..., progress);

とするだけです。

つまり、

**playheadをTransportへ移すのではなく、Transportから算出したprogressを既存followへ渡す。**

rendererの中にTransport知識を入れません。

---

# **11\. Variant → 現行rendererのadapterを作る**

現行notationは、

ex.notes  
ex.totalBeats  
ex.bpm  
ex.key

というexercise shapeを要求します。

新Variantにrendererを合わせて書き直すべきではありません。

## **ADD**

## **`src/curriculum/materialize.js`**

materializeScoreModel(variant, event, sessionPlan)

出力：

{  
  id: variant.variantId,  
  key: event.key,  
  bpm: sessionPlan.bpm,  
  meter: variant.meter,  
  notes: variant.notes,  
  totalBeats,  
  chords  
}

これを既存 `renderNotation()` へ渡す。

**新Curriculumと旧notationのanti-corruption layer**です。

---

# **12\. Phrase Morph**

## **ADD**

## **`src/notation/morph.js`**

rendererを書き換えず、既存SVGへ作用させます。

現行のnote elementにはすでに、

data-note-index="..."

があります。

これを利用して、

showInsert(...)  
showChange(...)  
showExtend(...)  
clearMorph(...)

を実装。

Vertical SliceではSPEC指定の、

INSERT  
EXTEND  
CHANGE

だけ。 

Product SPEC v0.9

Morph後は普通の譜面へ戻す。

---

# **13\. Groove**

## **ADD**

## **`src/audio/groove.js`**

Vertical Sliceでは凝らない。

最初は、

quarter pulse  
\+  
C root / fifth

程度。

重要なのは音質より、

**「Cの中」「4小節のどこか」が消えないこと。**

Product SPECもVertical Sliceでは軽量生成音源を認めています。 

Product SPEC v0.9

API：

groove.start(transport, harmonyTimeline)  
groove.stop()

内部schedulerに `setInterval` を使ってlookaheadしても構いません。

ただしschedule先は常に、

transport.timeAtBeat(...)

です。

`setInterval` 自身を時計にしない。

---

# **14\. Model音**

## **ADD**

## **`src/audio/model.js`**

現行 `demoPhrase()` の**音色生成知見だけ再利用**します。

ただし現在のお手本は、

new Audio(wavUrl(ex))  
a.play()

で、HTMLAudioの `currentTime` を使っています。

これはContinuous Transportには入れない。

v0.9 modelは、

scheduleModel(scoreModel, {  
  startTime: transport.timeAtBeat(...)  
})

としてWebAudioへ直接schedule。

Teacher Call / Answer Echoも同じ。

SPECもVertical Sliceでは高度な人声は不要としています。

---

# **15\. Scoringは「作り直さない」**

現在の `scoreAttempt()` はかなり使えます。

すでに、

noteAccuracy 70%  
continuity 20%  
timingCoarse 10%  
±85 cents  
octave folding

があります。

SPECもこの思想をVertical Sliceで維持するとしています。 

Product SPEC v0.9

## **KEEP**

src/scoring.js  
src/music/pitch.js  
src/pitchDetector.js  
---

## **ADD**

## **`src/scoring/eventScoring.js`**

役割は**絶対時間 → 旧scoreAttemptの相対時間**へのadapter。

概念：

const singTime \=  
  transport.timeAtBeat(event.singStartBeat);

const samples \= sessionSamples  
  .filter(s \=\>  
    s.t \>= singTime \- margin &&  
    s.t \<= transport.timeAtBeat(event.singEndBeat) \+ margin  
  )  
  .map(s \=\> ({  
    ...s,  
    t: s.t \- singTime  
  }));

return scoreAttempt(  
  scoreModel,  
  samples,  
  latencyMs  
);

これで現行採点をほぼ無変更で再利用できます。

SPECが求める、

Session全体でcaptureしEvent SING Windowごとにslice

をそのまま実現できます。 

Product SPEC v0.9

---

# **16\. Session Summary**

## **ADD**

## **`src/scoring/sessionScoring.js`**

Event resultを集約。

最低限、

{  
  eventResults,  
  readScore,  
  stars,  
  strengthenedFamilies,  
  misses  
}

を生成。

★thresholdそのものは現行思想を維持。

ただし**Sessionの★をどう集約するかはSPECに厳密な数式がない**ので、ここは定数化して後で実機データから調整できるようにします。

---

## **ADD**

## **`src/ui/sessionSummary.js`**

現行resultの良い部分を再利用：

★★★★★  
coaching  
Pitch / Time / Flow details  
pitch guide

ただし1 exerciseではなくSession全体。

現行の「★主表示、詳細は折りたたみ」は明確に残す対象です。 

Product SPEC v0.9

---

# **17\. Curriculumデータ**

## **ADD**

src/curriculum/stages.js  
src/curriculum/phraseFamilies.js  
src/curriculum/variants.js  
src/curriculum/mastery.js  
src/curriculum/scheduler.js

Vertical Slice対象はStage 0〜3だけ。

Curriculum Specも、

Stage 0 Staff Anchor  
Stage 1 DO / SOL in Time  
Stage 2 Tonic Shape  
Stage 3 Make the Line

を指定しています。 

Curriculum Spec v1

Phrase Familyはまず3〜5。

---

# **18\. src/exercises.js は消さない**

これは重要です。

Product SPECは、

v0.8互換教材として残してよいが、新カリキュラムの正本にはしない

としています。 

Product SPEC v0.9

したがって、

src/exercises.js

は、

**legacy \+ notation/scoring regression fixture**

として残す。

新Schedulerからはimportしない。

これはかなり有用です。現在の `p01` 等を使えば、新Transport化後も

C4 geometry  
G4 geometry  
pitch scoring  
octave fold

の回帰確認ができます。

---

# **19\. Storageは新キーで並走させる**

現在は、

const KEY='bebop-reader-state-v2'

でexercise masteryを保存しています。

Vertical Sliceでいきなりこれを書き換えると旧practiceが壊れる。

なのでまず、

## **ADD**

## **`src/storage-v3.js`**

bebop-reader-state-v3

を使用。

保持：

{  
  version: 3,  
  familyMastery,  
  variantHistory,  
  stageProgress,  
  keyProgress,  
  reviewQueue,

  streak,  
  lastPracticeDate,  
  totalSessions,

  settings,

  currentSession,  
  lastSessionResult  
}

v2から、

streak  
settings  
latencyMs  
practice history

だけ移す。

旧masteryは明示mappingできるものだけ。

SPEC通りです。 

Product SPEC v0.9

**v2 keyは消さない。**  
 ロールバック可能にします。

---

# **20\. Answer EchoはTransportを止めずに差し込む**

MISS時：

score result  
↓  
Transport continues  
↓  
next available SPACE  
↓  
model Answer Echo  
↓  
後続Event  
↓  
数Event後のDelayed Read

にする。SPECの失敗モデルです。 

Product SPEC v0.9

実装としては `timeline.js` に、

reserveNextSpace(afterBeat)

を用意し、

Engineが、

if (result.isMiss) {  
  const beat \= timeline.reserveNextSpace(...)  
  model.schedule(..., transport.timeAtBeat(beat))  
}

とするのがよいです。

**Session Plan全体を再生成しない。Transportも再起動しない。**

---

# **21\. CSS**

既存を壊さないため、

## **ADD**

## **`session-v09.css`**

に限定。

.session-player  
.session-phase  
.session-progress  
.session-feedback  
.session-count-in  
.session-debug  
.score-transition  
.morph-insert  
.morph-change

など。

`styles.css`  
 `v08.css`  
 `pitch-guide.css`

はVertical Slice中は極力触らない。

---

# **22\. Service Worker**

現在SWはファイルを明示列挙し、cache名も `bebop-reader-v8` です。

## **MODIFY**

## **`sw.js`**

\-bebop-reader-v8  
\+bebop-reader-v09-slice-1

として新モジュールをCOREへ追加。

Continuous Sessionが実機では新コードなのに古いcacheを踏む、という事故を避けます。

---

# **23\. index.html**

Vertical Slice開発中は、

\<script type="module" src="./app-v08.js"\>\</script\>

を**変えない**。現在ここが正本入口です。

Home START切替まで通った後で、

app-v08.js  
↓  
app-v09.js

へrenameする。

つまり名前の変更は最後。

---

# **24\. Tests**

現在テストは、

exercise integrity  
YIN  
synthetic scoreAttempt

程度です。

追加する順番はこれ。

tests/  
  transport.test.mjs  
  timeline.test.mjs  
  curriculum.test.mjs  
  event-scoring.test.mjs  
  storage-v3.test.mjs

### **Transport**

beat ↔ AudioContext time  
bar / beat  
5分後もdriftしない計算

### **Timeline**

Event overlapなし  
SING window overlapなし  
phase切替

### **Event scoring**

絶対AudioContext timestampのsynthetic sampleから、

Event Aだけを正しくslice  
Event Bが混ざらない  
latencyMsが維持  
octave folding維持

### **Curriculum**

SPEC指定：

parentVariant存在  
allowed stage  
allowed presentation  
cold read integrity

### **Storage**

v2 → v3  
streak保持  
settings保持  
旧masteryを勝手に新mastery化しない

SPECのtest要件とも一致します。 

Product SPEC v0.9

---

# **25\. 実際の変更セットをPR単位にするとこうなる**

### **Change 1 — Clock foundation**

ADD    src/audio/context.js  
MOD    src/audio.js  
MOD    src/mic.js  
ADD    src/session/transport.js  
ADD    tests/transport.test.mjs

**Exit:** audio outputとmic sampleが同一AudioContext clock。

---

### **Change 2 — Curriculum skeleton**

ADD    src/curriculum/stages.js  
ADD    src/curriculum/phraseFamilies.js  
ADD    src/curriculum/variants.js  
ADD    src/curriculum/materialize.js  
ADD    src/curriculum/scheduler.js  
ADD    tests/curriculum.test.mjs

まだHomeには繋がない。

---

### **Change 3 — Static Continuous Session**

ADD    src/session/timeline.js  
ADD    src/session/engine.js  
ADD    src/session/player.js  
ADD    src/audio/countIn.js  
ADD    src/audio/groove.js  
ADD    src/ui/sessionView.js  
ADD    session-v09.css  
MOD    app-v08.js  
MOD    index.html

この段階ではdebug用固定Session Planでもよい。

**Exit:**

tap  
→ 4 count  
→ groove  
→ 5分止まらない  
→ scoreが出る

まずここをiPhoneで通す。

---

### **Change 4 — Continuous scoring**

ADD    src/scoring/eventScoring.js  
ADD    src/scoring/sessionScoring.js  
MOD    src/mic.js  
ADD    tests/event-scoring.test.mjs

**Exit:** 複数SING Windowを1本のsession captureから個別採点。

---

### **Change 5 — Musical teaching loop**

ADD    src/audio/model.js  
ADD    src/notation/morph.js  
MOD    src/session/engine.js  
MOD    src/session/timeline.js  
MOD    src/ui/sessionView.js

**Exit:**

BUILD  
COLD\_READ  
DELAYED\_READ  
TEACHER\_CALL  
ANSWER\_ECHO

INSERT  
EXTEND  
CHANGE

がTransportを止めず成立。

これはVertical Slice必須範囲です。 

Product SPEC v0.9

---

### **Change 6 — Mastery / Storage**

ADD    src/storage-v3.js  
ADD    src/curriculum/mastery.js  
MOD    src/curriculum/scheduler.js  
ADD    tests/storage-v3.test.mjs

ここで初めてadaptive Sessionへ。

---

### **Change 7 — Session Summary**

ADD    src/ui/sessionSummary.js  
MOD    src/session/player.js

Pitch Guideは既存を再利用。

---

### **Change 8 — Home cutover**

MOD app-v08.js

変更は主に、

\-const d \= daily()  
...  
\-START → /practice/pXX

\+const plan \= buildDailySessionPlan(...)  
\+START → /session

だけ。

Libraryのlegacy exerciseはまだ生かしてよい。

---

### **Change 9 — PWA / production cut**

MOD sw.js  
MOD build tag  
MOD index.html

実機acceptanceを全部通した後、

app-v08.js → legacy  
app-v09.js → entry

へ。

---

# **最終的なファイル構造**

app-v09.js

src/  
  audio.js                  \# legacy facade

  audio/  
    context.js              \# ★ singleton AudioContext  
    countIn.js  
    groove.js  
    model.js

  curriculum/  
    stages.js  
    phraseFamilies.js  
    variants.js  
    materialize.js  
    mastery.js  
    scheduler.js

  session/  
    transport.js            \# ★唯一のclock  
    timeline.js  
    engine.js  
    player.js

  notation.js               \# KEEP  
  notation/  
    layout.js               \# KEEP  
    follow.js               \# KEEP  
    morph.js                \# NEW

  mic.js                    \# shared context \+ session capture  
  pitchDetector.js          \# KEEP

  music/  
    pitch.js                \# KEEP

  scoring.js                \# KEEP legacy core  
  scoring/  
    eventScoring.js  
    sessionScoring.js

  pitchGuide.js             \# KEEP

  storage.js                \# v2 legacy during migration  
  storage-v3.js             \# NEW

  ui/  
    sessionView.js  
    sessionSummary.js

  exercises.js              \# legacy/regression fixture

# **一番重要な実装判断**

この移行で中心になるのはSchedulerでもMorphでもありません。

**最初に固定すべき契約はこれです。**

AudioContext.currentTime  
        ↓  
     Transport  
        ↓  
 ┌──────┼──────────┐  
groove score cue   mic sample  
model  playhead    scoring window  
morph  feedback    harmony  
 └──────┴──────────┘

今のコードでは

audio.js → AudioContext A  
mic.js   → AudioContext B  
capture  → performance.now  
demo     → HTMLAudio.currentTime  
UI       → requestAnimationFrame

と時間軸が複数あります。

**これらを全部「Transportから時間を聞く側」に変えることがv0.9化そのものです。**

そして `renderNotation / layout / follow / YIN / octave folding / scoreAttempt` は、時間軸の外側にあるためほぼそのまま残せる。ここを触らないことで、v0.8まで積み上げた品質をかなり安全に持っていけます。Product SPECの「既存の動くものを無意味に書き直さない」とも一致します。 

Product SPEC v0.9

この順なら、**Change 3の時点で「Continuous Musical Reading Gameになったか」を実機で判定できる**ので、そこから先のCurriculumやMasteryを、間違ったゲームループの上に積み上げる事故も避けられます。

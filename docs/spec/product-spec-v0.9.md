# **Bebop Reader — Product SPEC v0.9**

## **READ → SING → FLOW**

### **Continuous Musical Reading Game**

---

# **0\. このSPECの位置づけ**

本書を、Bebop Readerの**今後のProduct SPEC正本**とする。

旧 `Bebop Reader — プロジェクト引き継ぎ仕様 v0.8` は履歴として保存するが、今後の新規実装判断には本書を優先する。

ただしv0.8以降、実機確認を通じてコード側で改善された仕様があるため、本書は旧SPECを文章上更新したものではなく、

**旧SPEC ＋ 現在のmainブランチ実装 ＋ 教材方針 rev3 ＋ Curriculum Spec v1**

を統合した再定義である。

---

# **1\. Source of Truth**

仕様間で矛盾した場合、以下の優先順位を用いる。

## **1\. Product SPEC v0.9**

アプリ全体のUX、ゲームループ、システム責務、技術要件。

## **2\. Curriculum Spec v1**

何を、どの順序で、どのようなLearning Eventとして経験させるか。

## **3\. 教材の方針 rev3**

学習思想・教材設計原理。

## **4\. GitHub main**

**既に実装され実機確認された挙動**については、旧SPECより現在コードを優先する。

Repository:

`2nd-Bird/bebop-reader`

現在の実行入口は `app-v08.js` である。

## **5\. SPEC v0.8**

過去の意図・経緯を確認する資料として扱う。

---

# **2\. サービス定義**

Bebop Readerは、ジャズを題材とした読譜・視唱トレーニングPWAである。

ただしv0.9以降は、

**「読譜問題を一問ずつ解くアプリ」**

ではなく、

**「ジャズが流れ続ける時間の中へ読譜課題が現れ、それを歌いながらクリアしていく音楽ゲーム」**

として定義する。

最終的には、

**Blues / Rhythm Changes上で、ビバップの語彙を譜面から即座に読み、歌い、Parkerの生成文法に従って組み替え、即興へ接続できること**

を目指す。

キャッチコピー：

**READ → SING → FLOW**

---

# **3\. Productの中心体験**

ユーザーが感じる中心体験は、

**譜面を一つ読む → 採点を見る → 次の問題**

ではない。

セッションを開始すると音楽が始まる。

その後、

**音楽は原則として止まらない。**

流れているbeat / groove / formの中へ譜面が現れる。

ユーザーは譜面を先読みし、決められた場所で歌う。

歌い終えても曲は続く。

次のphraseが現れる。

そのphraseが少し変形する。

以前のphraseが忘れた頃に再び現れる。

結果として、

**「問題を何問解いたか」よりも、「音楽の中で何分間読み続けられたか」**

が体験の中心になる。

---

# **4\. v0.8からの最大変更**

現在コードでは、

Daily Sessionを生成  
↓  
exerciseを開く  
↓  
必要ならお手本  
↓  
歌う  
↓  
4拍count-in  
↓  
capture  
↓  
採点  
↓  
result画面  
↓  
次exercise

という構造である。実際に `daily()` が教材を最大9件選択し、各exerciseでcount-in、capture、採点後に `/result/` へ遷移している。

v0.9ではこれを、

Daily Session生成  
↓  
Audio / Micをprime  
↓  
Session Count-in  
↓  
Continuous Transport START  
↓  
Learning Event  
↓  
Learning Event  
↓  
Learning Event  
↓  
...  
↓  
Continuous Transport END  
↓  
Session Summary

へ置き換える。

**count-inは原則Session開始時に一度だけ。**

**問題ごとのresult画面は廃止する。**

---

# **5\. マクロゲームとミクロゲームを分離する**

Bebop Readerには二種類のゲーム構造を持たせる。

## **5.1 Macro Game**

Duolingo的進行管理。

* Stage  
* mastery  
* streak  
* Daily Session  
* retention  
* weak point review  
* new material unlock  
* key unlock  
* BPM unlock  
* Blues unlock  
* Rhythm Changes unlock

を扱う。

## **5.2 Micro Game**

実際にSession中に遊ぶ音楽ゲーム。

* groove  
* form  
* score appearance  
* Phrase Morph  
* Teacher Call  
* singing window  
* Answer Echo  
* cold reading  
* continuous flow

を扱う。

したがって、

**学習進行はDuolingo的、プレイ体験は音楽ゲーム的**

とする。

---

# **6\. Session**

通常のDaily Sessionは約5〜7分を基本とする。

exercise数は固定しない。

phraseの長さやformによってLearning Event数を変える。

初期Stageではおよそ8〜15 Event程度を想定するが、**問題数自体をユーザーへの主要指標にしない。**

ホームには引き続き、

`TODAY · 7 MIN`

のような時間表現を優先する。

---

# **7\. Musical Field**

Learning Eventは必ず何らかのMusical Field内に存在する。

## **初期**

### **Training 4**

4小節loop。

基本例：

Bar 1  
Groove / tonal orientation

Bar 2  
SEE / AUDIATE

Bar 3  
SING

Bar 4  
Response / space

ただし常にBar 3固定にはしない。

Masteryが進むとphraseの出現位置を変更する。

---

## **中期**

### **Phrase 8**

8小節。

* pickup  
* barline crossing  
* 2-bar phrase  
* entry variation  
* ending variation

を扱う。

---

## **後期**

### **12-bar Blues**

I / IV / V上でPhrase FamilyをMOVEする。

---

### **Rhythm Changes**

32小節form。

A section / Bridgeを含む長時間構造の中で読譜・再構成する。

---

# **8\. Continuous Transport**

v0.9の最重要技術要件。

Sessionには一つの**Transport Clock**を持つ。

すべての、

* groove  
* metronomic pulse  
* harmonic changes  
* score cue  
* model phrase  
* singing window  
* microphone scoring window  
* visual playhead  
* Phrase Morph  
* feedback

を同じ時間軸から導出する。

各exerciseが独自にタイマーを開始してはならない。

---

# **9\. Audio architecture**

現在の `audio.js` はWeb Audio Contextを直接管理し、iPhoneでのaudio開始対策としてuser gesture時の `primeAudio()` を持つ。またお手本は生成WAVをHTMLAudio経由で再生している。

この実機確認済みの知見は維持する。

ただしcontinuous sessionでは、Session全体の時間精度が必要なため、

**AudioContext clockをTransportの基準時刻とする。**

---

## **9.1 Session開始**

ユーザーが「はじめる」をtap。

この一gestureで可能な限り、

* AudioContext resume  
* silent audio prime  
* microphone permission / initialization  
* backing assets preparation

を済ませる。

その後4拍count-in。

Transport開始。

---

# **10\. Groove**

初期Training Loopでも、完全な無音＋metronomeにはしない。

少なくとも、

**Pulse \+ Tonal Center**

を感じられる伴奏を持つ。

v0.9 Vertical Sliceでは、軽量な生成音源でよい。

候補：

* ride / hi-hat的pulse  
* bass root / fifth  
* tonic drone  
* very simple shell voicing

ただし伴奏が読譜を妨げないことを最優先する。

Session中の音響目的は、

**「正解音を教えること」ではなく、「Cの中で、拍の中で歌っている感覚を維持すること」**

である。

---

# **11\. Harmony Timeline**

Musical Fieldはharmony timelineを持つ。

例：

{  
  "form": "training-4",  
  "bars": \[  
    {"bar": 1, "chord": "C"},  
    {"bar": 2, "chord": "C"},  
    {"bar": 3, "chord": "C"},  
    {"bar": 4, "chord": "C"}  
  \]  
}

後に、

Dm7 | G7 | C | C

や12-bar Blues、Rhythm Changesへ拡張する。

Phrase VariantそのものとHarmony Timelineを分離する。

---

# **12\. Learning Event**

Session内の教材単位。

Learning Eventは、

Phrase Family  
×  
Variant  
×  
Key  
×  
Harmony  
×  
Form  
×  
Form Position  
×  
Presentation Mode

で決まる。

従来のexerciseは、

**「譜面そのもの」と「いつどう出題するか」が一体化**

していた。

v0.9では分離する。

---

# **13\. Phrase Family / Variant**

Curriculum Spec v1に従う。

例：

Family:  
tonic-descend-01

SEED  
G → E

GROW  
G F E

EXTEND  
G F E D C

CHANGE  
rhythm mutation

MOVE  
別harmony

FLOW  
bebop surface

`src/exercises.js` に現在存在するLevel 1〜8の固定exercise列は、v0.8互換教材として残してよいが、新カリキュラムの正本にはしない。

現在の教材は実際に、

`ド・ソ → ＋ミ → ＋レ → ＋ファ → ＋ラ → ＋シ...`

という旧Levelモデルで格納されている。

---

# **14\. Presentation Modes**

少なくとも以下を実装可能な構造とする。

## **BUILD**

前VariantからのMorphあり。

構造学習用。

---

## **COLD\_READ**

Morphなし。

Modelなし。

Mastery評価の中心。

---

## **DELAYED\_READ**

BUILD後、他Eventを挟んで再出現。

---

## **TEACHER\_CALL**

前のslotでmodel。

次のslotでユーザー。

---

## **ANSWER\_ECHO**

失敗後、次の空きslotでmodelが正答を返す。

---

## **SHADOW**

modelと一緒に歌う。

Mastery対象外。

---

## **FLOW**

repeat / mutation / connect / trade等。

---

# **15\. Event Phase**

一つのLearning Eventは内部的に状態を持つ。

標準：

QUEUED  
↓  
PREPARE  
↓  
AUDIATE  
↓  
SING  
↓  
FEEDBACK  
↓  
RESOLVED

Presentation Modeによって、

MODEL  
MORPH  
ECHO  
SHADOW

等が途中に入る。

---

# **16\. Session State Machine**

Session全体は少なくとも以下の状態を持つ。

IDLE

↓

PRIMING  
Audio / Mic preparation

↓

COUNT\_IN

↓

PLAYING

  ├─ EVENT\_PREPARE  
  ├─ EVENT\_MODEL  
  ├─ EVENT\_AUDIATE  
  ├─ EVENT\_SING  
  ├─ EVENT\_FEEDBACK  
  └─ EVENT\_SPACE

↓

FINISHING

↓

SESSION\_SUMMARY

Event遷移によってTransportをstop / restartしてはならない。

---

# **17\. 譜面表示**

普通の五線譜への転移を最優先する。

維持するもの：

* ト音記号  
* 拍子  
* 小節線  
* 補助線  
* 通常のstem  
* beam  
* rest  
* accidental  
* chord表示

教材専用のGuitar Hero型scroll譜面にはしない。

---

# **18\. 現行notation資産の扱い**

現在はnotation layoutが独立し、

* pitch → vertical position  
* beat → horizontal position  
* score width

を一元的に処理している。

また長い譜面について、playheadがviewport端へ近づいた場合だけ必要量scrollするfollow controllerが既に存在する。

この思想はそのまま維持する。

---

# **19\. Scoreの時間表示**

譜面は基本的には先読み可能な静止譜である。

Learning Eventの開始に合わせて突然一音ずつ流れてくる方式にしない。

ユーザーは、

**これから歌うphrase全体を先に見る**

必要がある。

長いphraseのみ、既存のcontext-preserving followを使う。

---

# **20\. Phrase Morph**

BUILD Event時のみ利用する。

通常譜Aから通常譜Bへのtransitionとして、

* INSERT  
* REMOVE  
* CHANGE  
* EXTEND  
* MOVE  
* DENSIFY  
* RHYTHM CHANGE

を視覚化する。

Morph中だけ、

* 新しく現れるnote  
* 消えるnote  
* 移動するnote

を強調してよい。

終了後は普通の五線譜へ戻す。

---

# **21\. Audiate Window**

READ → SINGの間には短いAudiation時間を確保する。

この間、model phraseを鳴らしてはならない。

ユーザーは譜面から内的に音を作る。

初期例：

Score appears  
↓  
約1〜2拍のpre-read  
↓  
SING window

具体時間はStage / tempo / phrase長によってSchedulerが決める。

---

# **22\. お手本**

「お手本ボタンを押して聞いてから歌う」を通常ループにしない。

Model playbackには明確な役割を与える。

## **Teacher Call**

新規構造導入。

## **Morph Demo**

変形後の形を必要時のみ提示。

## **Answer Echo**

失敗時。

## **Shadow**

救済。

COLD\_READでは原則model禁止。

---

# **23\. Model音**

v0.9 Vertical Sliceでは現在のお手本生成技術を再利用してよい。

高度な人声生成は必須ではない。

まず必要なのは、

**pitch / rhythm / entryが明瞭なmodel**

である。

後に、

* scat voice  
* sax-like timbre  
* higher-quality sampled sound

等を検討可能にするが、Curriculum Engineからは独立させる。

---

# **24\. Microphone / Pitch Detection**

現在のブラウザ内処理を維持する。

getUserMedia  
↓  
Web Audio  
↓  
YIN pitch detection  
↓  
Hz → MIDI  
↓  
targetとの比較

server-side AIはv0.9必須要件にしない。

---

# **25\. Moving Do / Octave Folding**

現在実装の基本思想を維持する。

教材譜面がC4であっても、男性声がC3を歌ったこと自体を誤答にはしない。

相対的なscale degreeを読めたかを重視する。

---

# **26\. Scoring**

現在コードでは読譜判定を声楽intonation採点より緩くし、目標scale degreeを明確に意図した歌唱として±85 centsまで許容している。

内部reading scoreは、

* noteAccuracy 70%  
* continuity 20%  
* coarse timing 10%

で構成され、最終的に★1〜5へ丸めている。

この考え方をv0.9 Vertical Sliceでも維持する。

---

# **27\. Continuous Session用Scoring**

現在の `scoreAttempt(ex, samples)` はexercise全体を単位としている。

v0.9では、

**Session全体でcaptureし、Event SING Windowごとにsliceして採点する**

構造へ変更する。

概念：

Session Capture  
|  
|-- Event 1 scoring window  
|-- Event 2 scoring window  
|-- Event 3 scoring window  
...

各EventごとにAudioContext基準の絶対時刻を持たせる。

---

# **28\. Feedback**

演奏中に、

C 正解！  
E 正解！

のような逐次採点を表示しない。

Event終了時のみ、

* ✓  
* △  
* small glow  
* subtle sound

程度の軽いfeedbackを許可する。

feedbackでTransportを止めない。

---

# **29\. 失敗体験**

失敗時に、

不正解  
↓  
retry button  
↓  
count-in

には戻さない。

基本：

MISS  
↓  
music continues  
↓  
Answer Echo  
↓  
another event  
↓  
delayed retry

とする。

失敗をゲーム停止イベントにしない。

---

# **30\. Session Summary**

詳細結果画面は一問ごとではなくSession終了後。

主表示：

* Session completed  
* Stars / overall reading  
* Streak  
* newly strengthened material  
* unlock

詳細展開時：

* Pitch  
* Time  
* Flow  
* note-level trace  
* DAM型pitch visualization

現行のPitch / Time / Flowを裏側に置き、★を主結果とする方針を維持する。

---

# **31\. Reward**

主要報酬はXPではない。

**できる音楽が増えること**

を報酬とする。

例：

* New Note  
* New Phrase Family  
* Swing  
* ii–V–I  
* New Morph  
* F Major  
* Blues  
* Relative Major  
* Relative Minor  
* Double Time  
* B♭  
* Rhythm Changes

unlock時はSession終了後に明確に演出する。

---

# **32\. Home**

現在のホーム構造は大枠維持可能。

主要要素：

TODAY · 7 MIN

現在のStage / World

今日のSession

START

Streak

Mastery

Unlocked Musical Worlds

現在の「C / F / B♭ world」表現も活用可能。

ただし、

「パッと見で歌える音を増やす」

のような旧カリキュラム依存コピーは、

**「読める動きを育てる」**

方向へ変更する。

---

# **33\. Library**

従来の、

* Pitch  
* Scale  
* Arpeggio  
* Rhythm  
* Phrase

という分類だけを中心にしない。

将来的には、

### **Stages**

### **Phrase Families**

### **Forms**

### **Keys**

等から教材世界を見られるようにする。

ただしDaily Sessionではユーザーに細かく選ばせすぎない。

---

# **34\. Progress**

Progress画面は「Level 1〜8」を廃止し、

**Stage Map**

を表示する。

例：

Staff Anchor  
↓  
DO / SOL in Time  
↓  
Tonic Shape  
↓  
Make the Line  
↓  
Harmonic Family  
↓  
ii–V–I  
↓  
Two Generators  
...  
↓  
Blues  
↓  
Rhythm Changes

Key Unlockは別軸。

C  
F  
B♭  
---

# **35\. Curriculum Runtime**

新たにCurriculum Runtime層を設ける。

責務：

* current Stage決定  
* Phrase Family mastery取得  
* due review取得  
* new material選択  
* BUILD / READ比率決定  
* Event生成  
* Session Timeline生成  
* stage gate判定  
* unlock判定

UI controller内にcurriculum判断を書かない。

---

# **36\. Scheduler**

Schedulerは固定9 exercise選択を置き換える。

初期優先順位：

1. due COLD READ  
2. weak mastery  
3. new Phrase Family  
4. GROW / CHANGE  
5. delayed READ  
6. rhythm transfer  
7. harmonic/form transfer  
8. FLOW

一Sessionで新規familyを増やしすぎない。

Stage 0〜3では原則1〜2 family。

---

# **37\. Data Model**

新教材データは少なくとも三層に分ける。

## **PhraseFamily**

構造的identity。

## **Variant**

実際に表示可能な譜面。

## **LearningEvent**

そのSessionでどのように出現するか。

`notes` 配列だけを教材正本にしない。

---

# **38\. Phrase Family Schema**

最低限：

{  
  familyId,  
  title,  
  stage,

  structure,  
  line,  
  cells,  
  harmonyRoles,

  variants,

  source: {  
    type,  
    hamaseRef,  
    sourcePage,  
    analysisRef  
  }  
}  
---

# **39\. Variant Schema**

最低限：

{  
  variantId,  
  familyId,

  phase,  
  parentVariant,

  notes,  
  rhythm,  
  meter,

  morphType,  
  morphTargets,

  allowedKeys,  
  allowedHarmony,  
  allowedPresentation,

  coldReadEligible  
}  
---

# **40\. Event Schema**

最低限：

{  
  eventId,

  familyId,  
  variantId,

  key,  
  harmonyContext,

  form,  
  formPosition,

  startBeat,  
  prepareBeat,  
  singStartBeat,  
  singEndBeat,

  presentationMode,

  modelPolicy,  
  morphPolicy,

  scoringPolicy  
}

これによってScore RendererとSession Engineを分離する。

---

# **41\. Session Plan**

Scheduler出力例：

{  
  sessionId,  
  bpm: 72,  
  key: "C",  
  form: "training-4",

  countInBars: 1,

  events: \[...\],

  totalBars: 28  
}

Session Engineは教材を選ばない。

与えられたSession Planを正確に演奏する。

---

# **42\. Storage v3**

現在storageは、

* exercise mastery  
* attempts  
* streak  
* settings  
* current session  
* last result

をlocalStorageへ保持する。

v0.9では新しいstate versionを作る。

最低限：

{  
  version: 3,

  familyMastery: {},  
  variantHistory: {},  
  stageProgress: {},  
  keyProgress: {},

  reviewQueue: {},

  streak,  
  lastPracticeDate,  
  totalSessions,

  settings,

  currentSession,  
  lastSessionResult  
}  
---

# **43\. v2 → v3 migration**

既存データを無条件に捨てない。

引き継ぐ：

* streak  
* settings  
* latencyMs  
* practice historyとして利用可能な情報

旧exercise masteryは、Phrase Familyと明示的対応があるものだけmappingする。

対応が曖昧なexerciseについて、

**新Curriculumのmasteryを勝手に付与しない。**

必要ならlegacy dataとして保持する。

---

# **44\. 推奨モジュール構成**

既存コードを段階的に移行する。

src/

  curriculum/  
    stages.js  
    phraseFamilies.js  
    variants.js  
    scheduler.js  
    mastery.js

  session/  
    transport.js  
    engine.js  
    timeline.js

  audio/  
    groove.js  
    model.js

  notation/  
    layout.js  
    follow.js  
    morph.js

  scoring/  
    eventScoring.js  
    sessionScoring.js

  storage.js

  mic.js  
  pitchDetector.js

完全一致を義務とはしないが、責務はこの粒度に分離する。

---

# **45\. 既存コードで残すもの**

優先的に再利用する。

### **Pitch Detection**

YIN系検出。

### **Moving-do octave folding**

### **Scoring logic**

読譜中心の粗いpitch判定。

### **Notation Renderer**

VexFlow＋現行geometry。

### **Layout**

pitch/beat座標の一元化。

### **Score Follow**

必要時のみcontext preserving scroll。

### **Audio Priming**

iPhone Safari対策。

### **PWA**

manifest / service worker / static hosting。

### **Settings**

solfege表示等。

---

# **46\. 作り直すもの**

大きく変更する。

### **`src/exercises.js`**

→ Phrase Family / Variant dataへ。

### **`daily()`**

→ Curriculum Schedulerへ。

### **`practice()`**

→ Session Playerへ。

### **`attempt()`**

→ continuous Event Window captureへ。

### **`result()`**

→ Session Summaryへ。

### **per-exercise mastery**

→ Phrase Family masteryへ。

---

# **47\. UIで残すもの**

実機確認済みの良い部分は維持する。

* iPhone縦持ち  
* Dark UI  
* 大きなscore  
* scoreを縮小しすぎない  
* 普通のnotation  
* Playhead  
* minimal result  
* ★中心  
* 詳細採点は折りたたみ  
* Home / Library / Progress / Settings

---

# **48\. UIで廃止・変更するもの**

### **Exerciseごとの大きな「歌う」ボタン**

Session開始後は不要。

Session開始時のSTARTだけで進行する。

---

### **毎問の「お手本」ボタン**

通常表示しない。

必要ならpauseしないhelp UIとして扱うが、Scheduler側のTeacher Call / Echoを基本にする。

---

### **毎問result画面**

廃止。

---

### **1/9等の問題数progress**

Session全体のtime / musical progressへ変更。

例：

SESSION  
████████░░

あるいはform progress。

---

# **49\. Pause**

ユーザー操作によるpauseは許可する。

ただし教材Eventによる自動pauseはしない。

Pause後の再開は、

* bar頭  
* phrase boundary

等の音楽的に自然な位置から再開する。

途中のbeatから突然再開しない。

---

# **50\. Background / interruption**

iPhoneでは、

* incoming call  
* app background  
* lock  
* Safari audio interruption

が発生する。

AudioContext停止またはvisibility changeを検知した場合、

Sessionを失敗扱いにしない。

Transportをpauseし、

ユーザー操作後にmusical boundaryからresumeする。

---

# **51\. Latency**

既存のlatencyMs settingを維持する。

Session Transport基準時刻とcapture timestampを分離しない。

全Event scoringは、

transportTime  
\+  
latency correction

で処理する。

---

# **52\. BPM**

BPMは教材難易度の独立軸。

同じPhrase Familyでも、

60  
72  
84  
96  
...

と育てる。

現在コードにもmasteryに応じて60→72→84→96へBPMを変える考え方がある。

v0.9ではFamily masteryとStageに基づいてSchedulerが決定する。

---

# **53\. TempoとDensityを分ける**

難易度をBPMだけで上げない。

別軸：

* BPM  
* note density  
* phrase length  
* syncopation  
* harmonic movement  
* cold reading novelty

を持つ。

特にDouble Timeは、

**BPMを上げることではなく、同じ時間内のdensityを上げること**

として扱う。

---

# **54\. Solfège表示**

現在の設定として残す。

ただし標準は徐々に非表示へ向かう。

Stage初期：

optional support。

Mastery判定：

原則ordinary notation only。

---

# **55\. Cold Reading Integrity**

Bebop Readerの重要な品質指標。

Cold Read Eventでは、

* 直前に同Variantを出さない  
* Phrase Morphを見せない  
* modelを鳴らさない  
* 同じform positionに固定しない  
* 同じrhythmだけに固定しない

ようにする。

「前の問題を記憶して歌えた」を読譜masteryと誤認しない。

---

# **56\. Game Feel**

v0.9で最重要の検証対象。

技術的に正しくても、

* 待ち時間が長い  
* 空白小節ばかり  
* 何をすればいいかわからない  
* scoreが突然変わる  
* modelがうるさい  
* feedbackが気になる  
* grooveが単調すぎる

なら失敗。

Vertical Sliceでは、

**5分間もう一度続けたいと思えるか**

を重要評価とする。

---

# **57\. 音楽的密度**

初期4-bar loopで毎小節課題を出し続けない。

音楽には、

**読む 歌う 聴く 休む**

の呼吸を持たせる。

ただし空白が長すぎない。

Schedulerはlearning densityだけでなく**musical density**も管理する。

---

# **58\. Phraseの出現演出**

「問題カードが出現する」より、

**次に歌う譜面が自然に準備される**

感覚を優先する。

例：

* 次phraseが薄くfade in  
* current phrase終了後に次scoreへcrossfade  
* BUILDならMorph  
* COLD READなら新scoreがcleanに出現

過剰なゲーム演出で五線譜を隠さない。

---

# **59\. Session Finish**

曲が突然切れない。

最後のLearning Event終了後、

1〜2小節程度のmusical endingを設けてもよい。

その後Session Summaryへ。

**音楽を完結させて終わる。**

---

# **60\. v0.9 Vertical Slice Scope**

最初からStage 14まで実装しない。

対象：

**Stage 0〜3**

のみ。

### **Curriculum**

* Staff Anchor  
* DO / SOL in Time  
* Tonic Shape  
* Make the Line

### **Keys**

Cのみ。

### **Musical Field**

4-bar Training Loop。

### **Phrase Families**

3〜5 families。

### **Presentation Mode**

最低限：

* BUILD  
* COLD\_READ  
* DELAYED\_READ  
* TEACHER\_CALL  
* ANSWER\_ECHO

### **Phrase Morph**

最低限：

* INSERT  
* EXTEND  
* CHANGE

---

# **61\. Vertical Slice必須機能**

1. iPhoneでSession開始  
2. audio / mic prime  
3. 4拍count-in  
4. groove開始  
5. 5分以上Transport継続  
6. score cue  
7. audiation window  
8. singing window  
9. Event scoring  
10. lightweight feedback  
11. Phrase Morph  
12. Teacher Call  
13. Answer Echo  
14. delayed Cold Read  
15. Session Summary

---

# **62\. Vertical Sliceで後回しにするもの**

* F / B♭  
* full Blues  
* Rhythm Changes  
* Relative Major  
* Relative Minor  
* double-time  
* complex harmony  
* server backend  
* accounts  
* cloud sync  
* social features  
* AI-generated curriculum  
* high-quality human scat samples

---

# **63\. Acceptance Criteria — Functional**

Vertical Sliceは少なくとも以下を満たす。

### **Audio**

Session中、Event間で音楽が止まらない。

### **Count-in**

Session開始時のみ。

### **Scoring**

各SING windowを個別評価できる。

### **Feedback**

Eventごとのresult screenへ遷移しない。

### **Curriculum**

同一Phrase Familyが形を変えて再出現する。

### **Morph**

SEED → GROWが視覚的に理解できる。

### **Cold Read**

Morphなし問題が存在する。

### **Failure**

ミス後もSessionが継続する。

### **iPhone**

Safari / PWA縦持ちで成立する。

---

# **64\. Acceptance Criteria — Musical**

技術要件だけでなく、次を満たす。

1. 4小節の場所を感じられる  
2. 歌うタイミングが直感的に分かる  
3. scoreを見る時間が十分ある  
4. beatから落ちても次の小節へ戻れる  
5. 同じPhrase Familyが育っている感覚がある  
6. Morphが読譜の補助になり、邪魔にならない  
7. COLD READでは本当に譜面を読む必要がある  
8. 失敗しても音楽が壊れない  
9. 5分後に「問題を解いた」より「音楽をやった」感覚が強い

---

# **65\. Acceptance Criteria — Existing Quality Preservation**

v0.9化によって現行v0.8で改善済みの品質を後退させない。

特に、

* 五線上の正しいpitch geometry  
* C4補助線  
* G4第二線  
* ordinary notation  
* score scale  
* horizontal follow  
* iPhone audio start  
* octave-folded movable-do scoring  
* ★中心の結果  
* detailed pitch visualization

を維持する。

---

# **66\. Tests**

最低限、自動テスト対象にする。

## **Curriculum**

* Family / Variant reference integrity  
* Stage compatibility  
* allowed key  
* allowed presentation  
* parentVariant existence

## **Scheduler**

* BUILD直後に同VariantをCold Readしない  
* due reviewを拾う  
* new family過多にならない  
* Session duration上限

## **Transport**

* Event window overlap  
* timing consistency  
* bar / beat calculation

## **Scoring**

* Event sliceが正しい時間を参照  
* latency adjustment  
* octave folding

## **Storage**

* v2→v3 migration  
* state restore

---

# **67\. Debug Mode**

Continuous Transportはデバッグが難しくなるため、開発用表示を用意する。

最低限：

Transport time  
Bar / Beat  
Current Event  
Next Event  
Presentation Mode  
Family / Variant  
Sing Window  
AudioContext state  
Mic state  
Latency

Productionでは非表示。

---

# **68\. Migration Strategy**

v0.9を一気に既存appへ混ぜない。

推奨：

## **Phase 1**

現行v0.8を壊さず、Curriculum data modelを追加。

## **Phase 2**

Transport / Session Engineを独立実装。

## **Phase 3**

Stage 0〜3用Phrase Families追加。

## **Phase 4**

Continuous Session専用routeを作る。

例：

`#/session`

## **Phase 5**

実機検証。

## **Phase 6**

成立後、HomeのSTARTを新Sessionへ接続。

## **Phase 7**

旧practice/result flowをlegacy化。

## **Phase 8**

不要になった旧教材・controllerを整理。

---

# **69\. 実装上の重要原則**

### **既存の動くものを無意味に書き直さない。**

Notation、pitch detection、scoring等は再利用する。

### **Session Controllerを巨大化しない。**

Transport、Curriculum、Audio、Scoringを分離する。

### **Audio clockを唯一の時間基準とする。**

CSS animation時間やsetTimeoutを教材タイミングのsource of truthにしない。

### **CurriculumをUIへhard-codeしない。**

### **Phrase FamilyとSession Eventを分離する。**

---

# **70\. Product SPEC v0.9の中心命題**

v0.8までのBebop Readerは、

**「譜面を見て、count-in後に一問ずつ歌う読譜アプリ」**

としてかなり成立した。

v0.9では、その資産を捨てず、

**一問単位の読譜を、音楽の連続時間の中へ埋め込む。**

これによって、

READ  
↓  
SING  
↓  
NEXT QUESTION

だった体験を、

MUSIC STARTS  
↓  
READ  
↓  
SING  
↓  
LISTEN  
↓  
READ AGAIN  
↓  
MORPH  
↓  
SING  
↓  
RE-ENCOUNTER  
↓  
CONNECT  
↓  
FLOW  
↓  
MUSIC ENDS

へ変える。

Bebop Reader v0.9を一文で定義すると、

**「ジャズが流れ続ける中で譜面を読み続け、同じ音楽構造が少しずつ育つのを歌って経験することで、読譜そのものをParkerのフレージング能力へ変えていく音楽ゲーム」**

である。

# **Bebop Reader — Curriculum Spec v1.0**

## **0\. 文書の位置づけ**

本書は、Bebop Readerにおける\*\*「何を・どの順序で・どのような経験として習得させるか」\*\*を定義する。

Product SPECとは責任を分ける。

### **Curriculum Specが定義するもの**

* Stage  
* Phrase Family  
* Variant  
* 学習上の変形  
* BUILD / READ等のpresentation mode  
* Session内での教材配置原則  
* Mastery  
* Stage unlock  
* Key unlock  
* Blues / Rhythm Changesへの接続

### **Product SPECが定義するもの**

* 画面構成  
* continuous audio transport  
* groove再生  
* microphone capture  
* notation rendering  
* Phrase Morph animation  
* feedback UI  
* storage  
* PWA / iPhone挙動  
* 実装アーキテクチャ

両者の接点となるデータ構造は本書で定義する。

---

# **1\. 最終学習目標**

Bebop Readerの最終目標は、

**普通の五線譜を見る → 内的に音を聴く → 音楽の時間の中で歌う → phraseを一音ずつではなく構造として読む → 同じ構造の変形を読める → Blues / Rhythm Changes上で再構成して使う**

こと。

最終状態は、

**Blues / Rhythm Changes上で、Parkerの生成文法に基づくlineを譜面から即座に読み、歌い、既知の構造を組み替えてフレージングできること。**

学習全体を貫く標語は、

**READ → SING → FLOW**

とする。

---

# **2\. 教材生成の内部モデル**

教材側では旋律を、

**HARMONY ↔ LINEAR LINE ↔ CELL ↔ SURFACE PHRASE**

として扱う。

重要なのは一方向ではないこと。

### **Harmony → Line**

和音骨格  
 → 音の間を埋める  
 → lineになる

### **Line → Harmony**

line  
 → 2音cellへ分節  
 → cellを和声化  
 → 新しいsurfaceへ展開

### **Line → Surface**

line / cell  
 → passing  
 → approach  
 → chromaticization  
 → rhythm変形  
 → density増加

学習者にこの分析作業を直接要求しない。

学習者の基本行為は最後まで、

**普通の五線譜を見て歌う**

である。

---

# **3\. カリキュラムの三層構造**

Bebop Readerではカリキュラムをexerciseの固定リストとして定義しない。

基本モデルは、

**Stage × Phrase Family × Session Scheduler**

とする。

## **3.1 Stage**

その時点で使用可能な、

* 音  
* rhythm  
* harmony  
* transformation  
* phrase length  
* musical field

を規定するunlock envelope。

Stageそのものは問題ではない。

---

## **3.2 Phrase Family**

同一の生成構造から生まれるphrase群。

例：

SEED  
G → E

GROW  
G → F → E

EXTEND  
G → F → E → D → C

CHANGE  
同じlineのrhythmを変更

MOVE  
同じ構造を別harmonyへ

DENSIFY  
内部に音を追加

FLOW  
bebop surface

一つのPhrase Familyを、数日〜数週間にわたって異なる形で再遭遇させる。

---

## **3.3 Session Scheduler**

Phrase Familyのどのvariantを、いつ、どのpresentation modeで出現させるかを決める。

したがってカリキュラムは、

**問題順ではなく、構造の再遭遇を時間設計したもの**

である。

---

# **4\. 音楽時間を止めない**

通常Sessionでは、

**一問ごとにcount-in → 歌唱 → result → 次**

とはしない。

Session開始時に一度だけcount-inし、その後はbeat / groove / formを原則として維持する。

初期の基本fieldは4小節。

Bar 1  groove / orientation  
Bar 2  SEE \+ AUDIATE  
Bar 3  SING  
Bar 4  response / space

次の4小節へそのまま進む。

教材はこの時間軸上へ**Learning Event**として配置される。

Stageが進むとfieldも成長する。

4-bar training loop  
↓  
8-bar phrase field  
↓  
12-bar Blues  
↓  
16-bar section  
↓  
32-bar Rhythm Changes

最終的には「問題を解く」のではなく、

**formから落ちずに読み、歌い続ける**

状態へ移行する。

---

# **5\. Learning Event**

Session中に発生する最小学習単位をLearning Eventとする。

exerciseとは区別する。

一つのEventは、

**Phrase Family × Variant × Harmonic Context × Rhythm × Form Position × Presentation Mode**

で定義される。

同じ譜面variantでも、異なる場所・伴奏・presentation modeで別Eventとして使用できる。

---

# **6\. Phrase Familyの基本成長**

`Phrase Familyごとに、「何が同じ構造として保持されるか」をstructural invariantとして明示する。`

`その記述には必要に応じて、structuralTargets / invariant / entryRole / exitRole / continuationRoleを用いる。`

`表示譜面のnotes[0] / notes[-1]を、そのまま構造上の始点・終点とはみなさない。`

原則として以下を持つ。

## **SEED**

最も単純な不変項。

例：

G → F

## **GROW**

音を加える。

G → E  
↓  
G F E

## **CHANGE**

一要素だけ変更。

* 一音  
* entry  
* ending  
* rhythm  
* Major / Minor  
* ♭5  
* articulation相当の時間配置

## **MOVE**

構造を維持して、

* 別chord  
* 別harmonic context  
* 別form position  
* 別key

へ移動する。

## **DENSIFY**

## **同じstructural target / LINEAR LINE / CELL identityなど、Phrase Familyで定めたstructural invariantを保ちながらsurface densityを増やす。**

## **surfaceの開始音・終了音は固定を必須としない。前打音・複前打音は最初のstructural targetより前へ、turnやconnectorはtargetの後ろへ拡張してよい。またcellの出口を次のcellの入口として再解釈し、phraseを延長してよい。**

## **始点・終点が一致するDENSIFYは一つのsubcaseとして用いてよいが、DENSIFY一般の必須条件とはしない。**

## **FLOW**

Parker実譜に近いsurfaceへ到達する。

---

# **7\. Phrase Morph**

BUILD時には、普通の譜面Aから普通の譜面Bへ移る途中で一時的にMorphを表示できる。

基本operator：

* INSERT  
* REMOVE  
* CHANGE  
* EXTEND  
* DENSIFY  
* MOVE  
* RHYTHM CHANGE

例：

G —— E

   F が出現

G F E

Morphは分析譜ではない。

数秒後には再び普通の五線譜だけになる。

---

# **8\. Presentation Mode**

## **BUILD**

既知variantから新variantへの変形を見せる。

目的：

**構造知覚**

Mastery判定には弱くしか使用しない。

---

## **COLD READ**

Morphなし。

事前モデル音なし。

目的：

**本当の初見読譜**

Masteryの中心。

---

## **DELAYED READ**

BUILD後、数Event空けて再提示。

短期記憶ではなくchunk化を確認する。

---

## **TEACHER CALL**

新規material導入時のみ使用。

前のmusical slotでモデルが歌い、次のslotでユーザーが応答する。

---

## **ANSWER ECHO**

失敗後、音楽を止めず次の空きslotでモデルが正解を返す。

その後、数Event以内に再出題する。

---

## **SHADOW**

モデルと同時に歌う。

導入・救済用。

Mastery評価には使用しない。

---

## **FLOW**

既知材料を、

* repeat  
* connect  
* mutate  
* trade  
* recall

する。

後期では譜面を部分的または完全に消す。

---

# **9\. お手本の原則**

お手本は「毎問の正解音声」ではない。

Cold Readingを守るため、新規material以外では先に鳴らさない。

優先順位：

1. 自分でaudiate  
2. 自分で歌う  
3. 必要時のみAnswer Echo  
4. 再遭遇

とする。

---

# **10\. Event中のfeedback**

演奏中に各音を赤・緑表示しない。

Event終了後に、

✓  
△

程度の軽いfeedbackだけを許容する。

詳細な採点結果はSession終了後にまとめる。

失敗してもtransportを停止しない。

---

# **11\. Mastery**

Masteryは単独exerciseの記憶度ではなく、

**同じ構造をscaffoldなしで扱える範囲**

とする。

Phrase Familyごとに少なくとも以下を持つ。

seedRead  
growRead  
coldRead  
delayedRead  
rhythmTransfer  
harmonicTransfer  
formTransfer  
keyTransfer  
surfaceRead  
flow

Mastery判定では、

**COLD READ \> BUILD**

とする。

---

# **12\. Event-level scoring**

当面は現在の読譜採点思想を維持する。

評価対象：

* target scale degreeを読めたか  
* 大きく拍を外していないか  
* phraseを止めていないか

細かなintonationを主目的にしない。

各SING windowについて内部scoreを計算する。

ただしユーザーにEventごとの詳細数字を連続表示しない。

Session終了時に総括する。

---

# **13\. Stage構造**

## **Stage 0 — Staff Anchor**

### **Unlock**

* G4 \= ソ  
* C4 \= ド

### **目的**

五線を下から数えない。

G線とMiddle Cをlandmarkとして瞬時に読む。

### **Rhythm**

* quarter  
* simple rest

### **Field**

4-bar loop

### **Gate**

C / Gをcold readで安定して歌える。

---

## **Stage 1 — DO / SOL in Time**

### **Material**

ド・ソのみ。

### **新規能力**

* tonic / fifth感  
* eighth pair  
* rest  
* pickup  
* offbeat entry

### **重要原則**

「二音しかない簡単な問題」ではなく、

**二音でもphraseになる**

経験を作る。

---

## **Stage 2 — Tonic Shape**

### **Unlock**

ミ。

### **Material**

C–E–G。

### **目的**

ド・ミ・ソを3音ではなく、

**Tonic Shape**

として読む。

転回・順列も使用する。

---

## **Stage 3 — Make the Line**

### **中心変化**

Tonic Shapeからlineを作る。

代表Family：

G → E  
G F E

E → C  
E D C

D → C  
D C B C

G → C  
G F E D C

ファ・レ・シは「新しい音」としてではなく、

**既知の構造音へ向かう音**

としてunlockされる。

---

## **Stage 4 — Second Harmonic Family**

### **Unlock**

ラ。

### **Harmonic Family**

* C  
* C6  
* Am7  
* Dm7

別々の単語ではなく共有shapeとして扱う。

---

## **Stage 5 — Dominant / ii–V–I**

### **Material**

* G7  
* Dm7 → G7 → C  
* guide-tone motion

### **中心能力**

barlineを越えてlineを読む。

### **Field**

4〜8 bars。

---

## **Stage 6 — Two Generators**

二つの生成方向を経験する。

### **Generator A**

Harmony → Line

### **Generator B**

Line → Cell → Harmony

理論問題として解かせず、Phrase Family間の変形として経験させる。

---

## **Stage 7 — CELL Grammar**

2音cellを不変項として、多数のsurfaceへ展開。

例：

G F  
G E F  
G A G F  
G B A G F  
G A Bb A G F

目標は、

**「全部違うphrase」ではなく「GからFへ行く動き」**

として読むこと。

---

## **Stage 8 — Ornament as Direction**

導入：

* passing  
* neighbor  
* appoggiatura  
* turn  
* chromatic approach

名称暗記より、

**どこへ向かう音か**

を優先する。

---

## **Stage 9 — Chord Change / Long Line**

複数の和声を跨ぎながら一つのLINEAR LINEを維持する。

Field：

* 2 bars  
* 4 bars  
* 8 bars

へ拡張。

---

## **Stage 10 — Relative Major**

既知shapeをDominant内部の別機能として再利用。

新scaleの暗記として導入しない。

その後、

**一音CHANGE**

として♭5等へ進む。

---

## **Stage 11 — Relative Minor**

既知Major shapeをMinorへ変形。

重要なのは、

**HarmonyがMajor→Minorへ変わってもlineを切らない**

こと。

---

## **Stage 12 — Tonic Minor / Tonal Field**

Melodic Minor / Harmonic Minorをscale暗記から始めない。

Harmony / lineの結果として現れるものとして扱う。

複数小節を一つのtonal fieldとして読む。

---

## **Stage 13 — Density / Double Time**

新しい語彙を導入するStageではない。

既知cellについて、

2 notes  
→ arpeggio  
→ scalarization  
→ chromaticization  
→ rhythmic compression

とdensityを増やす。

濱瀬由来のStage 13教材では、ex.267型のcell内部のdensity expansionと、ex.268型のcell出口を次の入口へ再解釈して同じcellを再起動するphrase extensionを、別の生成操作として保持する。  
4拍など固定phrase window内でのdensity増加は初期scaffoldとして使用できるが、Stage 13全体の必須条件とはしない。  
---

## **Stage 14 — Blues / Rhythm Changes**

これまでの文法をform上へ統合する。

### **Blues**

最初はC Blues。

baseline  
→ line  
→ cell  
→ expansion  
→ Relative Major / Minor  
→ chromaticization  
→ double-time

### **Rhythm Changes**

32 bars。

BridgeのDominant列をtransform operatorの実戦場として使用する。

最終進行：

READ  
→ Repeat  
→ Mutation  
→ Connect  
→ Trade  
→ 4 bars  
→ 1 Chorus  
→ Free Flow  
---

# **14\. Key Unlock**

Stageとは別軸にする。

基本：

C  
→ F  
→ B♭

Fへ進んでも新しい生成文法は教えない。

Cで習得済みのPhrase Familyをそのまま移動する。

これにより、

**音楽構造は同じ / 五線上の場所は違う**

を身体化する。

---

# **15\. Session Scheduler v1**

Session時間の初期目標は約7分。

Event数は固定9問ではなく、phrase長によって変動する。

Sessionには次を混ぜる。

### **Warm-up**

既習familyの容易なCOLD READ。

### **New BUILD**

原則1〜2 familyまで。

### **Same-family Growth**

新familyをGROW / CHANGEさせる。

### **Delayed READ**

BUILDから間隔を空けて再提示。

### **Review**

過去family。

### **Transfer**

rhythm / harmony / form position変更。

### **Closing FLOW**

その日の主要materialを音楽的にまとまった形で終える。

同じfamilyを連続させすぎない。

---

# **16\. Schedulerの優先順位**

候補Eventを以下の順で選ぶ。

1. retention期限を迎えたCOLD READ  
2. Stage gateに必要な弱点  
3. 当日の新規Phrase Family  
4. 同familyのGROW / CHANGE  
5. 過去familyのrhythm transfer  
6. harmonic / form transfer  
7. key transfer  
8. FLOW

BUILDだけを連続させない。

---

# **17\. 失敗時の処理**

失敗してもSessionを中断しない。

基本：

失敗  
↓  
軽いfeedback  
↓  
Answer Echo  
↓  
別Event  
↓  
数Event後に再出題

同じ問題をその場で何度もretryすることを基本にしない。

---

# **18\. Stage Unlock**

Stageクリアを、

「Stage内の全exercise mastery 2以上」

のような固定問題消化では判定しない。

最低条件は、

* 必須Phrase FamilyのCOLD READ  
* 複数sessionで再現  
* 主要rhythm transfer  
* Stageに応じたharmonic / form transfer

とする。

後期Stageでは、

* key transfer  
* FLOW

も加える。

---

# **19\. Phrase Familyデータ契約**

最低限以下を持つ。

{  
  "familyId": "tonic-descend-01",  
  "stage": 3,  
  "structure": "tonic-shape-to-linear-line",  
  "invariant": "descending 5→1 line",  
  "structuralTargets": \["5", "4", "3", "2", "1"\],  
  "line": \["5", "4", "3", "2", "1"\],  
  "cells": \[  
    \["5", "4"\],  
    \["4", "3"\]  
  \],  
  "harmony": \["C"\],  
  "source": {  
    "type": "hamase",  
    "reference": "ex.162"  
  },  
  "variants": \[\]  
}  
---

# **20\. Variantデータ契約**

{  
  "variantId": "tonic-descend-01-grow-02",  
  "familyId": "tonic-descend-01",  
  "phase": "GROW",  
  "parentVariant": "tonic-descend-01-seed",  
  "notes": \["G4", "F4", "E4"\],  
  "structuralTargetIndices": \[0, 1, 2\],  
  "entryRole": "structural-target",  
  "exitRole": "structural-target",  
  "continuationRole": null,  
  "rhythm": \[0.5, 0.5, 1\],  
  "morphType": "INSERT",  
  "coldReadEligible": true,  
  "allowedPresentation": \[  
    "BUILD",  
    "COLD\_READ",  
    "DELAYED\_READ"  
  \]  
}  
entryRole / exitRole / continuationRoleとstructuralTargetIndicesは、surface boundaryと構造上のtargetを分離して扱うためのmetadataである。前打音・複前打音・turn・connector等を含むvariantでは、notes\[0\] / notes\[-1\]を構造上の始点・終点とはみなさない。  
---

# **21\. Learning Eventデータ契約**

{  
  "eventId": "session-2026xxxx-004",  
  "familyId": "tonic-descend-01",  
  "variantId": "tonic-descend-01-grow-02",  
  "key": "C",  
  "harmony": \["C"\],  
  "form": "training-4",  
  "formPosition": 3,  
  "presentationMode": "COLD\_READ",  
  "modelPolicy": "NONE",  
  "score": true  
}

譜面そのものと、Session内での出現方法を分離する。

---

# **22\. Parker素材のtraceability**

Parker由来のPhrase Familyには必ずsourceを保持する。

最低限：

source work  
recording  
Hamase example  
book page  
analysis file

完成phraseから、

* line  
* cell  
* harmony  
* simplified variants

へ戻れること。

教材化によって原典との関係を失わない。

---

# **23\. Stage 0–3 Vertical Slice**

全Stageを実装する前に、以下を完成させる。

## **対象**

Stage 0〜3。

## **Phrase Family**

まず3〜5 families。

例：

* DO ↔ SOL  
* Tonic triad  
* G → E / G–F–E  
* E → C / E–D–C  
* turn to DO

## **Game Field**

4-bar loop。

## **必須Presentation**

* BUILD  
* Phrase Morph  
* COLD READ  
* DELAYED READ  
* Teacher Call  
* Answer Echo

## **必須UX**

* Session開始時だけcount-in  
* groove停止なし  
* 問題間result screenなし  
* event終了時の軽いfeedback  
* Session終了時の総合結果

---

# **24\. Vertical Slice成功条件**

Stage 0–3版について、

1. 5〜7分間、beatが止まらない  
2. 問題を解いているより音楽に参加している感覚がある  
3. BUILDで構造の変化が理解できる  
4. 数Event後のCOLD READで本当に譜面を読む必要がある  
5. お手本を聞かなくても進める  
6. 失敗しても音楽体験が壊れない  
7. iPhoneで譜面が十分読める  
8. 現行の粗い読譜採点で最低限の自動判定が成立する  
9. Session終了後に「同じ素材が育った」感覚が残る

こと。

このVertical Sliceが成立してからStage 4以降の教材を大量実装する。

---

# **25\. Curriculum Spec v1の中心命題**

Bebop Readerのカリキュラムは、

**簡単な問題から難しい問題へ進むリストではない。**

単純な音楽構造を、

**読む → 歌う → 再遭遇する → 少し変える → 別の場所へ移す → 密度を上げる → formの中で使う**

ことで、同じ構造を徐々に大きな音楽へ育てるシステムである。

ユーザーが最初に読む「ド・ソ」と、最後に歌うParker的double-timeは別科目ではない。

**同じREAD → SING → FLOWの連続上に存在する。**

# **Bebop Reader 教材の方針 rev.3**

## **音楽の流れの中で、読譜からParkerの生成文法へ**

## **0\. この教材の目的**

Bebop Readerは、五線上の音名を当てるアプリでも、歌唱採点アプリでもない。

目標は、

**譜面を見る → 内的に音を聴く → 音楽の流れを止めずオンタイムで歌う → 音符ではなく音楽的なまとまりとして読む → 同じ構造が変形・展開されても読める → Blues / Rhythm Changes上で組み替えて使う**

までを、一続きの能力として育てることである。

最終状態は、

**Blues / Rhythm Changes上で、ビバップの語彙を譜面から即座に読み、歌い、Parkerの生成文法を使ってその場でlineを組み替えられること。**

身につけるものは「Parkerのlick集」ではない。

**譜面から構造を知覚し、同じ構造が違うsurfaceを取っても読め、その構造を時間の中で使える能力**

である。

キャッチコピーは引き続き、

**READ → SING → FLOW**

とする。

---

# **1\. 教材設計の中心原理**

教材の中心を、

**「新しい音を一つずつ覚える」**

ことから、

**「単純な音楽構造が、少しずつ変形・展開される経験を積む」**

ことへ移す。

濱瀬分析・譜面分析から教材側が持つ生成モデルは、

**HARMONY ↔ LINEAR LINE ↔ CELL ↔ SURFACE PHRASE**

である。

和声骨格からlineが生成される場合がある。

lineがcellへ分節され、そこから和声が発生する場合もある。

同じlineの上にpassing tone、approach、chromaticism、rhythmic variation等が加わり、複雑なsurface phraseになる場合もある。

しかし、**この分析そのものを学習者に要求しない。**

学習者が行う中心行為は最後まで、

**普通の五線譜を見る → 歌う**

である。

濱瀬理論は、学習者が解く「理論問題」ではなく、**教材を生成・配列する側の文法**として使う。

---

# **2\. Experience → Recognition → Naming**

LINEAR LINE、CELL、Relative Major、Relative Minor、passing tone、appoggiatura、chord change等を、最初から定義として覚えさせない。

先に、

**見る → 歌う → 似た形を歌う → 少し変わった形を歌う → 違う場所で同じ動きを歌う → 複雑になった同じ構造を歌う**

という経験を大量に積む。

その結果、

「この動き、前にもあった」

が先に生まれる。

理論名称は後から、

**「何度も歌ってきたあの動きには、こういう名前がある」**

という形で付与する。

教材の基本順序を、

**Experience → Recognition → Naming**

とする。

---

# **3\. 最大のUX変更：問題のたびに音楽を止めない**

従来の、

**譜面提示 → count-in → 歌唱 → 結果 → 次の問題 → 再びcount-in**

だけを中心にすると、正しい読譜練習ではあっても、音楽が毎問分断される。

Bebop Reader rev.3では、**音楽そのものをゲームフィールドにする。**

セッション開始時にgrooveが始まり、その後は基本的にpulseを止めない。

初期には4小節程度の短いループを使う。

例：

**Bar 1：groove / preparation Bar 2：譜面を読む Bar 3：ユーザーが歌う Bar 4：response / space**

そして次の4小節へ進む。

問題は「独立したカード」として現れるのではなく、

**流れている音楽の中に出現するevent**

として扱う。

ユーザーは、

「問題を9問解いた」

だけでなく、

**「数分間、音楽から落ちずに譜面を読み続けた」**

という経験を得る。

---

# **4\. Duolingo型進行と音楽ゲーム型プレイを分離する**

Duolingo的構造は捨てない。

ただし役割を変える。

## **マクロ構造**

Stage、unlock、mastery、daily session、弱点復習、spaced repetition等はDuolingo型で管理する。

つまり、

**今日はどの能力を育てるか**

はカリキュラムエンジンが決める。

## **ミクロ体験**

実際にプレイしている間は、

**groove / loop / formが流れ続け、その中へ教材eventが配置される。**

したがって、

**学習管理はDuolingo的 演奏体験は音楽ゲーム的**

という二層構造にする。

---

# **5\. カリキュラムは三層で設計する**

カリキュラムを単純なexercise一覧にしない。

内部的には、

**Stage × Phrase Family × Session Scheduler**

の三層で構成する。

## **A. Stage**

その時点で何がunlockされ、何を読める必要があるかを定義する。

例：

* Staff Anchor  
* Tonic Shape  
* Line  
* ii–V–I  
* Cell  
* Relative Major / Minor  
* Double Time  
* Blues

Stageは**能力の進行表**であり、問題そのものではない。

## **B. Phrase Family**

同じ生成構造から生まれる複数の譜面を一つのfamilyとして持つ。

## **C. Session Scheduler**

今日はそのfamilyのどのvariantを、

* BUILD  
* cold READ  
* delayed READ  
* rhythmic variation  
* harmonic MOVE  
* key MOVE  
* FLOW

としていつ出すかを決める。

したがって、

**カリキュラム ≠ 問題の順番**

である。

**カリキュラム \= 習得すべき構造 × その構造の変形系列 × 再遭遇の時間設計**

である。

---

# **6\. 教材の基本単位：Phrase Family**

単独exerciseではなく、**Phrase Family**を教材の主要単位にする。

一つのfamilyは、同じ音楽的骨格を共有する。

例えば、

### **SEED**

ソ ― ミ

### **GROW**

ソ–ファ–ミ

### **EXTEND**

ソ–ファ–ミ–レ–ド

### **CHANGE**

同じpitch関係でリズムだけ変わる。

### **MOVE**

同じ構造が別の和声文脈へ移る。

### **DENSIFY**

同じstructural target / LINEAR LINE / CELL identity等、Familyごとに定義されたstructural invariantを保ちながらsurface densityを増やす。structural targetはsurface phraseの最初・最後の音と同一とは限らない。前打音・複前打音は最初のtargetより前へ、turnやconnectorはtargetの後ろへ拡張でき、cellの出口を次のcellの入口として再解釈してphraseを延長することもできる。

### **FLOW**

passing、approach、chromaticization、syncopation等が加わり、Parker的surfaceへ到達する。

学習者に「Phrase Familyを勉強しています」と説明する必要はない。

何日かにわたり形を変えて再登場することで、

**一音ずつ読む対象から、一つの動きとして読むchunk**

へ変えていく。

---

# **7\. SEED → GROW → CHANGE → MOVE → FLOW**

一つの素材は基本的に次の方向へ育てる。

## **① SEED**

最も単純な骨格を読む。

例：

ソ → ミ

ソ → ファ

## **② GROW**

骨格を維持したまま音を追加する。

ソ → ミ  
 から、

ソ–ファ–ミ

へ。

## **③ CHANGE**

一つだけ変える。

* 一音  
* entry  
* ending  
* rhythm  
* Major / Minor  
* ♭5

など。

## **④ MOVE**

同じ構造を、

* 別chord  
* 別harmonic context  
* 別form position  
* 後には別key

で読む。

## **⑤ FLOW**

同じ構造が高密度化・装飾化され、実際のbebop phraseへ近づく。

最終形を最初から暗記するのではない。

学習者には、

**「難しいフレーズが突然出てきた」**

ではなく、

**「前から歌っていた動きがここまで育った」**

と感じられる配列にする。

---

# **8\. Phrase Morph**

SEEDからGROW、GROWからCHANGEなどへ移る際、一時的に譜面そのものが変形する様子を見せる。

例：

ソ ― ミ

を五線上に残したまま、

**ファ**

が間へ現れ、

ソ–ファ–ミ

になる。

あるいはFull Phraseから表面音が消え、LINEAR LINEや骨格だけが残る。

ただしPhrase Morphは**教材専用記譜そのものにはしない。**

基本表示は常に普通の五線譜。

Morphは、

**普通の譜面A → 数秒のtransition → 普通の譜面B**

として使う。

目的は説明ではなく、

**「何が同じで、何が変わったか」を視覚的に感じさせること**

である。

---

# **9\. MorphはBUILD、Masteryはcold READ**

Phrase Morphには明確な弱点がある。

前問との差分を覚えれば、譜面を本当に読まなくても歌えてしまう。

したがって問題を大きく二種類に分ける。

## **BUILD**

前の形を知っている状態でMorphを見せる。

目的：

**構造知覚・chunk形成**

## **READ**

Morphなし。

モデル音なし。

新しい譜面を突然提示する。

目的：

**本当のSight Reading**

基本的な定着順は、

**BUILD → 数問空ける → cold READ → 翌日cold READ → 別rhythm → 出現位置変更 → 別harmonic context → 後には別key**

とする。

Mastery判定では、**BUILD成功よりREAD成功を強く評価する。**

---

# **10\. LINEAR LINEを最重要の不変項にする**

譜面分析から特に重要なのは、

**surfaceが複雑になってもLINEAR LINEは残り得る**

ということである。

したがって教材では、

**音が増えても、向かっているlineは同じ**

という経験を大量に作る。

例えば、

ソ → ファ

が、

ソ–ファ

ソ–ラ–ソ–ファ

ソ–シ–ラ–ソ–ファ

ソ–ラ–シ♭–ラ–ソ–ファ

と変化しても、

ユーザーがすべてを別phraseとして処理するのではなく、

**「ソからファへ行くあの動き」**

として読める状態を目指す。

Double Timeも同様。

新しい高速lickではなく、

**既知lineの内部densityが上がった状態**

として扱う。

**ただし、「LINEAR LINEを不変項にする」ことは、surface phraseの開始音・終了音を固定することを意味しない。Familyごとに、何が保持される構造なのか（LINEAR LINE、CELL identity、target sequence、和声機能、voice-leading等）を明示する。前打音・複前打音によって最初のstructural targetより前からphraseが始まる場合、turnやconnectorによってtargetの後ろへ続く場合、cellの出口を次の入口へ再解釈してphraseを延長する場合を許容する。**

---

# **11\. LINE / CELL / HARMONYは「問題間」で往復させる**

ユーザーに、

「このCELLを選べ」

「LINEAR LINEを指摘せよ」

「このコードを分析せよ」

とは原則として求めない。

内部では、

**Surface Phrase ↓ LINE ↓ CELL ↓ HARMONY ↓ New LINE ↓ New Surface**

という関係を持つ。

しかしユーザーが経験するのは、

**譜面Aを歌う → 少し違う譜面Bを歌う → 別文脈の譜面Cを歌う**

だけでよい。

理論理解を操作課題に変えるのではなく、

**教材の系列そのものに理論構造を埋め込む。**

---

# **12\. Scaleを先に覚えさせない**

音階暗記から始めない。

まず、

**chordal / tonal skeleton**

がある。

その隙間へ音が入る。

結果として、

**scalar line**

が生まれる。

例えば、

ド–ミ–ソ

から、

ド–レ–ミ–ファ–ソ

へ育つ。

学習者は先に、

「C Major Scaleを覚えた」

のではなく、

**「ドミソの隙間を埋めたら、このlineになった」**

と経験する。

その後で必要に応じてscale名を付ける。

---

# **13\. 音の導入も生成文法に従う**

入口は、

**ド・ソ**

でよい。

まず、

G4＝ソ

をト音記号の第二線から直接定位し、

C4＝ド

を第二anchorにする。

次に、

**ド・ミ・ソ**

を一つのTonic Shapeとして読む。

その後の音は、音名リストとして、

レ → ファ → ラ → シ

と追加しない。

例えば、

ソ–ミ  
 → ソ–ファ–ミ

としてファを導入する。

ミ–ド  
 → ミ–レ–ド

としてレを導入する。

レ–ド  
 → レ–ド–シ–ド

としてシを導入する。

ラも、

C6 / Am / Dm7 family

という音楽的意味を伴って導入する。

つまり、

**新しい音は、既知構造を変形する必要が生じたときunlockされる。**

---

# **14\. Rhythmは最初から存在する**

ド・ソしか読めない時期でも、

* quarter  
* eighth pair  
* rest  
* pickup  
* offbeat entry

を扱う。

音高負荷が小さい時期こそ、拍内定位を学びやすい。

その後、

* swing eighth  
* anticipation  
* syncopation  
* triplet  
* 16th  
* bebop eighth  
* double-time

へ進む。

リズム自体もPhrase Familyのtransform対象にする。

同じpitch lineが、

quarter  
 → eighth  
 → syncopated  
 → double-time

と変わる。

**Rhythmは別科目ではなく、同じ構造の別surfaceである。**

---

# **15\. Harmonyは新しい単語を増やすのではなく、既知shapeの意味を増やす**

新しいコードが出るたびに新しいphraseを覚えさせない。

同じshapeを別の伴奏で歌わせる。

例えば、既にTonicとして身体化したshapeが、後にDominantのupper structureとして現れる。

そこで、

**「譜面上は同じなのに、背景が変わると意味・響きが違う」**

ことを経験する。

Relative Major / Relative Minorも、

「新しい難しいコード」

ではなく、

**既知shapeの再解釈・一音変形**

として導入する。

---

# **16\. Stageは能力unlock軸として残す**

revで整理したStage体系は維持する。

ただし、一つのStageを「問題集1章」のようには扱わない。

Stageは、

**Session Schedulerが使用してよい音楽的材料・transform・formを規定するunlock graph**

である。

大枠は以下とする。

### **Stage 0 — Staff Anchor**

G4＝ソ、C4＝ド。五線を数えず定位する。

### **Stage 1 — DO / SOL in Time**

ド・ソだけでpulse、eighth、rest、pickupを経験する。

### **Stage 2 — Tonic Shape**

ドミソを単音3つではなく、一つのshapeとして読む。

### **Stage 3 — Make the Line**

Tonic Shapeへ音が加わり、lineへ育つ。

### **Stage 4 — Second Harmonic Family**

C / C6 / Am7 / Dm7を共有shape familyとして経験する。

### **Stage 5 — Dominant / ii–V–I**

voice-leadingを中心に、barlineを跨いだphraseへ進む。

### **Stage 6 — Two Generators**

Harmony → LineとLine → Harmonyの双方を教材系列として経験する。

### **Stage 7 — CELL Grammar**

同じcellが異なるsurfaceを取る経験を蓄積する。

### **Stage 8 — Ornament as Direction**

passing、neighbor、approach等を「向かう先」を保った変形として経験する。

### **Stage 9 — Chord Change / Long Line**

和声が変わってもlineを切らず、2〜4小節へ伸ばす。

### **Stage 10 — Relative Major**

既知shapeをDominant内部の別機能として再解釈する。

### **Stage 11 — Relative Minor**

既知shapeをMajor→Minorへ変形し、lineを維持する。

### **Stage 12 — Tonic Minor / Tonal Field**

数小節を一つのtonal fieldとして扱う。

### **Stage 13 — Density / Double Time**

既知構造のdensityを上げる。

濱瀬由来教材では、ex.267型のcell内部のdensity expansionと、ex.268型のcell出口を次の入口へ再解釈して同じ生成単位を再起動するphrase extensionを区別して保持する。4拍・同一のsurface開始音/終了音への固定は、必要なら初期scaffoldとして用いてよいが、Stage全体の条件にはしない。

### **Stage 14 — Blues / Rhythm Changes**

これまでの生成文法を実際のform上で使う。

---

# **17\. Key unlockはStageと別軸にする**

新しいkeyで新しい文法を教えない。

まずCで文法を身体化する。

その後、

**C → F → B♭**

とunlockする。

Fでは、Cで知っている、

* ドソ  
* ドミソ  
* line  
* ii–V–I  
* CELL  
* Relative Major / Minor

と同じ移動ド構造を読む。

変わるのは五線上の位置だけ。

これによって、

**音楽構造は同じ / notation上の場所は違う**

を直接経験する。

---

# **18\. 音楽フィールド自体も成長する**

exercise spanは単に、

1小節 → 2小節 → 4小節

と長くするだけではない。

**演奏している世界そのものを広げる。**

初期：

### **4-bar Training Loop**

短いgrooveの中で、READ / SINGに集中する。

次：

### **8-bar Phrase Field**

phraseのentry、ending、barline越えを経験する。

次：

### **12-bar Blues**

I / IV / Vというharmonic contextの中で同じfamilyをMOVEする。

最終：

### **Rhythm Changes**

32小節formの中で、特にbridgeのDominant列をRelative Major / Minorやtransform operatorの実戦場にする。

したがって最終的には、

**問題をクリアする**

から、

**formを流れ続けながら読み、歌い、反応する**

へ移行する。

---

# **19\. お手本は「答えを先に聞かせる機能」ではなく、音楽的interactionにする**

毎問お手本を先に再生するとSight Readingではなく耳コピーになる。

したがって、お手本を用途別に分ける。

## **Teacher Call**

新しいPhrase Family / Variantを初めて導入するとき。

モデルが一度歌い、次の同じmusical slotでユーザーが応答する。

**Call → Response**

として使う。

## **Morph Demo**

譜面がSEEDからGROW等へ変形するとき、必要な場合だけ新しい形を一度鳴らす。

## **Answer Echo**

ユーザーが失敗した場合、音楽を止めず、次の空きslotでモデルが正しい形を返す。

その後、数chorus以内に再度出題する。

## **Shadow Mode**

モデルと同時に歌う。

ウォームアップ、難所救済、初期導入用。

Mastery判定には使用しない。

## **Cold READ**

お手本なし。

これを進級判定の中心にする。

---

# **20\. 採点によって音楽を壊さない**

演奏中に一音ずつ赤・緑を表示しない。

主眼は、

**譜面を読んで音楽の時間から落ちなかったか**

である。

一つのevent終了後は、

✓  
 △

程度の軽いfeedbackに留めてもよい。

詳細結果はsession終了後に示す。

ミスしても、

**停止 → 不正解画面 → リスタート**

にしない。

音楽は続く。

必要ならAnswer Echoが入り、後で同じmaterialが再登場する。

Bebop Readerでは、

**失敗も音楽の流れの中で回収する。**

---

# **21\. Masteryは「覚えたか」ではなく、scaffoldが消えても読めるか**

Phrase Familyごとに内部masteryを持つ。

例：

* SEEDをcold readできる  
* GROWをcold readできる  
* Morphなしで読める  
* rhythm mutationを読める  
* form上の出現位置が変わっても読める  
* harmonic MOVE後も読める  
* 別keyでも読める  
* Full Surfaceを読める

重要なのは、

**Morphあり・モデルあり・同じ出現位置**

で成功したことをmasteryとしないこと。

Masteryでは、

**Morphなし Modelなし 順序変更 出現位置変更 別rhythm 後には別key**

を用いる。

---

# **22\. Daily SessionはPhrase Familyを時間的に編成する**

従来の、

* 苦手復習  
* 現Stageの新規  
* 現Stageの弱点  
* 過去Stage復習

という考え方は維持する。

そこへ、

**Phrase Family continuity**

を追加する。

ただしrev.3では、9問を単純に並べるのではなく、continuous musical session内にeventとして配置する。

例：

* Family A：SEED  
* 過去family：cold READ  
* Family A：GROW  
* rhythm復習  
* 新規READ  
* Family A：CHANGE  
* 弱点  
* Family A：MOVE  
* 過去family：cold READ

同じfamilyを連続させすぎない。

少し忘れた頃に、別のsurfaceとして再遭遇させる。

---

# **23\. Parker実譜はPhrase Familyの頂点として使う**

Parkerの完成phraseを、そのまま初心者に渡さない。

内部的には、

**Parent Harmonic Structure ↕ LINEAR LINE ↔ CELL ↕ Chordal Skeleton ↕ Ornamented Surface ↕ Actual Parker Phrase**

というrelationを保持する。

そこから、

SEED  
 → GROW  
 → CHANGE  
 → MOVE  
 → FLOW

を生成する。

最終的にActual Phraseへ到達する。

そして時には逆に、

Actual Phrase  
 → REMOVE  
 → skeleton / line

へ戻る。

目的は、

**複雑なものを積み上げることだけでなく、複雑なphraseの中に既知の単純構造を発見できること**

である。

---

# **24\. FLOWは最後だけに存在しない**

FLOWをStage 14で突然解禁しない。

最初期から薄く存在させる。

Stage 1でも、

同じド・ソを違うrhythmで歌う。

Stage 3では、

同じlineの入口や終わりを少し変える。

中盤では、

同じfamilyを別harmonyへMOVEする。

後半では、

cellを交換する。

最終的には、

**READ → Repeat → Mutation → Connect → Trade → 4 bars → 12-bar / 32-bar form → Free Flow**

へ進む。

つまり、即興は別科目ではなく、

**読譜で形成したchunkを、scaffoldを少しずつ外して使う過程**

である。

---

# **25\. ゲームの報酬は「音楽的世界の解放」**

XPだけを主報酬にしない。

ユーザーにとって意味のあるunlockは、

* New Note  
* New Phrase Family  
* Swing  
* ii–V–I  
* Chromatic Approach  
* F Major  
* C Blues  
* Relative Major  
* Relative Minor  
* Double Time  
* B♭ Blues  
* Rhythm Changes

などである。

「Level 12になった」以上に、

**昨日できなかった音楽が今日できる**

ことを報酬にする。

---

# **26\. 教材内部データは生成関係を持つ**

各exercise / variantには、表示譜面以外に少なくとも、

* familyId  
* variantId  
* parentVariant  
* stage  
* structure  
* invariant  
* structuralTargets  
* line  
* cells  
* harmony  
* surface  
* structuralTargetIndices  
* entryRole  
* exitRole  
* continuationRole  
* rhythm  
* morphType  
* morphTargets  
* source  
* hamaseRef  
* coldReadEligible  
* key  
* form  
* formPosition  
* presentationMode

等を持てる構造にする。

この情報はユーザーに分析をさせるためではない。

**同じ音楽構造を正しく還元・展開・変形・再配置するための教材エンジン用データ**

**である。**

**表示譜面のnotes\[0\] / notes\[-1\]から構造上の始点・終点を推定しない。surface boundaryとstructural targetは別に保持する。**

---

# **27\. UIで見せるもの / 見せないもの**

## **積極的に見せる**

* 普通の五線譜  
* 流れ続けるbeat / groove  
* Phrase Morph時の増えた音・消えた音  
* 一音の移動  
* shapeの移動  
* rhythm densityの変化  
* 必要最小限の短い言葉

例えば、

「間を埋める」

「1音変わる」

「同じ形」

「少し細かく」

程度。

## **原則として前面へ出さない**

* CELL分析  
* LINEAR LINE分析図  
* chord-scale対応表  
* substitution暗記  
* passing / appoggiatura分類テスト  
* Relative Major / Minorの定義試験

理論は裏側で教材を生成する。

ユーザーの表側にあるのは、

**譜面と音楽と声**

である。

---

# **28\. rev.3の中心命題**

Bebop Readerは、

**音符を一個ずつ読めるようにしてから、後でジャズを教える教材ではない。**

最初のド・ソから、pulseの中で普通の譜面を読み、同じ構造が少しずつ変形・展開・再配置される経験を積む。

その結果、

**音符ではなく「動き」が見えるようになる。**

さらに、その動きが、

**流れている音楽のどこへ現れても、読んで歌えるようになる。**

そして最後には、その動きをBlues / Rhythm Changesの時間の中で自分から使えるようになる。

カリキュラム全体を一本にすると、

**ド・ソ → Tonic Shape → ShapeからLine → LineをCellとして身体化 → CellとHarmonyの往復 → Ornament / Chord Change → Relative Major / Minor → Density / Double Time → Blues / Rhythm Changes上で再構成**

となる。

そして学習体験の一本の流れは、

**READ → SING → RE-ENCOUNTER → MORPH → COLD READ → MOVE → CONNECT → FLOW**

である。

Bebop Reader rev.3を最も短く定義すれば、

**「ジャズが流れ続ける中で譜面を読み続けるうちに、音符ではなくParkerの“動き”が見え、歌え、使えるようになるアプリ」**

である。

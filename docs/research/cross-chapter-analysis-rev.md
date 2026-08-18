# **『チャーリー・パーカーの技法』章横断分析**

## **譜面検証反映・改訂版**

### **0\. この改訂版の位置づけ**

前版の章横断分析は、9章分のMarkdown本文を横断し、濱瀬元彦が描くCharlie Parkerの技法を「フレーズ集ではなく生成文法」と捉えた。ただし、その時点では譜例の実音・音価・コード配置を原画像で検証しておらず、譜例番号は後続確認の座標として扱っていた。

その後、優先確認対象として定めたex.001からex.269までを、本文・Markdownと原画像を突き合わせながら検証した。

その結果、前版の中心命題――

Parkerの旋律は、完成されたlickの集積ではなく、和声構造、リニア・ライン、セル、装飾、変形を組み合わせる生成文法として理解できる

――は支持された。

ただし、**生成方向は前版で想定したほど一方向ではない。**

改訂後の全体像は、むしろ次のような**相互変換系**として捉えるべきである。

**楽曲上のベースライン・コード／調的領域**  
 ↕  
 **背後に構想される親和声構造・コード・チェンジ**  
 ↕  
 **LINEAR LINE**  
 ↔  
 **CELLによる分節・和声細分化**  
 ↕  
 **分散和音・部分和音・構造変形**  
 ↕  
 **経過音・前打音・複前打音・刺繍・ターン・半音階化**  
 ↕  
 **リズム配置・時間圧縮・反復**  
 ↓  
 **実際のParker phrase**

重要なのは、上から下へだけ生成するのではないことだ。

* 和声構造からlineを作る  
* lineから潜在的なコード・チェンジを発見する  
* lineを2音cellへ切り、そのcellを和声化する  
* 装飾音が新たな和声認識を発生させる  
* cellの出口を次のcellの入口として再解釈する

という**往復運動**が、譜面上で確認された。

---

# **1\. 最初の原理：Parkerの「音階」はしばしば分散和音から生成される**

ex.001は、この本全体の最小モデルとして非常に強い。

B♭7上の実音は、

**A♭–G–F–E♭–D–C–B♭–A♭**

という完全な下降音階に見える。

しかし濱瀬の分析譜では、拍頭の

**A♭–F–D–B♭ \= 7–5–3–1**

が和声骨格であり、その間のG、E♭、Cが経過音として区別されている。つまり、

**B♭7の下降分散和音 7–5–3–1 → 間を経過音で埋める → 表面では8音の下降音階になる**

という生成である。

上昇形ex.005でも同じである。

Gm7の

**G–B♭–D–F \= 1–3–5–7**

にA、C、Eを入れることで、

**G–A–B♭–C–D–E–F**

という上昇音階型になる。

したがって本書における基本方向は、

**scale → chord toneを選ぶ**

ではなく、

**chordal skeleton → passing tones → scalar surface**

である。

これはRelative Major、Tonic Major、Tonic Minor、double-timeまで一貫して再出現する。

ただし、ここから「経過音は常に一つのscaleから選ばれる」と一般化してはいけないことも、後の譜例で明らかになった。

---

# **2\. 装飾音は表面だけではない――和声そのものを作り変える**

前版では、

**和声骨格 → 装飾 → 表面旋律**

という階層を強く想定していた。

ex.029は、その理解を修正する。

A7の7度Gは、旋律的には次のFMaj7のFへ解決する前打音として説明できる。

しかしParkerはDm7→G7をG7sus4として捉え直すことで、同じGを今度は

**G7sus4のroot**

として扱う。

つまり同じ一音が、

**前の和声から残された装飾音 → 次に構想される和声の構成音**

へ転化する。

したがって、装飾は固定された和声の上に最後に置かれるだけではない。

**melodic motionそのものが、次のharmonic reinterpretationを誘発しうる。**

これは後の、

* cell境界の再解釈  
* Relative Majorの反復  
* 前のcell末尾を次のcellの前打音として再使用すること

にもつながる。

Parkerの生成文法では、**和声と装飾は階層的でありながら双方向的**である。

---

# **3\. LINEAR LINEは、旋律を貫く最も安定した骨格である**

Swing期のex.071では、Lester Youngの旋律から

**E–D–C♯–B–A–G–F♯–E–D**

という4小節をまたぐ下降線が抽出される。

濱瀬はこれを、

**Em7 → C♯m7♭5 → Am7 → F♯m7♭5 → D7**

の各1–7として分節する。

ただし重要なのは、濱瀬自身が「演奏者が実際にそのコード名を考えていた」とは断定していないことである。

この点から、コード・チェンジには二つの性格がある。

1. 演奏者が構想する生成上の和声  
2. 旋律から逆算可能な**分析上の潜在的和声**

したがって、分析で現れるコード名をすべて「その瞬間に実体として響いていたコード」と考えるべきではない。

むしろ、そこで保存されているのは、

**音から音へ進むlineの構造的関係**

である。

そしてex.085では、この逆分析が生成規則へ反転する。

C Majorのダイアトニック7th chordを6度上昇＝3度下降で、

**CMaj7 → Am7 → FMaj7 → Dm7 → Bm7♭5 → G7 → Em7 → C**

と並べ、各コードから1–7を取ると、

**C–B | A–G | F–E | D–C | B–A | G–F | E–D | C**

という連続した下降線になる。

つまり、

**演奏 → lineを発見 → chordを分節する**

こともできれば、

**欲しいline → chordを配置 → lineを生成する**

こともできる。

ここから、LINEAR LINEを単なる分析結果ではなく、**Parkerの旋律生成を拘束する主要な不変項**と見ることができる。

---

# **4\. CELLは「lickの断片」ではなく、lineと和声を接続する最小単位**

ex.087でCELLの意味が譜面上でも明確になった。

原曲上のコードは、

**F → D7 → Gm7 → C7**

だが、Parkerの旋律から濱瀬が読み取るコード・チェンジは、

**Am7 → F♯dim → D7 → B♭Maj7 → Gm7**

である。

そこから抽出されるlineは、

**A–G | F♯–E♭ | D–C | B♭–A | G**

となる。

CELLはこのコード・チェンジの「それ以上分割できない最小単位」である。

しかしcellの表面形は一定ではない。

例えばA→Gという一つの構造でも、

* A–G  
* A–C–B–A–G  
* 分散和音化  
* 音階化  
* 前打音を付加  
* 半音階化

などへ展開できる。

したがって、

**CELL ≠ 固定フレーズ**

である。

CELLとはむしろ、

**linear target \+ harmonic interpretation**

という抽象的な生成単位である。

さらにex.087では「D7」と呼ばれたcellが、実際にD7和音を響かせるというより、lineを分節するための音程的・分析的名称として機能する可能性も明記される。

よってcellのコード名を過度に実体化してはならない。

---

# **5\. 「今どのキーか」だけではParkerの音選択を説明できない**

譜面分析前には、

**local tonal centerを定め、そのpitch collectionから経過音を選ぶ**

というモデルがかなり有力に見えた。

これは一部では正しい。

しかしex.092によって、それを最上位原理にすることはできなくなった。

ベースラインは、

**F♯m7 → B7 → E**

という明瞭なEへのii–V–Iだが、内部cellは、

**F♯m7♭5 → D♯dim → B7 → G♯m7 → EMaj7 → C♯m7**

まで細分化される。

最初のF♯m7♭5 cellの音集合はE Majorには収まらず、D♯dimはE harmonic minor的、後半はE Major的である。

さらにex.087、ex.222、ex.234では、

* ダイアトニックな経過音  
* targetへ向かう半音階的前打音  
* 複前打音  
* cell境界を接着するchromatic connector

が重なる。

したがって、

**global key → scale → notes**

という一本の階層では足りない。

譜面横断からは、少なくとも以下を別レイヤーとして扱う必要がある。

**Global / local tonal field**  
 ↓  
 **Baseline harmony**  
 ↓  
 **Parent harmonic structure / chord change**  
 ↓  
 **CELL / chord skeleton**  
 ↔  
 **LINEAR LINE target**  
 ↓  
 **Diatonic filling / chromatic approach / transformation**  
 ↓  
 **Surface phrase**

ただし、この階層自体は濱瀬がそのまま提示したものではなく、譜例横断から得た分析モデルである。

また、各層の優先順位は固定ではない。

ex.245のように数小節を貫くF harmonic minorというtonal fieldが非常に強く支配する場合もあれば、ex.092のようにcellごとに音集合が切り替わる場合もある。

したがって「現在のscale」を一点で答えるより、**どの時間幅・どの構造階層について尋ねているのか**を区別する必要がある。

---

# **6\. Relative Majorの実体――「代理コード」ではなくDominant内部のupper structure**

Relative Majorは譜面確認によって、前版よりはるかに明瞭になった。

ex.118でE♭7を13度まで積むと、

**E♭–G–B♭–D♭–F–A♭–C = 1–3–5–7–9–11–13**

となる。

この内部を4音ずつ切れば、

* E♭7  
* Gm7♭5  
* B♭m7  
* D♭Maj7

が得られる。

つまりRelative Major系のコードは、外から突然「代理コード」として持ち込まれるのではない。

**一つのDominantを高次まで縦に積み、その内部から部分和音を切り出したもの**

である。

ex.122では、その部分和音を高い側から、

**D♭Maj7 → B♭m7 → Gm7♭5 → E♭7**

と時間方向に並べる。

隣り合うコードは4音中3音を共有し、1声だけが動く。そこから滑らかなvoice-leadingとlinear lineが生まれる。

したがってRelative Majorの生成は、

**Dominant → higher intervalsまで3度堆積 → 内部のrelated chordsを抽出 → 時間方向へ並べ直す → voice-leading → linear line → Parker phrase**

と整理できる。

特にex.124は決定的である。

ベースライン上ではB♭m7→E♭7というii–Vだが、濱瀬はこの全体をE♭7として捉える。

つまり、

**horizontal ii–V → vertical E♭7(13) → new horizontal related changes**

という変換が起きる。

Parkerのコード・チェンジとは、書かれたコードを細かく置換することではなく、**縦と横を相互変換して別の旋律生成空間を作ること**だと理解した方がよい。

---

# **7\. “flatted fifths”は音色ではなく、再利用可能な構造変形**

ex.129では三つのDominantに対して、

**EMaj7 → EMaj7(♭5)**  
 **DMaj7 → DMaj7(♭5)**  
 **CMaj7 → CMaj7(♭5)**

が同じ形で移調される。

つまり、

**1–3–5–7 → 1–3–♭5–7**

という同じ操作が反復されている。

これは「そのコードではこのaltered scaleを使う」という個別語彙より、**転調可能な変形規則**とみる方が適切である。

ex.130ではさらに、一つの半音下降A♭→Gが、

Relative Major側から見れば

**5 → ♭5**

Dominant側から見れば

**11(sus4) → 3**

になる。

同一の音移動が、二つの和声的意味を同時に持つ。

ex.132ではさらに、

1. G7 → D♭7へDominant全体を減5度移動  
2. Relative Major FMaj7 → C♭Maj7へ同じく減5度移動  
3. さらにC♭Maj7の5度を♭5化

と、同じ変形原理が階層をまたいで反復される。

したがってflatted fifthsは、

**altered noteのカタログ**

ではなく、

**既存の和声構造に作用するoperator**

と捉えるべきである。

これは本書全体に現れる重要な特徴でもある。

Parkerの複雑さは、素材の数以上に、**少数の構造へ同じ操作を繰り返し適用できること**から生まれている。

---

# **8\. Tonic Majorも別体系ではない――triadから同じ文法が始まる**

Tonic Majorの最初は驚くほど単純である。

ex.160の骨格はB♭ triadの、

**D–F–B♭ \= 3–5–1**

だけである。

その各targetへ上下から前打音を交互に置くと、別レイヤーとして、

**G–F–E♭–D–C–B♭**

という下降lineが現れる。

ex.162ではさらに単純で、

**G–C–E \= C triad 5–1–3**

に、

* F→Eという前打音  
* D–C–B–Cというターン

を加えるだけで、

**G–F–E–D–C–B–C–E–G**

というParker的な旋律になる。

ここでもF、D、Bは単に「C major scaleの音だから使う」のではない。

それぞれが、

* targetへのapproach  
* turnの上方音  
* turnの下方音

という局所的機能を持つ。

したがってTonic Majorでも、

**triad/chord skeleton → target-directed ornament → linear line → surface phrase**

という同じ生成文法が働く。

さらにex.167では、B♭ Tonic Majorで使われるB♭6系の材料が、C7(13)のupper structureにもそのまま含まれることが確認される。

つまり、

**B♭ Tonicのshape**

と

**C7に対するRelative Major B♭のshape**

は、和声的文脈だけを変えて共有できる。

ParkerのTonic語彙とDominant語彙は完全に分離した二つの辞書ではなく、**同じ構造へ異なる意味を与えられるネットワーク**である。

---

# **9\. Relative MinorはRelative Majorの「別語彙」ではなく、対称的な第二の構造**

ex.183とex.184の比較により、Relative Major / Minorの関係は非常に明快になった。

C7(13)からは、

**Relative Major：B♭6 \= Gm7**

が得られる。

そこからF→Eと半音下降させると、

**B♭6(♭5) \= Em7♭5 → C7**

へ戻る。

一方C7(♭9,♭13)からは、

**Relative Minor：B♭m6 \= Gm7♭5**

が得られ、同じF→Eによって、

**B♭m6(♭5) \= Edim → C7**

へ戻る。

したがってMajor / Minorで異なるのは主として**親upper structure**であり、

**relative structureを作る → 5度を半音下げる → sus4を解除する → Dominantへ回収する**

という操作は共通している。

ここでも新しい世界をゼロから構築しているのではなく、**既知の操作を別のshapeへ適用している。**

---

# **10\. Relative Major ↔ Relative Minorは、一声の変形で連続的につながる**

ex.190については、譜面検証によって前版の説明を修正する必要がある。

ex.190そのものは「Relative MajorからRelative Minorへ移った完成例」ではない。

まずG7(13)のRelative Major側で、

**Am7 → FMaj7 → Dm7/F6 → Bm7♭5/F6(♭5)**

という6度コード・チェンジを作り、

**A–G–F–E–D–C–B–A–G**

という下降lineを生成する。

その終端のF6(♭5)に含まれるAを、

**A → A♭**

と一声だけ変形することで、次ページの

**Fm6(♭5) \= Bdim**

すなわちRelative Minor側へ入る。

したがってex.190は、正確には**RM→Rmのピボットを準備するモデル**である。

一方ex.216では、Relative Majorを経由せずG7上でRelative Minor Fmを直接使用する。

そこから、

**A♭–G–F–E**

という滑らかなlineを保ちながらC Major tonicへ戻る。

ex.222では逆方向に、

**Relative Minor Cm → Relative Major C → G Tonic**

へ移りながら、

**G–F–E♭–D–C**  
 **D–C–B**

というlineを切らない。

ここから非常に重要な原則を抽出できる。

**和声構造は大胆に切り替えてよい。 LINEAR LINEは切らない。**

この「和声の可変性」と「lineの連続性」の組合せが、Parkerの複雑さと自然さを同時に説明する。

---

# **11\. Relative Minorによるコード・チェンジ――複雑になるほどlineは単純になる**

ex.234では、元の

**| Em7 A7 | Dm7 G7 |**

が、Parker内部では

**Em7 → E♭7 → A♭6(Fm7) → A♭m6(Fm7♭5)**

へ組み替えられる。

ここには、

* tritone方向へのコード・チェンジ  
* Relative Minor  
* Relative Minorの♭5化  
* 複前打音の半音階化  
* 次のtargetへの前打音

が同時に存在する。

にもかかわらず構造線は、

**E♭–D♭–C–B♭–A♭**

という極めて単純な下降である。

これは本書の重要な特徴を端的に示す。

**表面・和声分節が複雑になるほど、深層のlineはむしろ単純でありうる。**

Parkerの高速で複雑な旋律を難しい音列の集合として直接記憶するのではなく、単純なlineを何重にも和声化・装飾したものとして見るべき理由がここにある。

---

# **12\. Tonic Minorでは「scaleと和声構造の関係」が最も明示的になる**

Tonic Minorは、これまでの生成原理が最も完成された形で現れる。

## **12-1. Melodic Minor型**

ex.241のCmでは、完全5度下の

**F7(♯11,13)**

を高次まで積み、そのupper structureとして

**E♭Maj7+(♯11)**

を得る。

その3度積み骨格、

**G–B–D–F–A**

の間を埋めると、

**G–A–B–C–D–E♭–F–G–A**

となり、C Melodic Minor上行形と一致する。ここは濱瀬自身が音集合の一致を明記している。

つまり、

**F7(♯11,13)の和声累積 → upper structure → chord skeleton → passing toneによる音階化 → C melodic minor surface**

である。

## **12-2. Harmonic Minor型**

ex.243ではF Tonic Minorを、完全5度上の

**C7(♭9,♭13)**

から生成する。

その内部から、

**D♭Maj7 → B♭m7 → Gm7♭5 → Edim → C7 → A♭Maj7+ → Fm**

という部分和音連鎖が得られる。

各コードの1–7をつなぐと、その下降線はF Harmonic Minor下降形と一致する。

ここでは、

**Chord structure = Parent pitch collection = Linear scale**

がほぼ完全に一致する。

したがって、少なくともこの基本形については、

「Harmonic Minor scaleを選んでコードを作る」

より、

**Dominantの累積構造を作る → 部分和音へ分節する → voice-leadingをつなぐ → 結果としてHarmonic Minorになる**

という説明が濱瀬体系に忠実である。

---

# **13\. Tonic Minorでは、数小節を貫く「tonal field」がコード境界を超える**

ex.245は、「現在のキー／scale」をどう考えるべきかについて特に重要である。

84–90小節のベースラインは、

**Fm ↔ Gm7♭5–C7**

を繰り返す。

しかし濱瀬の内部コード・チェンジはこのベースライン境界と一致しない。

85小節以降、長い

**B♭–A♭–G–F–E–D♭–C …**

というF harmonic minor上の下降lineが複数小節を貫き、その内部に、

* Relative Minor  
* Dominant  
* Tonic Minor

の部分和音が入れ替わりながら配置される。

ここでは、

**Gm7♭5だからscale A → C7だからscale B → Fmだからscale C**

とコード単位で追うモデルは適切ではない。

むしろ、

**Local tonal center：Fm → F harmonic minorという長いtonal field → その内部で複数のharmonic functionを移動 → 一つのlinear lineを維持**

と理解した方が濱瀬の記述に合う。

したがって、Parkerの調性感には、

* cell単位で音集合が切り替わる局面  
* 数小節を一つのtonal fieldが貫く局面

の双方が存在する。

---

# **14\. Double-timeは新しい語彙ではなく、既存文法の「密度変換」である**

最終章の譜面確認で、この点はかなり確定的になった。

## **ex.267：一つの2音cellを膨張させる**

出発点は、

**G → F**

というわずか2音。

これをGm7♭5の分散和音へ展開し、さらに経過音で音階化し、最後に半音階化することで、約12音の高速cellまで膨らませる。原譜では高速部が64分音符で記譜される。

ここではpassing tone選択に、単なるpitch collectionだけでなく、

**和声音を特定のリズム位置へ置く**

という時間上の条件も作用する。

すなわちdouble-timeでは、

\*\*harmonic skeleton

* linear target  
* rhythmic placement  
   → passing/chromatic notes\*\*

という層が必要になる。

## **ex.268：同じcellを再起動する**

一つのRelative Majorを音階化した後、その末尾E–Gを終止音とせず、次の複前打音として再解釈し、同じRelative Majorをもう一度展開する。

つまり、

**cell展開 → 出口 → 出口を次の入口へ読み替える → 同じcellを再起動**

することで長いdouble-time phraseになる。

高速化とは、新しい語彙を延々追加することではない。

**既知のcellを拡大し、接続し、再利用して時間を埋めること**でもある。

---

# **15\. ex.269が示す最終的な修正――lineは和声から作られるだけでなく、和声を作る**

ex.269は、今回の譜面検証を通じて最も重要な譜例の一つになった。

ベースラインはCm7。

まず、

**G–F–E♭–D–C–B♭**

という単純な下降lineを置く。

それを、

**G–F | E♭–D | C–B♭**

と2音ずつ切る。

各2音を1–7とするコードを割り当てると、

**Gm7 → E♭Maj7 → Cm7**

になる。

さらに各コードを分散和音化し、経過音を加えれば、高密度なParker phraseになる。

つまり生成順は、

**LINEAR LINE → 2-note CELL → CELLを和声化 → arpeggiation → passing / chromatic notes → double-time phrase**

である。

これは前版の、

**コード・チェンジ → CELL → LINEAR LINE**

という一方向図式だけでは説明できない。

両方が存在する。

### **Harmony-first**

**Parent harmony → related chords → 1–7 connection → linear line**

ex.085、122、243など。

### **Line-first**

**Linear line → cell segmentation → harmonic assignment → surface expansion**

ex.269。

さらにex.071や087では、

**surface phrase → lineを抽出 → latent harmonyを復元**

という分析方向も存在する。

したがって最終的には、

**Harmony ↔ Line ↔ Cell**

を三角形のような相互規定関係として捉えた方がよい。

---

# **16\. 改訂版の結論：Parkerの技法の中心は「可変な和声」と「切れないline」の組合せである**

譜面まで確認した後、本書を最も短く要約するならこうなる。

Parkerは、

**決められたコード進行の上で、それぞれに対応するscaleを選び、lickを並べているのではない。**

与えられたコードを、

* 高次まで垂直に拡張する  
* 内部からrelated chordを切り出す  
* Relative Major / Relative Minorへ読み替える  
* 一部の音を半音変形する  
* tritoneなどで構造全体を移動する  
* TonicとDominantで同じshapeを再解釈する  
* lineに合わせてコード境界自体を細分化する

ことができる。

一方で、その和声的自由度を支えているのが、

**滑らかなLINEAR LINE**

である。

表面では巨大な跳躍、分散和音、32分・64分、半音階、複雑なコード・チェンジが起きていても、その内部を還元すると、

**G–F–E♭–D–C–B♭**

のような極めて単純な順次進行が何度も現れる。

したがって本書の核心は、

**複雑な和声を覚えること**

でも、

**Parker lickを収集すること**

でも、

**各コードにscaleを割り当てること**

でもない。

より正確には、

**単純で連続的なlineを保ちながら、周囲の和声構造を分節・拡張・変形・再解釈し、そのcellを分散和音・音階化・装飾・半音階化・時間圧縮によって表面化する生成文法**

である。

そしてこの生成文法は、最初期のex.001にある

**分散和音 → 経過音 → 音階型**

から、最終部ex.269の

**line → cell → 和声細分化 → double-time**

まで断絶なくつながっている。

---

# **17\. 今回の譜面検証によって前版から修正すべき主要点**

前版からの差分を明示すると、以下の7点に集約できる。

1. **生成モデルを一方向から双方向へ修正する。**  
    「Chord change → Cell → Line」だけでなく、「Line → Cell → Chord change」もParkerの主要な生成方向である。  
2. **装飾を最下層に固定しない。**  
    前打音等は表面装飾であると同時に、新たな和声解釈を発生させることがある。  
3. **分析上のコード名を実体化しすぎない。**  
    Cellのコード名は、ときに実際の独立した和音というより、lineを分節するための構造名である。  
4. **「local keyから経過音を選ぶ」を一般原理から降ろす。**  
    parent collectionが明確な例もあるが、cellごとのcollection切替、target-directed chromatic approach、長時間幅のtonal fieldも存在する。  
5. **Relative Major / Minorを外部代理コードとして理解しない。**  
    Dominantの高次累積内部から部分和音を切り出し、それを時間方向へ展開する構造として理解する。  
6. **alterationを「色」よりoperatorとして理解する。**  
    ♭5、minor↔major、tritone等は、既存shapeへ反復可能な変換規則として働く。  
7. **double-timeを別の高度語彙として扱わない。**  
    既存のline/cellを分散和音化・音階化・半音階化・反復・時間圧縮・和声細分化することで生成される。

この7点を反映すると、本書の各章は個別テクニックの列ではなく、

**「単純なlineと和声骨格から、どこまで表面を変形しても構造的一貫性を失わずにParkerの旋律へ到達できるか」**

を、段階的に拡張していく一冊として読める

1. **「構造的境界とsurface境界を区別する」**  
    LINEAR LINE / CELL の始点・終点は構造上のtargetであり、実際のsurface phraseの最初・最後の音と一致するとは限らない。前打音・複前打音は最初のtargetより前へ、turnやconnectorはtargetの後へ拡張しうる。またcellの出口は次のcellの入口・前打音へ再解釈されうる。したがってPhrase Familyの不変項をliteralな先頭音・末尾音だけで定義してはならない。

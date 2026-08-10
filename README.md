# Bebop Reader v0.1

ジャズの読譜を「譜面 → 内的聴覚 → 発声 → タイム → フレーズ」として鍛える、iPhone縦持ち向けPWAのMVPです。

## v0.1 の範囲
- C Majorのみ
- 28 exercises: Pitch / Scale / Arpeggio / Rhythm / Phrase
- VexFlow SVG譜面
- Tone.jsによるお手本・4拍count-in
- getUserMedia + YIN pitch detection
- Pitch / Time / Flow採点
- 採点は演奏後のみ表示
- localStorageによるmastery / streak / settings保存
- PWA manifest + service worker
- マイク不可時はself-rating Practice mode

## ローカル起動
静的ファイルなので、HTTP serverでこのフォルダを配信します。

```bash
python3 -m http.server 8080
```

`http://localhost:8080` を開きます。マイク利用にはHTTPSまたはlocalhostが必要です。

## 公開
Vercel / Netlify / Cloudflare Pages / GitHub Pages等のstatic hostingにフォルダをそのまま配置できます。ビルド工程はありません。

## 主要ファイル
- `src/exercises.js`: 構造化された教材データ
- `src/notation.js`: VexFlow SVG renderer
- `src/audio.js`: Tone.js audio/count-in/demo
- `src/pitchDetector.js`: YIN pitch detection
- `src/mic.js`: microphone capture
- `src/scoring.js`: Pitch / Time / Flow scoring
- `src/storage.js`: mastery / settings persistence
- `app.js`: screens/router/session loop

## iPhone
Safariで公開URLを開き、共有 → ホーム画面に追加。初回の「歌う」でマイク許可を求めます。

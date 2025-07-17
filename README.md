# YouTube Channel Blocker

不要なYouTubeチャンネルを非表示にするシンプルなChrome拡張です。  
A simple Chrome extension to block unwanted YouTube channels.

📖 このREADMEには日本語と英語の説明が含まれています。  
📖 This README includes instructions in both Japanese and English.

---

## 日本語

### 使い方 🚀

1. 「youtube-channel-blocker」フォルダを作成し、コードをその中に入れます。  
2. アイコン用に適当なPNG形式の画像を2つ用意し、それぞれ名前を以下のように変更してフォルダ内に置きます：  
   - `icon48.png`  
   - `icon128.png`
3. ブラウザのURLバーに `chrome://extensions/` と入力し、拡張機能ページを開きます。  
4. 右上の「デベロッパーモード」を ON にします。  
5. 左上の「パッケージ化されていない拡張機能を読み込む」をクリックし、「youtube-channel-blocker」フォルダを選択します。  
6. これで拡張機能が読み込まれ、すぐに使用できます。

### 注意 ⚠️

- 理論上ブロックできる最大件数：約34,000件 🧮  
  （YouTubeチャンネル名が最大50文字の場合の計算です。）

- 大体の不具合はブラウザの更新で直ります（細かい不具合への対処は困難）🔧

- 処理の関係上、一瞬で非表示にするのは困難です（処理が遅い時はサムネが見えることも）🙈

- 本家と同じく突然リストが消える可能性があるので、リストは定期的にバックアップを推奨します（現時点でその現象は確認出来てませんが）💾

- 力を入れて更新する気はないですが、ブログやX（Twitter）へのコメントやプルリクエストがあれば、対応するかもしれません

---

## English

### How to use 🚀

1. Create a folder named `youtube-channel-blocker` and place all code inside it.  
2. Prepare two PNG images for the icons and rename them:  
   - `icon48.png`
   - `icon128.png`
   Place both files in the folder.  
3. Open your browser and go to `chrome://extensions/` in the URL bar.  
4. Enable "Developer mode" using the toggle at the top right.  
5. Click "Load unpacked" (top left) and select the `youtube-channel-blocker` folder from your computer.  
6. The extension is now loaded and ready to use.

### Notes ⚠️

- The maximum theoretical number of blocked channels is approximately 34,000 🧮  
  (This assumes each YouTube channel name is up to 50 characters long.)

- Most issues can usually be fixed by updating your browser. Fixing minor bugs beyond that is difficult. 🔧

- Due to processing limitations, it’s currently not possible to instantly hide blocked channels. Thumbnails from blocked channels may briefly appear if the process lags. 🙈

- Like the official version, there is a chance the block list may suddenly disappear. (This has not been observed so far.) 👉 Regular backups of your list are recommended. 💾

- Active maintenance is not planned, but I may respond to comments on my blog or X (Twitter), or to pull requests. ✍️

---

## Contact / 連絡 📬

📘 Blog: [https://physx.hatenablog.com/entry/2025/07/13/174229](https://physx.hatenablog.com/entry/2025/07/13/174229)  
🐦 X (Twitter): [https://x.com/aki009113](https://x.com/aki009113)

---

## 実装予定（やるとは言わない）
- チャンネルページや動画再生ページに×ボタン追加
- 動画タイトルからキーワード非表示
- ~~×ボタンで非表示にしたチャンネル名を一時的にポップアップ（間違い防止。１つだけ戻すボタンも追加したい。）~~ 追加済み・5秒で消える
- 拡張機能の詳細設定を追加
- ×ボタンのUIやポップアップの改善

---

## Planned Features (Not Promised)
- Add × button to channel pages and video playback pages
- Hide keywords from video titles
- ~~Temporarily show the blocked channel name in a popup after clicking × (to avoid mistakes; add an undo button for the last action)~~ Added・disappears in 5 seconds
- Add advanced settings to the extension
- Improve the UI of the × button and popup

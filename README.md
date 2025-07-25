# YouTube Channel Blocker（v0.2.1）

不要なYouTubeチャンネルを非表示にするシンプルなChrome拡張です。  
A simple Chrome extension to block unwanted YouTube channels.

チャンネル名の非表示リストや動画タイトルフィルターを用いて、検索ページや関連動画、ホームから興味のない動画を非表示にできます。  
Hide videos you don’t want to see from search, recommendations, and the homepage with channel block lists and title filters.

📖 このREADMEには[日本語](#日本語) と [英語](#english) の説明が含まれています。  
📖 This README includes instructions in both [Japanese](#日本語) and [English](#english).

---

## 日本語

### インストール 🛠️

### Gitを使わない場合のインストール方法 📦

Gitを使用しない場合、次の2通りの方法でインストールできます。

---

#### 1. 手動でコピペする方法

1. 任意の場所に「youtube-channel-blocker」フォルダを作成します。  
2. GitHub上のソースコードから、必要なファイル（HTML／CSS／JavaScript／manifestなど）を一つずつコピーして、作成したフォルダに貼り付けます。  
3. `README.md`、`.gitignore`、`LICENSE` などは動作に必要ありませんので省略して構いません。  

[インストールの共通手順へ](#インストールの共通手順)

---

#### 2. Release から zip / tar.gz をダウンロードする方法

1. 以下のURLから「Release」ページへアクセスします：  
   👉 https://github.com/bsadd-jpan/youtube-channel-blocker/releases  
2. ページ内の **「Source code（zip）」または「Source code（tar.gz）」** と書かれたリンクをクリックし、ファイルをダウンロードします。  
3. ダウンロードしたファイルを、任意の場所で解凍してください。  

※更新があった場合は、手動で再度ダウンロード・解凍が必要です。

[インストールの共通手順へ](#インストールの共通手順)

---

### Gitを使う場合のインストール方法 📦 
1. [Git公式サイト](https://git-scm.com/) からインストーラーをダウンロードし、指示に従ってインストールします（Windows/Mac/Linux対応）  
2. インストール確認：
   ```bash
   git --version
   ```
コードを取得（初回のみ）

3. このリポジトリのGitHubページを開き、緑色の [Code] ボタンをクリックします。
4. 「HTTPS」のURL欄右側の📋（クリップボードアイコン）をクリックしてURLをコピーします。
5. 任意の場所でターミナル（またはコマンドプロンプト）を開きます。
6. 次のコマンドでリポジトリをクローンします（<`URL`>部分にコピーしたURLを貼り付け）。例えば、デスクトップに保存したい場合は、
    ```bash
    cd C:\Users\[PCのユーザー名]\Desktop\
    git clone <URL>
    ```

[インストールの共通手順へ](#インストールの共通手順)

#### 補足：Gitで最新版を取得（更新）🔄 

Gitを使って、新しいバージョンに更新したい場合は同じフォルダ内で次のコマンドを実行します。

  ```bash
  cd C:\Users\[PCのユーザー名]\Desktop\youtube-channel-blocker
  git pull
  ```

---

### インストールの共通手順
フォルダとソースコードが準備できたら、以下の手順を行います。
1. アイコン用に適当なPNG形式の画像を2つ用意し、それぞれ名前を以下のように変更してフォルダ内に置きます：  
   - `icon48.png`  
   - `icon128.png`    
2. ブラウザのURLバーに `chrome://extensions/` と入力し、拡張機能ページを開きます  
3. 右上の「デベロッパーモード」を ON にします  
4. 左上の「パッケージ化されていない拡張機能を読み込む」をクリックし、「youtube-channel-blocker」フォルダを選択します  
5. これで拡張機能が読み込まれ、すぐに使用できます

---

### 使い方🔴

- チャンネル名横の赤い×ボタンを押せば、そのチャンネルの動画をすべて非表示にできます  
  （チャンネルページや再生している動画からの非表示は未実装）  
- 非表示にならなかったら、ブラウザの更新や画像の確認等を行ってみてください  
- 自分で名前をリストに追加することも可能です  
- リストは拡張機能の設定画面等から確認できます    
- たまに動作しないときがありますが、ブラウザの更新で大体直るはずです

---

### 追加実装 ✨

個人的な「こんな機能あると良いなあ」で実装済みのやつを箇条書き

<details>
<summary>詳細を表示</summary>

- **リストのインポート・エクスポート**  
  - エキスポートボタンではjsonファイルとしてリストを出力  
  - インポートボタンではjsonファイルを入力することで、リストを完全に置換  
  - 本家Channel Blockerは時々リストが消える現象があったので、この拡張機能も定期的なバックアップを推奨（この拡張機能でリストが消える現象は現時点では未確認）  
- **拡張機能の動作トグル**  
  - 拡張機能のアイコンから、赤い「Blocker:ON」を押すと「Blocker:OFF」と灰色になって、非表示が無効化  
  - ボタンを押したら更新不要で反映（反映が遅いことがあるので注意）  
- **「直近の１つを削除」ボタン**  
  - 拡張機能のアイコンを押すと表示  
  - ×ボタンを押したときにでてくる「Blocked:チャンネル名」というポップアップとあわせて、誤入力をすぐに挽回可能  
  - トップページで偶に違う動画がリストに入ってしまう現象を確認しているので、その対策  
- **動画タイトルフィルター**  
  - キーワードを1つ設定すると、そのキーワードを含むすべての動画タイトルが非表示  
  - 1つのキーワードの文字数制限は30文字  
  - 対象は動画タイトルのみ（チャンネル名は対象外）  
  - 3つのキーワードのAND条件（キーワードセット）でも非表示可能  
  - キーワードセットは最大1000個  
  - キーワード設定の例：「切り抜き」と「さしすせそ」と「GTA」を1つのキーワードセットに入れた場合  
    - 「私の<u>切り抜き</u>動画集」→表示 
    - 「<u>GTA切り抜き</u>集」→表示  
    - 「<u>さしすせそ切り抜き</u>集」→表示  
    - 「<u>GTA</u>面白い瞬間【<u>さしすせそ</u>/<u>切り抜き</u>】」→非表示  

- **エラーメッセージのポップアップ**  
  - ×ボタンを押したときに、違うチャンネルがリストに追加されそうなときはエラーメッセージをポップアップ  
  - 「Error:(チャンネル名A) ≠ (チャンネル名B)」というメッセージがポップアップ（リストには追加されない）  
  - レイアウト崩れによるものだと思うので、ブラウザの更新等を推奨  
  - エラーメッセージではないが、×ボタンでリストに追加したときは「Blocked: チャンネル名」とポップアップするので間違いがないか要確認  

- **言語切り替え機能**  
  - 設定ページからも表示する言語を切り替え可能  
  - 切り替えは英語と日本語  

- **リストの編集ボタン**  
  - 設定ページから、各リストを編集して名前を変更することが可能  
  - 編集後に保存したい場合は保存ボタンを、キャンセルしたい場合はキャンセルボタンを押下  

</details>

---

### 注意 ⚠️

- 理論上ブロックできる最大件数：約34,000件🧮  
  （最大件数に近いまたはそれを超えてリストに追加したときの動作は不明）
- 大体の不具合（というか、処理速度が原因のやつ）はブラウザの更新で直ります🔧
- 処理の関係上、サムネを一瞬で非表示にするのは困難です🙈    
- 本家と同じく突然リストが消える可能性があるので、定期的にバックアップを推奨します💾   
  （現時点でその現象は確認出来てませんが）
- 力を入れて更新する気はないですが、ブログやX（Twitter）へのコメントやプルリクエストがあれば、対応するかもしれません 

---

## ライセンス

このソフトウェアは [MITライセンス](LICENSE) のもとで配布されています。  
詳細については同梱の LICENSE ファイルをご確認ください。

超意訳
- 自己責任で自由に使っていいよ！
- コードに記載されている作者の名前とライセンスは消さないこと
- バグっても壊れても泣かないこと

## 免責事項

このソフトウェアは現状のまま提供され、いかなる保証もありません。  
使用によって生じたいかなる損害や問題についても、作者は一切の責任を負いません。  
すべての使用は利用者自身の責任において行われるものとします。

## 実装予定（未実装・確実にやるとは言わない）  

- チャンネルページや動画再生ページに×ボタン追加  
- ショート動画は勝手に再生されて音量調整も難しい好ましくないコンテンツ（個人の感想）なので、表示・非表示を切り替えるトグルを追加
- インストール等がやりやすいようにストアに公開
---

## 連絡 📬
不具合だけではなく、インストール手順に従って問題なく動いたか等についても、ブログやXで報告いただければ嬉しいです。  
本GitHubのページはDiscussionやissueも開放しているので、そちらからでもどうぞ。

📘 ブログ（記事に飛ぶ）: [https://physx.hatenablog.com/entry/2025/07/13/174229](https://physx.hatenablog.com/entry/2025/07/13/174229)  
🐦 X (Twitter): [https://x.com/aki009113](https://x.com/aki009113)

---

## English

### Installation 🛠️

### Installation without Git 📦

If you do not use Git, there are two ways to install the extension.

---

#### 1. Manual Copy Method

1. Create a folder named `youtube-channel-blocker` anywhere on your system.  
2. From the GitHub repository, manually copy the necessary files (HTML, CSS, JavaScript, manifest, etc.) into the folder.  
3. Files like `README.md`, `.gitignore`, and `LICENSE` are not required for the extension to work and can be omitted.

---

#### 2. Download from Release (zip / tar.gz)

1. Visit the following URL to access the "Release" page:  
   👉 https://github.com/bsadd-jpan/youtube-channel-blocker/releases  
2. On the page, click the **"Source code (zip)"** or **"Source code (tar.gz)"** link to download the archive.  
3. Extract the contents to any location on your system.

※ Please note that you will need to manually re-download and extract the files if the extension is updated.

---

### Installation with Git 📦 
1. Download and install Git from the official website following the instructions (available for Windows/Mac/Linux).
2. Confirm the installation by running:
  ```bash
  git --version
  ```
3. Open the GitHub page of this repository and click the green [Code] button.
4. Click the clipboard icon 📋 next to the HTTPS URL to copy it.
5. Open a terminal (or command prompt) at your preferred location.\
6. Clone the repository using the command below (replace <`URL`> with the copied URL). If you want to save it on your Desktop, for example:

  ```bash
  cd C:\Users\[YourUserName]\Desktop\
  git clone <URL>
  ```

Updating to the latest version 🔄 

To update to the newest version via Git, run the following command inside the folder(e.g., your Desktop):
  ```bash
  cd C:\Users\[YourUserName]\Desktop\youtube-channel-blocker
  git pull
  ```

---

### Common installation steps
1. Prepare two PNG images for the icons, rename them as follows, and place them in the folder:  
   - `icon48.png`  
   - `icon128.png`  
2. Open your browser and navigate to `chrome://extensions/` in the URL bar.  
3. Enable "Developer mode" using the toggle at the top right.  
4. Click "Load unpacked" (top left) and select the `youtube-channel-blocker` folder.  
5. The extension will be loaded and ready to use immediately.

---

### How to use 🔴

- Press the red × button next to the channel name to hide all videos from that channel  
  (Blocking from the channel page or currently playing videos is not yet implemented)  
- If videos are not hidden, try refreshing your browser or checking for missing images  
- You can also manually add channel names to the list  
  (The name must match exactly)  
- You can check the list from the extension’s settings page  
- If you remove a name from the list, videos from that channel will be shown again (browser refresh required)  
- If the extension sometimes does not work, refreshing the browser usually fixes it

---

### Additional Features ✨

Features implemented based on “it would be nice to have” ideas.

<details>
<summary>Show details</summary>

- **Import and Export List**  
  - The export button outputs the list as a JSON file  
  - The import button completely replaces the list using a JSON file  
  - The official Channel Blocker sometimes loses the list, so regular backups are recommended (this extension has not shown this issue so far)  
- **Extension Toggle**  
  - Click the extension icon and press the red "Blocker:ON" button to switch to gray "Blocker:OFF," disabling the blocking feature  
  - No page refresh is needed to apply changes (though it might take a few seconds)  
- **"Remove Last" Button**  
  - This appears when clicking the extension icon  
  - Combined with the “Blocked: channel name” popup shown after pressing ×, this allows quick undo of mistakes  
  - Helps counter rare cases where wrong videos get added to the list on the homepage  
- **Video Title Filter**  
  - If you set a keyword, all video titles containing that keyword will be hidden  
  - Each keyword is limited to 30 characters  
  - This filter applies only to video titles (not channel names)  
  - You can also hide videos using AND conditions with up to three keywords (keyword sets)  
  - Up to 1000 keyword sets can be registered  
  - Example: If a keyword set contains "clip", "sashisuseso", and "GTA":  
    - "My <u>clip</u> video collection" → shown  
    - "<u>GTA clip</u> collection" → shown  
    - "<u>sashisuseso clip</u> collection" → shown  
    - "Funny <u>GTA</u> moments [<u>sashisuseso</u>/<u>clip</u>]" → hidden  
- **Error Message Popups**  
  - If clicking × would add a different channel by mistake, an error popup appears  
  - The message "Error: (ChannelA) ≠ (ChannelB)" is shown, and no addition occurs  
  - This is likely caused by layout glitches; refreshing the browser is recommended  
  - When a channel is successfully added, a "Blocked: channel name" popup confirms it  
- **Language Switching**  
  - Language can be switched from the settings page  
  - Supported: Japanese, English  
- **Edit Button for Lists**  
  - Each list can be renamed from the settings page  
  - To save changes, click the Save button. To cancel, click the Cancel button  

</details>

---

### Notes ⚠️

- The maximum theoretical number of blockable channels is about 34,000 🧮  
- Most issues can be fixed by refreshing the browser 🔧  
- Immediate hiding is difficult; thumbnails may briefly appear 🙈  
- Like the official version, the block list may disappear suddenly; regular backups are recommended 💾  
- Development is not active, but comments or pull requests might be addressed ✍️  

---

## License

This software is distributed under the [MIT License](LICENSE).  
For details, please see the included LICENSE file.

Super simplified:
- Use it freely at your own risk
- Don’t remove the author’s name or the license from the code
- No crying if it breaks or has bugs

## Disclaimer

This software is provided "as is", without any warranty of any kind.  
The author shall not be held liable for any damages or issues arising from the use of this software.  
All use is at the user's own risk.

## Planned Features (Not Implemented, and No Promises)

- Add × button to channel pages and video playback pages  
- Shorts videos are undesirable content (personal opinion) because they autoplay one after another and make volume control difficult, so a toggle has been added to switch their display on or off  
- Make installation easier by publishing in the Chrome Web Store

---

## Contact 📬
I’d be glad to hear your feedback—not just about bugs, but also whether everything worked smoothly after following the installation steps.  
Feel free to use Discussions or open an issue on this GitHub page.

📘 Blog (Go to article): [https://physx.hatenablog.com/entry/2025/07/13/174229](https://physx.hatenablog.com/entry/2025/07/13/174229)  
🐦 X (Twitter): [https://x.com/aki009113](https://x.com/aki009113)

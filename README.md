# YouTube Channel Blocker（v0.2.0）

不要なYouTubeチャンネルを非表示にするシンプルなChrome拡張です。  
A simple Chrome extension to block unwanted YouTube channels.

チャンネル名の非表示リストや動画タイトルフィルターを用いて、検索ページや関連動画、ホームから興味のない動画を非表示にできます。  
Hide videos you don’t want to see from search, recommendations, and the homepage with channel block lists and title filters.

📖 このREADMEには[日本語](#日本語) と [英語](#english) の説明が含まれています。  
📖 This README includes instructions in both [Japanese](#日本語) and [English](#english).

---

## 日本語

### インストール 🛠️

#### Gitを使わない場合 📦 
1. 「youtube-channel-blocker」フォルダを作成し、各ファイルのコピペを繰り返して、必要なコードやファイルをフォルダの中に入れます（動作にはgitignoreやREADME、LICENSEは不要です。） 

#### Gitを使う場合 📦 
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

最新版を取得（更新）🔄 

Gitを使って、新しいバージョンに更新したい場合は同じフォルダ内で次のコマンドを実行します（クローンしたフォルダに移動して、プル）：

  ```bash
  cd C:\Users\[PCのユーザー名]\Desktop\youtube-channel-blocker
  git pull
  ```

#### インストールの共通手順
1. アイコン用に適当なPNG形式の画像を2つ用意し、それぞれ名前を以下のように変更してフォルダ内に置きます：  
   - `icon48.png`  
   - `icon128.png`    
2. ブラウザのURLバーに `chrome://extensions/` と入力し、拡張機能ページを開きます  
3. 右上の「デベロッパーモード」を ON にします  
4. 左上の「パッケージ化されていない拡張機能を読み込む」をクリックし、「youtube-channel-blocker」フォルダを選択します  
5. これで拡張機能が読み込まれ、すぐに使用できます

---

### 使い方🔴

- 動画のチャンネル名の横にある赤い×ボタンを押します（チャンネルページや再生している動画からの非表示は未実装）  
- 非表示にならなかったら、ブラウザの更新やインストールのやり直し、画像やコードの不足がないかを確認してみてください  
- 自分で名前をリストに追加して、「保存」ボタンを押すことでも非表示にできます（※名前が完全一致していること）  
- リストは拡張機能のアイコンをクリックすると確認できます  
- リストから名前を消すと戻せます（ブラウザの更新が必要）  
- 動作しないときはページの更新で直るはずです

---

### 追加実装✨

個人的な「こんな機能あると良いなあ」で**実装済み**のやつを箇条書き

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
    - 「私の<u>切り抜き</u>動画集」→表示される  
    - 「<u>GTA切り抜き</u>集」→表示される  
    - 「<u>さしすせそ切り抜き</u>集」→表示される  
    - 「<u>GTA</u>面白い瞬間【<u>さしすせそ</u>/<u>切り抜き</u>】」→非表示になる
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

---

### 注意 ⚠️

- 理論上ブロックできる最大件数：約34,000件🧮（最大件数に近いまたはそれを超えてリストに追加したときの動作は不明）
- 大体の不具合はブラウザの更新で直ります（細かい不具合への対処は困難）🔧
- 処理の関係上、一瞬で非表示にするのは困難です（処理が遅い時はサムネが見えることも）🙈  
- 本家と同じく突然リストが消える可能性があるので、リストは定期的にバックアップを推奨します（現時点でその現象は確認出来てませんが）💾  
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
- ~~動画タイトルからキーワード非表示~~
- ~~×ボタンで非表示にしたチャンネル名を一時的にポップアップ（間違い防止。１つだけ戻すボタンも追加したい。）~~  
- ~~拡張機能の詳細設定を追加~~
- ×ボタンのUIやポップアップの改善
- ショート動画は勝手に再生されて音量調整も難しい好ましくないコンテンツ（個人の感想）なので、表示・非表示を切り替えるトグルを追加
- 詳細ページでリストの編集ボタンを追加
- 詳細ページにも言語ボタン追加
- インストール等がやりやすいようにストアにも出したい
---

## 連絡 📬
不具合以外にもインストール手順に従って問題なく動いたか等についてコメントいただけると嬉しいです。  
本GitHubのページではDiscussionやissueも開放しております。

📘 ブログ（記事に飛ぶ）: [https://physx.hatenablog.com/entry/2025/07/13/174229](https://physx.hatenablog.com/entry/2025/07/13/174229)  
🐦 X (Twitter): [https://x.com/aki009113](https://x.com/aki009113)

---


## English

### Installation 🛠️

If you do not use Git 📦 
1. Create a folder named youtube-channel-blocker and manually copy all necessary files into it (gitignore, README, LICENSE files are not required for operation).

If you use Git 📦 
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

#### Common installation steps
1. Prepare two PNG images for the icons, rename them as follows, and place them in the folder:  
   - `icon48.png`  
   - `icon128.png`  
2. Open your browser and navigate to `chrome://extensions/` in the URL bar.  
3. Enable "Developer mode" using the toggle at the top right.  
4. Click "Load unpacked" (top left) and select the `youtube-channel-blocker` folder.  
5. The extension will be loaded and ready to use immediately.

---

### How to use 🔴

- Press the red × button next to the channel name on video thumbnails (blocking from channel pages or currently playing videos is not yet implemented).  
- If videos from that channel disappear, the extension is working properly.  
- If videos are not hidden, try updating or reinstalling the extension and check for missing images or code.  
- You can also manually add channel names to the list and press the "Save" button to block them (the names must match exactly).  
- The list can be viewed by clicking the extension icon.  
- Removing names from the list will unblock them (a browser refresh is required).  
- If the extension doesn’t work, refreshing the page should fix it.
---

### Additional feature implementation ✨

Features personally implemented as “would be nice to have”:

- **Import and export the list** 
  - The export button outputs the list as a JSON file.  
  - The import button completely replaces the list using a JSON file.  
  - The official Channel Blocker sometimes loses the list, so regular backups are recommended (this extension has not shown this issue so far).  
- **Toggle to enable/disable the extension**  
  - Click the extension icon and press the red "Blocker:ON" button to switch to gray "Blocker:OFF," disabling the blocking feature.  
  - No page refresh is needed to apply changes (though it might take a few seconds).  
- **"Remove Last" button**  
  - This appears when clicking the extension icon.  
  - Combined with the “Blocked: channel name” popup shown after pressing ×, this allows quick undo of mistakes.  
  - Helps counter rare cases where wrong videos get added to the list on the homepage.

- **Video Title Filter**  
  - Each keyword is limited to 30 characters
  - This filter applies only to video titles and does not affect channel names (for example, if "clip" is a keyword, channels with names containing "clip" will still be shown).  
  - If only one keyword is used, all video titles containing that keyword will be hidden (e.g., if the keyword is "clip," all titles containing "clip" will be hidden).
  - Videos can be hidden based on AND conditions of three keywords (keyword sets).    
  - Up to 1000 keyword sets can be registered.  
  - For example, if a keyword set contains "clip," "sashisuseso," and "GTA":  
    - "My <u>clip</u> video collection" → displayed  
    - "<u>GTA clip</u> collection" → displayed  
    - "Funny <u>GTA</u> moments [<u>sashisuseso</u>/<u>clip</u>]" → hidden  
- **rror message popups**
    - If clicking × would add a different channel by mistake, an error popup appears.
    - The message "Error: (ChannelA) ≠ (ChannelB)" is shown, and no addition occurs.
    - This is likely caused by layout glitches; refreshing the browser is recommended.
    - When a channel is successfully added, a "Blocked: channel name" popup confirms it.
- **Language Switching**
  - Language can now be switched from the settings page.
- **Edit Button for Lists**
  - Each list can now be renamed from the settings page.
  - To save changes, click the Save button. To cancel, click the Cancel button.

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

**Super Simplified:**
- Use it freely at your own risk!
- Don’t remove the author’s name or the license from the code.
- No crying if it breaks or has bugs.

## Disclaimer

This software is provided "as is", without any warranty of any kind.  
The author shall not be held liable for any damages or issues arising from the use of this software.  
All use is at the user's own risk.

## Planned Features (Not Implemented, and No Promises)

- Add × button to channel pages and video playback pages  
- ~~Hide keywords from video titles~~
- ~~Temporarily show the blocked channel name in a popup after clicking × (to avoid mistakes; add an undo button for the last action)~~
- ~~Add advanced settings to the extension~~
- Improve the UI of the × button and popup
- Shorts videos are undesirable content (personal opinion) because they autoplay one after another and make volume control difficult, so a toggle has been added to switch their display on or off.
- Add block list editing buttons on detailed settings page.
- Add a language switch button to the details settings page.
- Make installation easier by publishing in the Chrome Web Store.

---

## Contact 📬
I’d be glad to hear your feedback—not just about bugs, but also whether everything worked smoothly after following the installation steps.  
 Feel free to use Discussions or open an issue on this GitHub page.

📘 Blog (Go to article): [https://physx.hatenablog.com/entry/2025/07/13/174229](https://physx.hatenablog.com/entry/2025/07/13/174229)  
🐦 X (Twitter): [https://x.com/aki009113](https://x.com/aki009113)

/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

// ============================================================
// i18n.js - 多言語対応（翻訳データ＆ヘルパー関数）
// ============================================================

/**
 * 全翻訳データ（キーごとに全言語をまとめる構造）
 * 新しいキー追加時に日英を同時に定義でき、追加漏れを防止できる。
 * 新言語の追加も各キーに1プロパティ足すだけで対応可能。
 *
 * popup.js / settings.js / content.js で共有
 */
const I18N = {

  // ─── 共通 ───
  add:        { ja: '追加',         en: 'Add' },
  remove:     { ja: '削除',         en: 'Remove' },
  edit:       { ja: '編集',         en: 'Edit' },
  save:       { ja: '保存',         en: 'Save' },
  cancel:     { ja: 'キャンセル',   en: 'Cancel' },
  search:     { ja: '検索...',      en: 'Search...' },
  exportBtn:  { ja: 'エクスポート', en: 'Export' },
  importBtn:  { ja: 'インポート',   en: 'Import' },

  // ─── content.js（ポップアップ通知） ───
  blockListLimitReached: { ja: 'リスト上限(10000)に達しました',   en: 'Block list limit (10000) reached' },
  blocked:               { ja: 'ブロック済み: ',                   en: 'Blocked: ' },

  // ─── popup.js ───
  popupTitle:  { ja: '非表示にするチャンネル名',             en: 'Blocked Channels' },
  removeLast:  { ja: '直近の1つを削除',                      en: 'Remove Last' },
  settings:    { ja: '設定',                                 en: 'Settings' },
  blockerOn:   { ja: 'Blocker: ON',                          en: 'Blocker: ON' },
  blockerOff:  { ja: 'Blocker: OFF',                         en: 'Blocker: OFF' },
  langSwitch:  { ja: '言語（Language）: 日本語',             en: 'Language(言語): English' },
  saved:       { ja: '保存しました',                         en: 'Saved' },
  saveFailed:  { ja: '保存に失敗しました',                   en: 'Failed to save' },
  listEmpty:   { ja: 'リストは空です',                       en: 'List is empty' },
  removedLast: { ja: '直近の1つを削除しました',              en: 'Removed last entry' },
  enabled:     { ja: '有効化しました',                       en: 'Enabled' },
  disabled:    { ja: '無効化しました',                       en: 'Disabled' },
  exportDone:  { ja: 'エクスポートしました',                 en: 'Exported' },
  importDone:  { ja: 'インポートしました',                   en: 'Imported' },
  importFail:  { ja: 'インポート失敗（ファイル形式エラー）', en: 'Import failed (file format error)' },
  langSwitched:{ ja: '言語を日本語に切り替えました',         en: 'Switched to English' },

  // ─── settings.js ステータスメッセージ ───
  noMatch:              { ja: '該当するチャンネルはありません。',                         en: 'No matching channels.' },
  noMatchKeywords:      { ja: '該当するキーワードセットはありません。',                   en: 'No matching keyword sets.' },
  noMatchComments:      { ja: '一致するユーザーはいません',                               en: 'No matching users' },
  noMatchChannelFilter: { ja: '該当するチャンネルフィルターセットはありません。',         en: 'No matching channel keyword sets.' },
  noMatchRegex:         { ja: '該当するパターンはありません。',                           en: 'No matching patterns.' },
  removed:              { ja: 'チャンネルをリストから削除しました',                       en: 'Channel removed from list' },
  removedKeyword:       { ja: 'キーワードセットをリストから削除しました',                 en: 'Keyword set removed from list' },
  removedComment:       { ja: 'ユーザーを削除しました',                                  en: 'User removed' },
  addedKeyword:         { ja: 'キーワードセットを追加しました',                           en: 'Keyword set added' },
  exportList:           { ja: 'チャンネルNGフィルターをエクスポートしました',             en: 'Exported channel block list' },
  exportKeywords:       { ja: '動画タイトルNGフィルターをエクスポートしました',           en: 'Exported title keyword NG list' },
  exportChannelKeywords:{ ja: 'チャンネルNGフィルターをエクスポートしました',             en: 'Exported channel filter set' },
  importList:           { ja: 'チャンネルNGフィルターをインポートしました',               en: 'Imported channel block list' },
  importKeywords:       { ja: '動画タイトルNGフィルターをインポートしました',             en: 'Imported title keyword NG list' },
  importChannelKeywords:{ ja: 'チャンネルNGフィルターをインポートしました',               en: 'Imported channel filter set' },
  importBlockedComments:{ ja: '非表示コメントユーザーリストをインポートしました',         en: 'Imported blocked comment users list' },
  exportBlockedComments:{ ja: '非表示コメントユーザーリストをエクスポートしました',       en: 'Exported blocked comment users list' },
  importError:          { ja: 'インポート失敗（ファイル形式エラー）',                     en: 'Import failed (invalid file format)' },
  keywordTooLong30:     { ja: 'キーワードは30文字以内で入力してください。',               en: 'Please enter keywords up to 30 characters.' },
  keywordTooLong10:     { ja: 'キーワードは10文字以内で入力してください。',               en: 'Please enter keywords up to 10 characters.' },
  channelAlreadyBlocked:{ ja: 'すでにリストに存在します',                                 en: 'Channel already in block list' },
  userAlreadyBlocked:   { ja: 'すでにリストに存在します',                                 en: 'User already blocked' },
  listLimitReached:     { ja: 'リスト上限に達しました',                                   en: 'Block list limit reached' },
  channelAdded:         { ja: 'リストに追加しました',                                     en: 'Channel added to block list' },
  commentUserAdded:     { ja: 'ユーザーをリストに追加しました',                           en: 'User added to block list' },
  channelEdited:        { ja: 'チャンネル名を編集しました',                               en: 'Channel name edited' },
  channelFilterEdited:  { ja: 'チャンネルフィルターセットを編集しました',                 en: 'Channel keyword set edited' },
  channelFilterRemoved: { ja: 'チャンネルフィルターセットを削除しました',                 en: 'Channel keyword set removed' },
  channelFilterAdded:   { ja: 'チャンネルフィルターセットを追加しました',                 en: 'Channel filter set added' },
  channelFilterLimit:   { ja: 'チャンネルフィルターセット上限(5000)に達しました',         en: 'Channel filter set limit (5000) reached' },
  keywordEdited:        { ja: 'キーワードセットを編集しました',                           en: 'Keyword set edited' },
  keywordLimit:         { ja: 'キーワード上限(5000)に達しました',                         en: 'Keyword limit (5000) reached' },
  commentUserEdited:    { ja: 'ユーザー名を編集しました',                                 en: 'User edited' },
  regexMaxLength:       { ja: '正規表現パターンは最大200文字までです。',                   en: 'Pattern must be max 200 characters.' },
  regexListLimit:       { ja: 'リストは最大1000個まで追加可能です。',                      en: 'List max is 1000 entries.' },
  importListLimit:      { ja: 'リスト上限(10000)に達しました。インポートできません。',    en: 'The list limit of 10,000 entries has been reached. Import cannot be completed.' },

  // ─── settings.js タブ名 ───
  tabBlockList:             { ja: '非表示チャンネルリスト',                            en: 'Block Channel List' },
  tabChannelFilter:         { ja: 'チャンネルNGフィルター',                            en: 'Channel Filter' },
  tabTitleFilter:           { ja: 'タイトルNGフィルター',                              en: 'Title Filter' },
  tabBlockedComments:       { ja: '非表示コメントユーザーリスト',                      en: 'Blocked Comment Users List' },
  tabAdvancedSettings:      { ja: '高度な設定',                                        en: 'Advanced Settings' },
  tabAdvancedSettingsTitle: { ja: 'チャンネル／タイトルNGフィルター（正規表現）',      en: 'Channel/Title Filter (Regex)' },
  tabImportExport:          { ja: 'エクスポート／インポート',                          en: 'Export/Import' },
  tabHideShorts:            { ja: '表示／非表示切替',                                  en: 'Show/Hide Toggle' },
  tabLanguage:              { ja: '言語（Language）',                                  en: 'Language' },
  tabDonation:              { ja: '💛 開発者を応援',                                   en: '💛 Support Developer' },
  tabHelp:                  { ja: 'サポート／使い方',                                  en: 'Support/Usage' },

  // ─── settings.js セクション見出し ───
  sectionBlockedChannelList: { ja: '非表示チャンネルリスト',       en: 'Blocked Channel List' },
  sectionChannelFilterList:  { ja: 'チャンネルNGフィルター',       en: 'Channel Filter List' },
  sectionTitleFilterList:    { ja: 'タイトルNGフィルター',         en: 'Title Filter List' },
  sectionBlockedCommentUsers:{ ja: '非表示コメントユーザーリスト', en: 'Blocked Comment Users List' },
  sectionExportImport:       { ja: 'エクスポート／インポート',     en: 'Export / Import' },
  sectionShowHideToggle:     { ja: '表示／非表示切替',             en: 'Show/Hide Toggle' },
  toggleGroupShorts:         { ja: 'ショート動画',                 en: 'Shorts' },
  toggleGroupWhitelist:      { ja: 'ホワイトリスト',               en: 'Whitelist' },
  toggleGroupUI:             { ja: 'UI表示',                       en: 'UI Display' },
  sectionLanguageSetting:    { ja: '表示言語',                     en: 'Language Setting' },
  sectionHelp:               { ja: 'サポート／使い方',             en: 'Support / Usage' },

  // ─── settings.js プレースホルダー ───
  channelName:  { ja: 'チャンネル名',       en: 'Channel Name' },
  keyword1:     { ja: 'キーワード1',        en: 'Keyword 1' },
  keyword2:     { ja: 'キーワード2',        en: 'Keyword 2' },
  keyword3:     { ja: 'キーワード3',        en: 'Keyword 3' },
  username:     { ja: 'ユーザー名',         en: 'Username' },
  regexPattern: { ja: '正規表現パターン',   en: 'Regex Pattern' },

  // ─── settings.js 高度な設定サブタブ ───
  channelRegexTab: { ja: 'チャンネルNGフィルター（正規表現）', en: 'Channel Filter (Regex)' },
  titleRegexTab:   { ja: 'タイトルNGフィルター（正規表現）',   en: 'Title Filter (Regex)' },

  // ─── settings.js その他 ───
  backupRecommendation: { ja: '💡 定期的なバックアップを推奨します。',             en: '💡 We recommend backing up your data regularly.' },
  languagePrompt:       { ja: 'UIに使用する言語を選択してください：',               en: 'Choose the language to use for the UI:' },

  // ─── settings.js インポート/エクスポート セクション見出し ───
  ieBlockList:     { ja: '非表示チャンネルリスト',       en: 'Block Channel List' },
  ieChannelFilter: { ja: 'チャンネルNGフィルター',       en: 'Channel Filter List' },
  ieTitleFilter:   { ja: 'タイトルNGフィルター',         en: 'Title Filter List' },
  ieCommentList:   { ja: '非表示コメントユーザーリスト', en: 'Blocked Comment User List' },

  // ─── settings.js ショート動画トグル ───
  shortsFilterOn:     { ja: 'ショート動画：非表示',                   en: 'Shorts: Hidden' },
  shortsFilterOff:    { ja: 'ショート動画：表示',                     en: 'Shorts: Shown' },
  hideShortsEnabled:  { ja: 'ショート動画を非表示にしました',         en: 'Shorts now hidden' },
  hideShortsDisabled: { ja: 'ショート動画を表示します',               en: 'Shorts now shown' },

  // ─── ホワイトリストショート動画トグル ───
  whitelistHideShortsOn:       { ja: 'ホワイトリストのショート動画：非表示',             en: 'Whitelist Shorts: Hidden' },
  whitelistHideShortsOff:      { ja: 'ホワイトリストのショート動画：表示',               en: 'Whitelist Shorts: Shown' },
  whitelistHideShortsEnabled:  { ja: 'ホワイトリストのショート動画を非表示にしました', en: 'Whitelist Shorts now hidden' },
  whitelistHideShortsDisabled: { ja: 'ホワイトリストのショート動画を表示します',       en: 'Whitelist Shorts now shown' },

  // ─── ブロックポップアップ／×ボタントグル ───
  showBlockPopupOn:       { ja: 'ブロックポップアップ：表示',           en: 'Block Popup: Shown' },
  showBlockPopupOff:      { ja: 'ブロックポップアップ：非表示',         en: 'Block Popup: Hidden' },
  showBlockPopupEnabled:  { ja: 'ブロックポップアップを表示します',     en: 'Block popup enabled' },
  showBlockPopupDisabled: { ja: 'ブロックポップアップを非表示にしました', en: 'Block popup disabled' },
  showCloseButtonOn:      { ja: '×ボタン：表示',                       en: '× Button: Shown' },
  showCloseButtonOff:     { ja: '×ボタン：非表示',                     en: '× Button: Hidden' },
  showCloseButtonEnabled:  { ja: '×ボタンを表示します',                en: '× button enabled' },
  showCloseButtonDisabled: { ja: '×ボタンを非表示にしました',          en: '× button disabled' },

  // ─── ホワイトリスト ───
  tabWhitelist:            { ja: 'ホワイトリスト',                                         en: 'Whitelist' },
  sectionWhitelist:        { ja: 'ホワイトリスト',                                         en: 'Whitelist' },
  noMatchWhitelist:        { ja: '該当するチャンネルはありません。',                       en: 'No matching channels.' },
  whitelistAdded:          { ja: 'ホワイトリストに追加しました',                           en: 'Added to whitelist' },
  whitelistRemoved:        { ja: 'ホワイトリストから削除しました',                         en: 'Removed from whitelist' },
  whitelistEdited:         { ja: 'ホワイトリストのチャンネル名を編集しました',             en: 'Whitelist channel name edited' },
  whitelistAlreadyExists:  { ja: 'すでにホワイトリストに存在します',                       en: 'Already in whitelist' },
  whitelistLimitReached:   { ja: 'ホワイトリスト上限に達しました',                         en: 'Whitelist limit reached' },
  whitelistBypassAllOn:    { ja: 'ホワイトリスト：表示',                               en: 'Whitelist: ON' },
  whitelistBypassAllOff:   { ja: 'ホワイトリスト：非表示',                             en: 'Whitelist: OFF' },
  whitelistBypassEnabled:  { ja: 'ホワイトリストを有効にしました',                     en: 'Whitelist enabled' },
  whitelistBypassDisabled: { ja: 'ホワイトリストを無効にしました',                     en: 'Whitelist disabled' },
  exportWhitelist:         { ja: 'ホワイトリストをエクスポートしました',                   en: 'Exported whitelist' },
  importWhitelist:         { ja: 'ホワイトリストをインポートしました',                     en: 'Imported whitelist' },
  ieWhitelist:             { ja: 'ホワイトリスト',                                         en: 'Whitelist' },
  accordionWhitelist:      { ja: 'ホワイトリスト',                                         en: 'Whitelist' },
  helpWhitelist1:          { ja: 'ホワイトリストに登録したチャンネルには×（ブロック）ボタンが表示されません。',
                             en: 'Channels registered in the whitelist will not show the × (block) button.' },
  helpWhitelist2:          { ja: '「表示／非表示切替」ページで「ホワイトリスト：表示」にすると、ホワイトリストのチャンネルにはキーワードフィルターや正規表現フィルターも適用されず、×ボタンも表示されません。',
                             en: 'If "Whitelist: ON" is set in the Show/Hide Toggle page, whitelisted channels will bypass all filters and the × button will not be shown.' },
  helpWhitelist3:          { ja: '「ホワイトリスト：非表示」の場合、ホワイトリストは無効となり、通常のチャンネルと同じ扱いになります。',
                             en: 'If "Whitelist: OFF", the whitelist is disabled and channels are treated normally.' },

  // ─── ヘルプセクション ───
  helpIntro:      { ja: '各機能の概要と使い方の説明です。不具合の報告や要望、質問等はGitHubのissuesにお願いします。',
                    en: 'This section provides an overview of each feature and how to use it. Click on the title to expand the details.' },
  helpDisclaimer: { ja: 'なお、全要望の実装や即時対応が難しいことはご了承ください。',
                    en: 'Please understand that we may not be able to respond right away.' },

  accordionBlockList:       { ja: '非表示チャンネルリスト',             en: 'Blocked Channel List' },
  accordionChannelFilter:   { ja: 'チャンネルNGフィルター',             en: 'Channel Filter' },
  accordionTitleFilter:     { ja: 'タイトルNGフィルター',               en: 'Title Filter' },
  accordionBlockedComments: { ja: '非表示コメントユーザーリスト',       en: 'Blocked Comment User List' },
  accordionExportImport:    { ja: 'エクスポート／インポート',           en: 'Export/Import' },
  accordionShowHide:        { ja: '表示/非表示切替',                    en: 'Show/Hide Toggle' },
  accordionConvertCB:       { ja: 'Channel Blockerのリストを変換',      en: 'Convert Channel Blocker List' },
  accordionRegex:           { ja: '正規表現フィルター',                 en: 'Regex Filter' },

  commonListDescription: { ja: 'リストは「編集」ボタンで名前の編集が、「削除」ボタンでリストからの削除が可能です。',
                           en: 'You can edit the name with the "Edit" button and remove it from the list with the "Delete" button.' },

  helpBlockChannel1: { ja: '特定のチャンネルをリストに登録すると、そのチャンネルの動画を非表示にできます。',
                       en: 'By registering specific channels in the blocked channel list, you can hide their videos.' },
  helpBlockChannel2: { ja: '登録方法は３通り',
                       en: 'There are three ways to add channels' },
  helpBlockChannel3: { ja: '・チャンネル名横の×ボタンを押す',
                       en: '- Click the × button next to the channel name.' },
  helpBlockChannel4: { ja: '・拡張機能アイコンをクリックし、ポップアップ内のリストに追加する',
                       en: '- Click the extension icon and add it to the list in the popup.' },
  helpBlockChannel5: { ja: '・「チャンネル名」の欄に非表示にしたいチャンネル名を入力して「追加」ボタンを押す',
                       en: '- Enter the channel name in the "Channel Name" field below and click the "Add" button.' },

  helpChannelFilter1: { ja: 'チャンネル名にキーワードが含まれている場合、そのチャンネルを非表示にします。',
                        en: 'If the channel name contains specific keywords, that channel will be automatically hidden.' },
  helpChannelFilter2: { ja: '1つのキーワードセットに最大3つのキーワードを設定できます。特に条件がない場合はキーワードを1つだけ設定してください。',
                        en: 'You can set up to three keywords per keyword set. If there are no special conditions, please set only one keyword.' },
  helpChannelFilter3: { ja: 'キーワードセットは最大5000個、各キーワードは最大10文字です。',
                        en: 'Keyword sets are limited to 5000 sets and 10 characters each.' },

  helpTitleFilter1: { ja: '動画タイトルに特定のキーワードが含まれている場合、その動画を自動的に非表示にします。',
                      en: 'If the video title contains specific keywords, the video will be automatically hidden.' },
  helpTitleFilter2: { ja: '1つのキーワードセットに最大3つのキーワードを設定できます。特に条件がない場合はキーワードを1つだけ設定してください。',
                      en: 'You can set up to three keywords per keyword set. If there are no special conditions, please set only one keyword.' },
  helpTitleFilter3: { ja: 'キーワードセットは最大5000個、各キーワードは最大30文字です。',
                      en: 'Keyword sets are limited to 5000 sets and 30 characters each.' },
  helpTitleFilter4: { ja: '例：',
                      en: 'For example:' },
  helpTitleFilter5: { ja: '「切り抜き」だけ非表示にしたい→「切り抜き」を登録',
                      en: 'Want to hide only "clips" → Set "clips"' },
  helpTitleFilter6: { ja: '「切り抜き」と「YouTuber」の両方を含む動画を非表示にしたい→「切り抜き」と「YouTuber」を登録',
                      en: 'Want to see "clips" but hide videos that contain both "clips" and "YouTuber" → Set "clips" and "YouTuber"' },

  helpComment1: { ja: '@から始まるID名をリストに登録すると、そのチャンネルのコメントを非表示にできます。',
                  en: 'By registering ID starting with @ in the list, you can hide comments from that channel.' },
  helpComment2: { ja: 'リストへの登録方法は2通り',
                  en: 'There are two ways to add users to the list:' },
  helpComment3: { ja: '・コメントでID横の×ボタンを押す',
                  en: '- Click the × button next to the ID in the comments.' },
  helpComment4: { ja: '・「ユーザー名」の欄に@つきでIDを入力して「追加」ボタンを押す',
                  en: '- Enter the ID starting with @ in the "Username" field below and click the "Add" button.' },

  helpRegex1: { ja: '正規表現（リテラル記法）を使ってチャンネル名や動画タイトルをフィルタリングします。',
                en: 'Use regular expressions (literal notation) to filter channel names and video titles.' },
  helpRegex2: { ja: '正規表現の例：',
                en: 'Examples of regular expressions:' },
  helpRegexEx1: { ja: '英語の文字を含む場合に非表示',
                  en: 'Block if the text contains any English letters' },
  helpRegexEx2: { ja: '空白を含む英語のみで構成されている場合に非表示',
                  en: 'Block if the text consists only of English letters and spaces' },
  helpRegexEx3: { ja: '"keyword" を含む場合に非表示',
                  en: 'Block if the text contains the word "keyword"' },
  helpRegexEx4: { ja: '"雑学" を含む場合に非表示（ただし "ゆっくり" も含む場合は除外）',
                  en: 'Block if the text contains "雑学" but not if it also contains "ゆっくり"' },
  helpRegexEx5: { ja: '"PR"、"広告"、"提供" のいずれかを含む場合に非表示',
                  en: 'Block if the text contains any of "PR", "広告", or "提供"' },
  helpRegexEx6: { ja: '連続する記号を含む場合に非表示',
                  en: 'Block if the text contains consecutive symbols' },

  helpExportImport1: { ja: 'エクスポート／インポート機能を使うことで、非表示リストやキーワードを保存・復元できます。',
                       en: 'By using the export/import feature, you can save and restore your blocked lists and keywords.' },
  helpExportImport2: { ja: '「エクスポート」ボタンを押すと、現在の設定をファイルに保存できます。',
                       en: 'Please note that importing will overwrite the existing data.' },
  helpExportImport3: { ja: '「インポート」ボタンを押すと、保存したファイルを読み込んで設定を復元できます。（インポートは既存のデータを上書きしますのでご注意ください）',
                       en: 'We recommend backing up your data regularly.' },
  helpExportImport4: { ja: '💡 定期的なバックアップを推奨します。',
                       en: '💡 We recommend backing up your data regularly.' },

  helpShowHide1: { ja: '「ショート動画：非表示」にすると、ショート動画がすべて非表示になります（ボタンがカラー表示）。',
                   en: 'Setting "Shorts: Hidden" will hide all Shorts videos (button will be colored).' },
  helpShowHide2: { ja: '「ショート動画：表示」にすると、ショート動画が再び表示されます（ボタンがグレー表示）。',
                   en: 'Setting "Shorts: Shown" will show Shorts videos again (button will be grayed out).' },
  helpShowHide3: { ja: '今後、プレイリスト等についても同様の機能を追加予定です。',
                   en: 'I plan to add similar functionality for playlists and other features in the future.' },

  helpCBImport1: { ja: 'Channel BlockerのリストをYouTube Channel Blockerのリストに変換するHTMLはこちらから利用できます',
                   en: 'HTML to convert Channel Blocker lists to YouTube Channel Blocker lists is available here' },

  // ─── 寄付セクション ───
  donationTitle:  { ja: '🎁 寄付で開発者を応援',
                    en: '🎁 Support the Developer with a Donation' },
  donationMsg1:   { ja: 'このページを見ていただきありがとうございます！',
                    en: 'Thank you for visiting this page!' },
  donationMsg2:   { ja: 'この拡張機能が役に立ったと感じたら、寄付をご検討いただければ幸いです！',
                    en: 'If you find this extension useful, please consider making a donation.' },
  donationMsg3:   { ja: 'Ko-fiは登録不要で匿名かつクレジットカードからの寄付が可能です。',
                    en: 'Ko-fi allows anonymous donations without registration using a credit card (PayPal requires registration).' },
  paypalButton:   { ja: 'PayPalで寄付',
                    en: 'Donate with PayPal' },
  kofiButton:     { ja: 'Ko-fiで寄付',
                    en: 'Donate with Ko-fi' },
  promotionTitle: { ja: '📢 宣伝で開発者を応援（寄付が難しい方へ）',
                    en: '📢 Support the Developer by Spreading the Word' },
  donationMsg4:   { ja: '寄付が難しい場合でも、SNSでの拡散やアカウントのフォローなどで応援していただけます！',
                    en: 'If donating is difficult, you can still support by sharing on social media or following the account!' },
  donationMsg6:   { ja: 'ふとした時に、記事の閲覧やいいね等で応援していただけるとありがたいです！',
                    en: "If you have a moment, we'd really appreciate your support by reading our articles or giving them a like!" },
  donationTwitter:{ ja: 'X (Twitter)：<a href="https://x.com/aki009113" target="_blank">フォローはこちらから</a>',
                    en: 'X (Twitter): <a href="https://x.com/aki009113" target="_blank">Follow here</a>' },
  donationBlog:   { ja: 'Blog：<a href="https://physx.hatenablog.com/entry/2025/07/28/170000" target="_blank">記事を見る</a>',
                    en: 'Blog: <a href="https://physx.hatenablog.com/entry/2025/07/28/170000" target="_blank">Read the article</a>' },
  donationGithub: { ja: 'GitHub：<a href="https://github.com/bsadd-jpan/youtube-channel-blocker" target="_blank">リポジトリを見る</a>',
                    en: 'GitHub: <a href="https://github.com/bsadd-jpan/youtube-channel-blocker" target="_blank">View Repository</a>' },
  donationMsg7:   { ja: '下のツイートボタンからシェアもできます！',
                    en: 'You can also share using the Tweet button below!' },
};

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 現在の言語設定を chrome.storage から取得
 * @param {Function} callback - (lang: 'ja'|'en') => void
 */
function getCurrentLang(callback) {
  chrome.storage.local.get('language', (result) => {
    callback(result.language === 'en' ? 'en' : 'ja');
  });
}

/**
 * 翻訳テキストを取得
 * @param {string} key - I18N のキー名
 * @param {string} lang - 'ja' or 'en'
 * @returns {string}
 */
function t(key, lang) {
  const entry = I18N[key];
  if (!entry) return key;
  return entry[lang] || entry.ja || key;
}

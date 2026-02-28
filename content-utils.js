/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

// ============================================================
// content-utils.js - content.js 用ユーティリティ関数
//
// ポップアップ通知、ボタン生成、ブロック判定、
// 要素非表示、コメントブロック、汎用アイテム処理、
// ショートフラグ、正規表現パースの各機能を提供
// ============================================================

// ============================================================
// グローバル変数
// ============================================================

/** ホバー中のチャンネル名を保持 */
let hoveredChannelName = null;

// ============================================================
// ポップアップ通知
// ============================================================

/**
 * ポップアップ表示用要素を作成（1回だけ）
 */
function createPopup() {
  const popup = document.createElement("div");
  popup.id = "block-popup";
  popup.style.position = "fixed";
  popup.style.backgroundColor = "rgba(0,0,0,0.8)";
  popup.style.color = "white";
  popup.style.padding = "10px 10px";
  popup.style.borderRadius = "10px";
  popup.style.fontSize = "18px";
  popup.style.pointerEvents = "none";
  popup.style.zIndex = 9999;
  popup.style.transition = "opacity 0.3s ease";
  popup.style.opacity = "0";
  document.body.appendChild(popup);
  return popup;
}

const popup = createPopup();
let popupTimeout = null;

/**
 * 汎用ポップアップ表示
 * @param {MouseEvent} event - マウスイベント（位置取得用）
 * @param {string} message - 表示する文字列
 * @param {number} duration - 表示時間（ms, デフォルト5000）
 */
function showPopupMessage(event, message, duration = 5000) {
  popup.textContent = message;
  popup.style.left = `${event.clientX + 15}px`;
  popup.style.top = `${event.clientY + 15}px`;
  popup.style.opacity = "1";

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    popup.style.opacity = "0";
  }, duration);
}

// ============================================================
// ボタン生成
// ============================================================

/**
 * チャンネルブロックボタンを生成
 * @param {string} channelName
 * @param {Function} onBlock - ブロック後の再実行コールバック
 * @returns {HTMLButtonElement}
 */
function createChannelBlockButton(channelName, onBlock) {
  const btn = document.createElement("button");
  btn.textContent = "×";
  btn.className = "block-btn";

  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();

    const targetName = hoveredChannelName || channelName;

    chrome.storage.local.get([STORAGE_KEYS.BLOCKED_CHANNELS], (result) => {
      const updatedList = result[STORAGE_KEYS.BLOCKED_CHANNELS] || [];
      if (updatedList.includes(targetName)) return;
      if (updatedList.length >= LIMITS.BLOCK_LIST) {
        getCurrentLang((lang) => {
          showPopupMessage(event, t('blockListLimitReached', lang));
        });
        return;
      }
      updatedList.push(targetName);
      chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_CHANNELS]: updatedList }, () => {
        console.log(`Blocked: ${targetName}`);
        onBlock();
        getCurrentLang((lang) => {
          showPopupMessage(event, t('blocked', lang) + targetName);
        });
      });
    });
  });
  return btn;
}

/**
 * コメント用のブロックボタンを作成
 * @param {string} commentText
 * @returns {HTMLButtonElement}
 */
function createBlockCommentButton(commentText) {
  const btn = document.createElement("button");
  btn.textContent = "×";
  btn.className = "ycb-block-comment-btn";

  btn.addEventListener("click", (event) => {
    chrome.storage.local.get({ [STORAGE_KEYS.BLOCKED_COMMENTS]: [] }, (result) => {
      const list = result[STORAGE_KEYS.BLOCKED_COMMENTS];
      if (!list.includes(commentText)) {
        list.push(commentText);
        if (list.length >= LIMITS.COMMENT_LIST) {
          getCurrentLang((lang) => {
            showPopupMessage(event, t('listLimitReached', lang));
          });
          return;
        }
        chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_COMMENTS]: list }, () => {
          runBlocker();
        });
      }
    });
  });

  return btn;
}

// ============================================================
// ブロック判定ロジック
// ============================================================

/**
 * テキストがいずれかのキーワードセットのAND条件にマッチするか判定
 *
 * 各キーワードセット内のすべてのキーワードを含む場合に true を返す。
 * チャンネル名・動画タイトルどちらの判定にも使用可能。
 *
 * @param {string} text - 判定対象のテキスト
 * @param {string[][]} keywordSets - キーワードセットの配列
 * @returns {boolean}
 */
function matchesKeywordSets(text, keywordSets) {
  const lowerText = text.toLowerCase();
  for (const keywords of keywordSets) {
    if (keywords.length === 0) continue;
    if (keywords.every((kw) => lowerText.includes(kw.toLowerCase()))) return true;
  }
  return false;
}

// ============================================================
// 要素非表示ヘルパー
// ============================================================

/**
 * アイテムまたはその親を非表示にする
 */
function hideItemOrParent(item, blockParentSelectors) {
  if (blockParentSelectors == null) return;
  const parent = item.closest(blockParentSelectors);
  if (parent) {
    parent.style.display = "none";
  } else {
    item.style.display = "none";
  }
}

/**
 * 指定した子要素セレクタを持つ要素を探し、その親要素を非表示にする
 * @param {string} childSelector
 * @param {string} parentSelector
 */
function hideParentByChildSelector(childSelector, parentSelector) {
  document.querySelectorAll(childSelector).forEach((childElem) => {
    const parent = childElem.closest(parentSelector);
    if (parent) parent.style.display = "none";
  });
}

// ============================================================
// コメントユーザーブロック
// ============================================================

/**
 * コメントを投稿ユーザー単位でブロック
 *
 * @param {Element} item - 対象DOM要素
 * @param {Object} options - 処理オプション
 * @param {string[]}   options.blockedComments          - ブロック済みコメントユーザー
 * @param {string}     options.userSelector              - ユーザー名要素のセレクタ
 * @param {string|null} options.buttonContainerSelector  - ボタン挿入先セレクタ
 * @param {string|null} options.parentSelector           - 非表示対象の親要素セレクタ
 * @param {Function}   options.onBlock                   - ブロック後の再実行コールバック
 */
function processCommentUserBlock(item, options) {
  const {
    blockedComments = [],
    userSelector,
    buttonContainerSelector = null,
    parentSelector = null,
    onBlock,
  } = options;

  const userElem = item.querySelector(userSelector);
  if (!userElem) return;

  const userName = userElem.textContent?.trim();
  if (!userName) return;

  const parent = parentSelector ? item.closest(parentSelector) : item;

  // ブロックユーザーなら即非表示
  if (blockedComments.includes(userName)) {
    if (parent) parent.style.display = "none";
  }

  // ブロックボタン追加（ユーザー名の左側）
  if (buttonContainerSelector) {
    const container = item.querySelector(buttonContainerSelector);
    if (container && !container.querySelector(".block-user-btn")) {
      const btn = document.createElement("button");
      btn.textContent = "×";
      btn.className = "block-user-btn";

      container.insertBefore(btn, userElem);

      btn.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();

        chrome.storage.local.get({ [STORAGE_KEYS.BLOCKED_COMMENTS]: [] }, (data) => {
          const updated = data[STORAGE_KEYS.BLOCKED_COMMENTS] || [];
          if (!updated.includes(userName)) {
            updated.push(userName);
            chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_COMMENTS]: updated }, () => {
              if (parent) parent.style.display = "none";
              onBlock();
              getCurrentLang((lang) => {
                showPopupMessage(event, t('blocked', lang) + userName);
              });
            });
          } else {
            if (parent) parent.style.display = "none";
          }
        });
      };
    }
  }
}

// ============================================================
// 動画アイテム処理
// ============================================================

/** 動画タイトル要素のセレクタ（YouTube DOM 固有） */
const VIDEO_TITLE_SELECTOR = [
  "#video-title",
  "h3 a",
  "#title",
  "yt-formatted-string#description-text",
  "ytd-video-renderer #video-title",
  "yt-formatted-string#video-title",
].join(", ");

/**
 * 動画アイテムにブロックボタンを追加し、各フィルターで非表示判定を行う
 *
 * @param {Element} item - 対象DOM要素
 * @param {Object} options - 処理オプション
 * @param {string[]}   options.blockedChannels      - ブロックリスト
 * @param {string}     options.channelSelector      - チャンネル名要素のセレクタ
 * @param {string|null} options.insertBeforeSelector - ×ボタンの挿入位置セレクタ
 * @param {string|null} options.parentSelectors      - 非表示対象の親要素セレクタ
 * @param {Function}   options.onBlock               - ブロック後の再実行コールバック
 * @param {string[][]} options.channelKeywords       - チャンネルNGキーワードセット
 * @param {string[][]} options.titleKeywords         - タイトルNGキーワードセット
 * @param {RegExp[]}   options.channelRegexList      - チャンネル名正規表現リスト
 * @param {RegExp[]}   options.titleRegexList        - タイトル正規表現リスト
 * @param {string[]}   options.whitelistedChannels   - ホワイトリスト
 * @param {boolean}    options.whitelistBypassAll    - ホワイトリスト全フィルターバイパスフラグ
 */
function processVideoItem(item, options) {
  const {
    blockedChannels = [],
    channelSelector,
    insertBeforeSelector = null,
    parentSelectors = null,
    onBlock,
    channelKeywords = [],
    titleKeywords = [],
    channelRegexList = [],
    titleRegexList = [],
    whitelistedChannels = [],
    whitelistBypassAll = false,
  } = options;

  // プレイリスト特有のタグがあれば処理スキップ
  if (item.querySelector("yt-collection-thumbnail-view-model")) return;

  const channelNameElem = item.querySelector(channelSelector);
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();
  if (!channelName) return;

  // ホワイトリスト判定
  const isWhitelisted = whitelistedChannels.includes(channelName);

  // ×ボタン処理
  if (isWhitelisted) {
    // ホワイトリスト登録チャンネル：既存の×ボタンがあれば全て削除
    item.querySelectorAll('.block-btn').forEach(btn => btn.remove());
  } else {
    // 未登録チャンネル：×ボタンを挿入
    const insertTarget = insertBeforeSelector
      ? item.querySelector(insertBeforeSelector)
      : null;
    const prevElem = insertTarget
      ? insertTarget.previousElementSibling
      : channelNameElem.previousElementSibling;
    if (!prevElem || !prevElem.classList?.contains("block-btn")) {
      const btn = createChannelBlockButton(channelName, onBlock);
      if (insertTarget) {
        insertTarget.parentElement.insertBefore(btn, insertTarget);
      } else if (channelNameElem.parentElement) {
        channelNameElem.parentElement.insertBefore(btn, channelNameElem);
      }
    }
  }

  // マウスがitem（親要素）に入ったらチャンネル名を保存
  item.addEventListener("mouseenter", () => {
    hoveredChannelName = channelName;
  });

  // ホワイトリスト登録チャンネルのフィルター分岐
  if (isWhitelisted) {
    // 非表示になっていた場合は復元
    item.style.display = "";
    if (parentSelectors) {
      const parent = item.closest(parentSelectors);
      if (parent) parent.style.display = "";
    }
    // whitelistBypassAll=trueなら全フィルターをスキップ
    if (whitelistBypassAll) {
      return;
    }
    // whitelistBypassAll=falseならタイトルNGフィルターのみ適用（他はスキップ）
    const titleElem = item.querySelector(VIDEO_TITLE_SELECTOR);
    if (!titleElem) return;
    const titleText = titleElem.textContent || "";
    if (matchesKeywordSets(titleText, titleKeywords)) {
      hideItemOrParent(item, parentSelectors);
      return;
    }
    if (titleRegexList.some((regex) => regex.test(titleText))) {
      hideItemOrParent(item, parentSelectors);
      return;
    }
    // それ以外は表示
    return;
  }

  // ブロックリストによる非表示
  if (blockedChannels.includes(channelName)) {
    if (parentSelectors == null) return;
    hideItemOrParent(item, parentSelectors);
    return;
  }

  // チャンネル名キーワードセットによるブロック判定（AND条件）
  if (matchesKeywordSets(channelName, channelKeywords)) {
    hideItemOrParent(item, parentSelectors);
    return;
  }

  // チャンネル名正規表現によるブロック判定
  if (channelRegexList.some((regex) => regex.test(channelName))) {
    if (parentSelectors == null) return;
    hideItemOrParent(item, parentSelectors);
    return;
  }

  // 動画タイトルの取得
  const titleElem = item.querySelector(VIDEO_TITLE_SELECTOR);
  if (!titleElem) return;

  const titleText = titleElem.textContent || "";

  // 動画タイトルキーワードANDブロック判定
  if (matchesKeywordSets(titleText, titleKeywords)) {
    hideItemOrParent(item, parentSelectors);
  }

  // タイトル正規表現によるブロック判定
  if (titleRegexList.some((regex) => regex.test(titleText))) {
    hideItemOrParent(item, parentSelectors);
  }
}

// ============================================================
// ショート動画フラグ
// ============================================================

/**
 * hideShortsFlagの状態をストレージから取得して反映する
 * @param {Function} callback
 */
function loadHideShortsFlag(callback) {
  chrome.storage.local.get([STORAGE_KEYS.HIDE_SHORTS_FLAG], (result) => {
    hideShortsFlag = !!result[STORAGE_KEYS.HIDE_SHORTS_FLAG];
    if (callback) callback();
  });
}

/**
 * hideShortsFlagの状態を切り替えてストレージに保存し、runBlockerを再実行
 */
function toggleHideShortsFlag() {
  hideShortsFlag = !hideShortsFlag;
  chrome.storage.local.set({ [STORAGE_KEYS.HIDE_SHORTS_FLAG]: hideShortsFlag }, () => {
    console.log(`hideShortsFlag is now ${hideShortsFlag}`);
    runBlocker();
  });
}

// ============================================================
// 正規表現パース
// ============================================================

/**
 * background 経由で正規表現リストを取得
 */
function getRegexListFromBackground(type) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getRegexList', type }, (res) => {
      if (!res || res.ok === false) {
        resolve([]);
      } else {
        resolve(res.list || []);
      }
    });
  });
}

/**
 * ユーザー入力の正規表現文字列を RegExp に変換
 * /pattern/flags の形式を前提
 * @param {string} input
 * @returns {RegExp|null}
 */
function parseUserRegex(input) {
  if (!input) return null;
  const m = input.match(/^\/(.+)\/([a-z]*)$/i);
  if (!m) return null;

  let [, pattern, flags] = m;
  if (!flags.includes('u')) flags += 'u';
  try {
    return new RegExp(pattern, flags);
  } catch (e) {
    return null;
  }
}

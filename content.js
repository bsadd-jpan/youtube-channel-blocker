/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

const DEBOUNCE_DELAY = 300;
let debounceTimer = null;

let hoveredChannelName = null; // マウスオーバーで保存するチャンネル名

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
 * ポップアップを表示
 * @param {MouseEvent} event
 * @param {string} channelName
 */
function showPopup(event, channelName) {
  popup.textContent = `Blocked: ${channelName}`;
  const x = event.clientX + 15;
  const y = event.clientY + 15;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.opacity = "1";

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    popup.style.opacity = "0";
  }, 5000);
}

/**
 * エラーポップアップを表示
 * @param {MouseEvent} event
 * @param {string} message
 */
function showErrorPopup(event, message) {
  popup.textContent = message;
  const x = event.clientX + 15;
  const y = event.clientY + 15;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.opacity = "1";

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    popup.style.opacity = "0";
  }, 5000);
}

/**
 * チャンネルブロックボタンを生成
 * @param {string} channelName
 * @param {Function} runBlocker
 * @returns {HTMLButtonElement}
 */
function createBlockButton(channelName, runBlocker) {
  const btn = document.createElement("button");
  btn.textContent = "×";
  btn.className = "block-btn";
  btn.style.color = "red";
  btn.style.border = "none";
  btn.style.background = "transparent";
  btn.style.cursor = "pointer";
  btn.style.marginRight = "4px";
  btn.style.fontSize = "16px";
  btn.addEventListener("click", (event) => {
    event.stopPropagation();
    event.preventDefault();

    // 保存しているマウスオーバー名とクリックしたチャンネル名が一致するかチェック
    if (hoveredChannelName !== channelName) {
      showErrorPopup(event, `Error: ${hoveredChannelName} ≠ ${channelName}`);
      return;
    }

    chrome.storage.local.get(["blockedChannels"], (result) => {
      const updatedList = result.blockedChannels || [];
      if (updatedList.includes(channelName)) {
        return;
      }
      if (updatedList.length >= 10000) {
        showErrorPopup(event, "Error: Block list limit (10000) reached");
        return;
      }
      updatedList.push(channelName);
      chrome.storage.local.set({ blockedChannels: updatedList }, () => {
        console.log(`Blocked: ${channelName}`);
        runBlocker();

        showPopup(event, channelName);
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
  btn.style.cssText = `
    margin-left: 8px;
    cursor: pointer;
    color: red;
    font-weight: bold;
    background: transparent;
    border: none;
  `;

  btn.addEventListener("click", () => {
    chrome.storage.local.get({ blockedComments: [] }, (result) => {
      const list = result.blockedComments;
      if (!list.includes(commentText)) {
        list.push(commentText);
        if (list.length >= 10000) {
          // 上限に達しているので追加せずに終了
          getLang(lang => showStatus(
            lang === 'en' ? 'Block list limit reached' : 'リスト上限に達しました',
            'red'
          ));
          return; // ここで関数終了
        }
        chrome.storage.local.set({ blockedComments: list }, () => {
          runBlocker(); // 再実行して即非表示
        });
      }
    });
  });

  return btn;
}

/**
 * コメントを投稿ユーザー単位でブロック
 * @param {Element} item - コメント要素
 * @param {string[]} blockedUsers - 非表示にするユーザー名リスト
 * @param {string} userSelector - ユーザー名の要素セレクタ
 * @param {string|null} buttonContainerSelector - ブロックボタンを置く場所
 * @param {string|null} parentSelector - 非表示対象の親要素（nullなら item）
 * @param {Function} runBlocker - 再実行用関数
 */
function processCommentUserBlock(
  item,
  blockedUsers,
  userSelector,
  buttonContainerSelector,
  parentSelector,
  runBlocker
) {
  const userElem = item.querySelector(userSelector);
  if (!userElem) return;

  const userName = userElem.textContent?.trim();
  if (!userName) return;

  const parent = parentSelector ? item.closest(parentSelector) : item;

  // ブロックユーザーなら即非表示
  if (blockedUsers.includes(userName)) {
    if (parent) parent.style.display = "none";
  }

  // ブロックボタン追加（ユーザー名の左側）
  if (buttonContainerSelector) {
    const container = item.querySelector(buttonContainerSelector);
    if (container && !container.querySelector(".block-user-btn")) {
      const btn = document.createElement("button");
      btn.textContent = "×";
      btn.className = "block-user-btn";
      btn.style.color = "red";
      btn.style.border = "none";
      btn.style.background = "transparent";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "16px";
      btn.style.marginRight = "4px";

      // ユーザー名の前に挿入
      container.insertBefore(btn, userElem);

      btn.onclick = (event) => {
        event.stopPropagation();
        event.preventDefault();

        chrome.storage.local.get({ blockedUsers: [] }, (data) => {
          const updated = data.blockedUsers || [];
          if (!updated.includes(userName)) {
            updated.push(userName);
            chrome.storage.local.set({ blockedUsers: updated }, () => {
              if (parent) parent.style.display = "none";
              runBlocker();
            });
          } else {
            if (parent) parent.style.display = "none";
          }
        });
      };
    }
  }
}


/**
 * ブロック対象のアイテムを非表示にする
 * @param {Element} item
 * @param {string} channelName
 * @param {string[]} blockList
 * @param {string} closestSelectors
 */
function applyBlockDisplay(item, channelName, blockList, closestSelectors) {
  if (!blockList.includes(channelName)) return;

  const parent = item.closest(closestSelectors);
  if (parent) {
    parent.style.display = "none";
  } else {
    item.style.display = "none";
  }
}

/**
 * 動画タイトルに対するキーワードANDブロック判定
 * @param {string} title
 * @param {string[][]} keywordSets
 * @returns {boolean}
 */
function isTitleBlocked(title, keywordSets) {
  title = title.toLowerCase();

  for (const keywords of keywordSets) {
    if (keywords.length === 0) continue;
    const allIncluded = keywords.every((kw) =>
      title.includes(kw.toLowerCase())
    );
    if (allIncluded) return true;
  }
  return false;
}

/**
 * チャンネル名がキーワードセットのAND条件にマッチしているか判定
 * @param {string} channelName
 * @param {string[][]} keywordSets
 * @returns {boolean}
 */
function isChannelBlocked(channelName, keywordSets) {
  const nameLower = channelName.toLowerCase();

  for (const keywords of keywordSets) {
    if (keywords.length === 0) continue;
    // キーワードセット内の全てを含むか（単語1つの場合はその単語を含むか）
    const allIncluded = keywords.every((kw) =>
      nameLower.includes(kw.toLowerCase())
    );
    if (allIncluded) return true;
  }
  return false;
}

// let hideShortsFlag = true;

/**
 * hideShortsFlagの状態をストレージから取得して反映する
 * @param {Function} callback - 読み込み完了後に呼ばれる関数
 */
function loadHideShortsFlag(callback) {
  chrome.storage.local.get(["hideShortsFlag"], (result) => {
    hideShortsFlag = !!result.hideShortsFlag;
    // hideShortsFlag = true;
    if (callback) callback();
  });
}

/**
 * hideShortsFlagの状態を切り替えてストレージに保存し、runBlockerを再実行
 */
function toggleHideShortsFlag() {
  hideShortsFlag = !hideShortsFlag;
  chrome.storage.local.set({ hideShortsFlag }, () => {
    console.log(`hideShortsFlag is now ${hideShortsFlag}`);
    runBlocker();
  });
}

/**
 * チャンネル名の要素とボタン挿入位置を指定して処理
 * @param {Element} item
 * @param {string[]} blockList
 * @param {string} channelSelector
 * @param {string|null} insertBeforeElemSelector
 * @param {string} blockParentSelectors
 * @param {Function} runBlocker
 * @param {string[][]} channelKeywordSets
 * @param {string[][]} titleKeywordSets
 */
function processItemGeneric(
  item,
  blockList,
  channelSelector,
  insertBeforeElemSelector,
  blockParentSelectors,
  runBlocker,
  channelKeywordSets,
  titleKeywordSets
) {
  // プレイリスト特有のタグがあれば処理スキップ
  if (item.querySelector("yt-collection-thumbnail-view-model")) {
    return; // プレイリストなので除外
  }
  const channelNameElem = item.querySelector(channelSelector);
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();
  if (!channelName) {
    console.log("No channel name found, skipping");
    return;
  }

  let insertTarget = insertBeforeElemSelector
    ? item.querySelector(insertBeforeElemSelector)
    : null;

  const prevElem = insertTarget
    ? insertTarget.previousElementSibling
    : channelNameElem.previousElementSibling;
  if (!prevElem || !prevElem.classList?.contains("block-btn")) {
    const btn = createBlockButton(channelName, runBlocker);
    if (insertTarget) {
      insertTarget.parentElement.insertBefore(btn, insertTarget);
    } else if (channelNameElem.parentElement) {
      channelNameElem.parentElement.insertBefore(btn, channelNameElem);
    }
  }

  // マウスがitem（親要素）に入ったらチャンネル名を保存
  item.addEventListener("mouseenter", () => {
    hoveredChannelName = channelName;
  });

  // リストからチャンネル名完全一致で非表示
  if (blockList.includes(channelName)) {
    if (blockParentSelectors == null) {
      return; // blockParentSelectors（第５引数）がnullの場合は非表示にしない
    }
    const parent = item.closest(blockParentSelectors);
    if (parent) {
      parent.style.display = "none";
      return;
    } else {
      item.style.display = "none";
      return;
    }
  }

  // チャンネル名キーワードセットによるブロック判定（AND条件）
  if (isChannelBlocked(channelName, channelKeywordSets)) {
    const parent = item.closest(blockParentSelectors);
    if (parent) {
      parent.style.display = "none";
      return;
    } else {
      item.style.display = "none";
      return;
    }
  }

  // 動画タイトルキーワードANDブロック判定
  const titleElem = item.querySelector(
    "#video-title, h3 a, #title, yt-formatted-string#description-text, ytd-video-renderer #video-title, yt-formatted-string#video-title"
  );
  if (!titleElem) return;

  const titleText = titleElem.textContent || "";
  if (isTitleBlocked(titleText, titleKeywordSets)) {
    const parent = item.closest(blockParentSelectors);
    if (parent) {
      parent.style.display = "none";
    } else {
      item.style.display = "none";
    }
  }
}

/**
 * 指定した子要素セレクタを持つ要素を探し、その親要素を非表示にする関数
 *
 * 使い方例：
 *  - href属性が"/shorts/"で始まる要素の場合： 'a[href^="/shorts/"]'
 *  - idが"text"の場合： '#text'
 *  - クラス名が"my-class"の場合： '.my-class'
 *  - タグ名が"h3"の場合： 'h3'
 *
 * @param {string} childSelector - 非表示判定の基準となる子要素のCSSセレクタ（例：'#id名', '.class名', 'a[href^="/shorts/"]'など）
 * @param {string} parentSelector - 非表示にしたい親要素のCSSセレクタ（例：'ytd-rich-shelf-renderer'など）
 */
function hideParentByChildSelector(childSelector, parentSelector) {
  document.querySelectorAll(childSelector).forEach((childElem) => {
    const parent = childElem.closest(parentSelector);
    if (parent) {
      parent.style.display = "none";
    }
  });
}

/**
 * 各画面ごとにアイテムを処理し、ボタン追加＆ブロック判定
 */
function runBlocker() {
  chrome.storage.local.get(
    [
      "blockerEnabled",
      "blockedChannels",
      "channelKeywordSets",
      "titleKeywordSets",
      "hideShortsFlag",
      "blockedComments",
    ],
    (result) => {
      if (result.blockerEnabled === false) {
        console.log("Blocker is disabled");
        clearBlocks();
        return;
      }

      console.log(hideShortsFlag);
      // hideShortsFlag = !!result.hideShortsFlag;

      const blockList = result.blockedChannels || [];

      // チャンネル名フィルター用キーワードセットは最大5000件、各セットは最大3語
      let channelKeywordSetsRaw = result.channelKeywordSets || [];
      if (channelKeywordSetsRaw.length > 5000) {
        channelKeywordSetsRaw = channelKeywordSetsRaw.slice(0, 5000);
      }
      const channelKeywordSets = channelKeywordSetsRaw.map((set) =>
        set.slice(0, 3)
      );

      // タイトルフィルター用キーワードセットは最大5000件、各セットは最大3語
      let titleKeywordSetsRaw = result.titleKeywordSets || [];
      if (titleKeywordSetsRaw.length > 5000) {
        titleKeywordSetsRaw = titleKeywordSetsRaw.slice(0, 5000);
      }
      const titleKeywordSets = titleKeywordSetsRaw.map((set) =>
        set.slice(0, 3)
      );

      if (hideShortsFlag) {
        hideParentByChildSelector(
          'a[href^="/shorts/"]',
          "ytd-rich-shelf-renderer"
        ); // ホーム画面の「ショート動画」や「おすすめショート」
        hideParentByChildSelector(
          'a[href^="/shorts/"]',
          "grid-shelf-view-model"
        ); // 検索画面の「最新のショート」や「ショート」
        hideParentByChildSelector(
          'a[href^="/shorts/"]',
          "ytd-reel-shelf-renderer"
        ); // 関連動画の「この動画をリミックスした～」
        hideParentByChildSelector('a[href^="/shorts/"]', "ytd-video-renderer");
        hideParentByChildSelector(
          'a[href^="/shorts/"]',
          "ytd-compact-video-renderer"
        ); // 関連動画のショート動画（素）
      }

      // ホーム画面の動画
      document.querySelectorAll("#dismissible").forEach((item) => {
        processItemGeneric(
          item,
          blockList,
          "#channel-name a, ytd-channel-name a",
          null,
          "ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer",
          runBlocker,
          channelKeywordSets,
          titleKeywordSets
        );
      });

      // 関連動画サイドバー:通常動画用
      document.querySelectorAll("yt-lockup-view-model").forEach((item) => {
        processItemGeneric(
          item,
          blockList,
          ".yt-content-metadata-view-model-wiz__metadata-text",
          null,
          "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer",
          runBlocker,
          channelKeywordSets,
          titleKeywordSets
        );
      });

      // 関連動画サイドバー:ショート動画用
      // 動作が不安定なのでテストバージョン
      document
        .querySelectorAll("ytd-compact-video-renderer")
        .forEach((item) => {
          processItemGeneric(
            item,
            blockList,
            "ytd-channel-name #text",
            null,
            "ytd-compact-video-renderer",
            runBlocker,
            channelKeywordSets,
            titleKeywordSets
          );
        });

      // 検索結果動画
      document.querySelectorAll("ytd-video-renderer").forEach((item) => {
        processItemGeneric(
          item,
          blockList,
          "#channel-name a, ytd-channel-name a",
          "yt-img-shadow",
          "ytd-video-renderer",
          runBlocker,
          channelKeywordSets,
          titleKeywordSets
        );
      });

      // 検索画面のチャンネル名
      document.querySelectorAll("ytd-channel-renderer").forEach((item) => {
        processItemGeneric(
          item,
          blockList,
          "ytd-channel-name #text, #channel-name a, ytd-channel-name a",
          null,
          "ytd-channel-renderer",
          runBlocker,
          channelKeywordSets,
          titleKeywordSets
        );
      });

      // 動画再生ページ
      document.querySelectorAll("ytd-video-owner-renderer").forEach((item) => {
        processItemGeneric(
          item,
          blockList,
          "ytd-channel-name #text",
          null,
          null,
          runBlocker,
          channelKeywordSets,
          titleKeywordSets
        );
      });

      // チャンネルページ
      document
        .querySelectorAll("yt-dynamic-text-view-model")
        .forEach((item) => {
          processItemGeneric(
            item,
            blockList,
            '[role="text"]',
            null,
            null,
            runBlocker,
            channelKeywordSets,
            titleKeywordSets
          );
        });

      // コメント欄処理（ユーザー単位で非表示）
      const blockedUsers = result.blockedUsers || [];
      document
        .querySelectorAll("ytd-comment-thread-renderer")
        .forEach((item) => {
          processCommentUserBlock(
            item,
            blockedUsers,
            "#author-text span",
            "#author-text",
            "ytd-comment-thread-renderer",
            runBlocker
          );
        });

      // Shortsコメント
      document
        .querySelectorAll("ytd-comment-renderer")
        .forEach((item) => {
          processCommentUserBlock(
            item,
            blockedUsers,
            'ytd-author-comment-badge-renderer #channel-name #text', // userSelector
            'ytd-author-comment-badge-renderer #text-container',     // buttonContainerSelector
            null,                                                   // parentSelectorはitemでOK
            runBlocker
          );
        });

    }
  );
}

/**
 * すべてのブロックを解除（無効化時）
 */
function clearBlocks() {
  document
    .querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer, ytd-channel-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer, yt-lockup-view-model"
    )
    .forEach((item) => {
      item.style.display = "";
    });
}

const observer = new MutationObserver((mutationsList) => {
  let triggered = false;
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      if (
        node.nodeType === 1 &&
        (node.matches?.(
          "ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-channel-renderer"
        ) ||
          node.querySelector?.(
            "ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-channel-renderer"
          ))
      ) {
        runBlocker();
        triggered = true;
        break;
      }
    }
    if (triggered) break;
  }
  if (!triggered) {
    onMutations();
  }
});
observer.observe(document.body, { childList: true, subtree: true });

function onMutations() {
  const videoCount = document.querySelectorAll("ytd-video-renderer").length;

  if (videoCount >= 5) {
    runBlocker();
    clearTimeout(debounceTimer);
  } else {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runBlocker();
    }, DEBOUNCE_DELAY);
  }
}

// 初回実行
loadHideShortsFlag(() => {
  runBlocker();
});

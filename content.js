const DEBOUNCE_DELAY = 300;
let debounceTimer = null;

/**
 * ポップアップ表示用要素を作成（1回だけ）
 */
function createPopup() {
  const popup = document.createElement('div');
  popup.id = 'block-popup';
  popup.style.position = 'fixed';
  popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
  popup.style.color = 'white';
  popup.style.padding = '5px 10px';
  popup.style.borderRadius = '5px';
  popup.style.fontSize = '12px';
  popup.style.pointerEvents = 'none'; // マウス操作を妨げない
  popup.style.zIndex = 9999;
  popup.style.transition = 'opacity 0.3s ease';
  popup.style.opacity = '0';
  document.body.appendChild(popup);
  return popup;
}

const popup = createPopup();
let popupTimeout = null;

/**
 * ポップアップを表示
 * @param {MouseEvent} event - マウスイベント（位置取得用）
 * @param {string} channelName - 表示するチャンネル名
 */
function showPopup(event, channelName) {
  popup.textContent = `Blocked: ${channelName}`;
  const x = event.clientX + 15;
  const y = event.clientY + 15;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.opacity = '1';

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    popup.style.opacity = '0';
  }, 5000);
}

/**
 * チャンネルブロックボタンを生成
 * @param {string} channelName - チャンネル名
 * @param {Function} runBlocker - ブロック処理を再実行する関数
 * @returns {HTMLButtonElement} - 生成したボタン要素
 */
function createBlockButton(channelName, runBlocker) {
  const btn = document.createElement('button');
  btn.textContent = '×';
  btn.className = 'block-btn';
  btn.style.color = 'red';
  btn.style.border = 'none';
  btn.style.background = 'transparent';
  btn.style.cursor = 'pointer';
  btn.style.marginRight = '8px';
  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    event.preventDefault();

    chrome.storage.local.get(['blockedChannels'], (result) => {
      const updatedList = result.blockedChannels || [];
      if (!updatedList.includes(channelName)) {
        updatedList.push(channelName);
        chrome.storage.local.set({ blockedChannels: updatedList }, () => {
          console.log(`Blocked: ${channelName}`);
          runBlocker();

          // ポップアップ表示
          showPopup(event, channelName);
        });
      }
    });
  });
  return btn;
}

/**
 * ブロック対象のアイテムを非表示にする
 * @param {Element} item - 対象となる動画アイテムのDOM要素
 * @param {string} channelName - チャンネル名
 * @param {string[]} blockList - ブロック対象チャンネル名の配列
 * @param {string} closestSelectors - 非表示にする親要素のセレクタ
 */
function applyBlockDisplay(item, channelName, blockList, closestSelectors) {
  if (!blockList.includes(channelName)) return;

  const parent = item.closest(closestSelectors);
  if (parent) {
    parent.style.display = 'none';
  } else {
    item.style.display = 'none';
  }
}

/**
 * チャンネル名の要素とボタン挿入位置を指定して処理
 * @param {Element} item - 対象となる動画アイテムのDOM要素
 * @param {string[]} blockList - ブロック対象チャンネル名の配列
 * @param {string} channelSelector - チャンネル名を取得するためのセレクタ
 * @param {string|null} insertBeforeElemSelector - ボタン挿入位置のセレクタ（nullならデフォルト位置）
 * @param {string} blockParentSelectors - 非表示にする親要素のセレクタ
 * @param {Function} runBlocker - ブロック処理を再実行する関数
 */
function processItemGeneric(item, blockList, channelSelector, insertBeforeElemSelector, blockParentSelectors, runBlocker) {
  const channelNameElem = item.querySelector(channelSelector);
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();

  let insertTarget = insertBeforeElemSelector 
    ? item.querySelector(insertBeforeElemSelector)
    : null;

  const prevElem = insertTarget ? insertTarget.previousElementSibling : channelNameElem.previousElementSibling;
  if (!prevElem || !prevElem.classList?.contains('block-btn')) {
    const btn = createBlockButton(channelName, runBlocker);
    if (insertTarget) {
      insertTarget.parentElement.insertBefore(btn, insertTarget);
    } else if (channelNameElem.parentElement) {
      channelNameElem.parentElement.insertBefore(btn, channelNameElem);
    }
  }

  applyBlockDisplay(item, channelName, blockList, blockParentSelectors);
}

/**
 * 各画面ごとにアイテムを処理し、ボタン追加＆ブロック判定
 */
function runBlocker() {
  chrome.storage.local.get(['blockerEnabled', 'blockedChannels'], (result) => {
    if (result.blockerEnabled === false) {
      console.log('Blocker is disabled');
      clearBlocks();
      return;
    }

    const blockList = result.blockedChannels || [];

    // ホーム画面の動画
    document.querySelectorAll('#dismissible').forEach(item => {
      processItemGeneric(
        item, blockList,
        '#channel-name a, ytd-channel-name a',
        null,
        'ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer',
        runBlocker
      );
    });

    // 関連動画サイドバー:通常動画用
    document.querySelectorAll('yt-lockup-view-model').forEach(item => {
      processItemGeneric(
        item, blockList,
        '.yt-content-metadata-view-model-wiz__metadata-text',
        null,
        'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer',
        runBlocker
      );
    });

    // 検索結果動画
    document.querySelectorAll('ytd-video-renderer').forEach(item => {
      processItemGeneric(
        item, blockList,
        '#channel-name a, ytd-channel-name a',
        'yt-img-shadow',
        'ytd-video-renderer',
        runBlocker
      );
    });

    // 検索画面のチャンネル名
    document.querySelectorAll('ytd-channel-renderer').forEach(item => {
      processItemGeneric(
        item, blockList,
        'ytd-channel-name #text, #channel-name a, ytd-channel-name a',
        null,
        'ytd-channel-renderer',
        runBlocker
      );
    });
  });
}

/**
 * 全てのブロックを解除（無効化時）
 */
function clearBlocks() {
  document.querySelectorAll(
    'ytd-rich-item-renderer, ytd-video-renderer, ytd-channel-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer, yt-lockup-view-model'
  ).forEach(item => {
    item.style.display = '';
  });
}

const observer = new MutationObserver((mutationsList) => {
  let triggered = false;
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      if (
        node.nodeType === 1 &&
        (
          node.matches?.('ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-channel-renderer') ||
          node.querySelector?.('ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-channel-renderer')
        )
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

/**
 * 動画数によってrunBlockerの呼び出しタイミングを調整
 */
function onMutations() {
  const videoCount = document.querySelectorAll('ytd-video-renderer').length;

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
runBlocker();

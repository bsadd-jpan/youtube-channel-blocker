const DEBOUNCE_DELAY = 300;
let debounceTimer = null;

let hoveredChannelName = null; // マウスオーバーで保存するチャンネル名

/**
 * ポップアップ表示用要素を作成（1回だけ）
 */
function createPopup() {
  const popup = document.createElement('div');
  popup.id = 'block-popup';
  popup.style.position = 'fixed';
  popup.style.backgroundColor = 'rgba(0,0,0,0.8)';
  popup.style.color = 'white';
  popup.style.padding = '10px 10px';
  popup.style.borderRadius = '10px';
  popup.style.fontSize = '18px';
  popup.style.pointerEvents = 'none';
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
 * @param {MouseEvent} event
 * @param {string} channelName
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
  popup.style.opacity = '1';

  if (popupTimeout) clearTimeout(popupTimeout);
  popupTimeout = setTimeout(() => {
    popup.style.opacity = '0';
  }, 5000);
}

/**
 * マウスオーバー時に名前を保存する
 * @param {Element} elem
 */
function attachMouseoverSaveName(elem) {
  elem.addEventListener('mouseover', () => {
    hoveredChannelName = elem.textContent.trim();
  });
}

/**
 * チャンネルブロックボタンを生成
 * @param {string} channelName
 * @param {Function} runBlocker
 * @returns {HTMLButtonElement}
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

    // 保存しているマウスオーバー名とクリックしたチャンネル名が一致するかチェック
    if (hoveredChannelName !== channelName) {
      showErrorPopup(event, 'エラー。一致しません');
      return;
    }

    chrome.storage.local.get(['blockedChannels'], (result) => {
      const updatedList = result.blockedChannels || [];
      if (!updatedList.includes(channelName)) {
        updatedList.push(channelName);
        chrome.storage.local.set({ blockedChannels: updatedList }, () => {
          console.log(`Blocked: ${channelName}`);
          runBlocker();

          showPopup(event, channelName);
        });
      }
    });
  });
  return btn;
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
    parent.style.display = 'none';
  } else {
    item.style.display = 'none';
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
    const allIncluded = keywords.every(kw => title.includes(kw.toLowerCase()));
    if (allIncluded) return true;
  }
  return false;
}

/**
 * チャンネル名の要素とボタン挿入位置を指定して処理
 * @param {Element} item
 * @param {string[]} blockList
 * @param {string} channelSelector
 * @param {string|null} insertBeforeElemSelector
 * @param {string} blockParentSelectors
 * @param {Function} runBlocker
 * @param {string[][]} keywordSets
 */
function processItemGeneric(item, blockList, channelSelector, insertBeforeElemSelector, blockParentSelectors, runBlocker, keywordSets) {
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

    // マウスオーバーで名前保存のためイベント付与
    attachMouseoverSaveName(channelNameElem);
  }

  // チャンネル名ブロック判定
  applyBlockDisplay(item, channelName, blockList, blockParentSelectors);

  // 動画タイトルキーワードANDブロック判定
  const titleElem = item.querySelector('#video-title, h3 a, #title, yt-formatted-string#description-text, ytd-video-renderer #video-title, yt-formatted-string#video-title');
  if (!titleElem) return;

  const titleText = titleElem.textContent || '';
  if (isTitleBlocked(titleText, keywordSets)) {
    const parent = item.closest(blockParentSelectors);
    if (parent) {
      parent.style.display = 'none';
    } else {
      item.style.display = 'none';
    }
  }
}

/**
 * 各画面ごとにアイテムを処理し、ボタン追加＆ブロック判定
 */
function runBlocker() {
  chrome.storage.local.get(['blockerEnabled', 'blockedChannels', 'titleKeywordSets'], (result) => {
    if (result.blockerEnabled === false) {
      console.log('Blocker is disabled');
      clearBlocks();
      return;
    }

    const blockList = result.blockedChannels || [];

    // キーワードセットは最大1000件、各セットは最大3語
    let keywordSetsRaw = result.titleKeywordSets || [];
    if (keywordSetsRaw.length > 1000) {
      keywordSetsRaw = keywordSetsRaw.slice(0, 1000);
    }
    const keywordSets = keywordSetsRaw.map(set => set.slice(0, 3));

    // ホーム画面の動画
    document.querySelectorAll('#dismissible').forEach(item => {
      processItemGeneric(
        item, blockList,
        '#channel-name a, ytd-channel-name a',
        null,
        'ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer',
        runBlocker,
        keywordSets
      );
    });

    // 関連動画サイドバー:通常動画用
    document.querySelectorAll('yt-lockup-view-model').forEach(item => {
      processItemGeneric(
        item, blockList,
        '.yt-content-metadata-view-model-wiz__metadata-text',
        null,
        'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer',
        runBlocker,
        keywordSets
      );
    });

    // 検索結果動画
    document.querySelectorAll('ytd-video-renderer').forEach(item => {
      processItemGeneric(
        item, blockList,
        '#channel-name a, ytd-channel-name a',
        'yt-img-shadow',
        'ytd-video-renderer',
        runBlocker,
        keywordSets
      );
    });

    // 検索画面のチャンネル名
    document.querySelectorAll('ytd-channel-renderer').forEach(item => {
      processItemGeneric(
        item, blockList,
        'ytd-channel-name #text, #channel-name a, ytd-channel-name a',
        null,
        'ytd-channel-renderer',
        runBlocker,
        keywordSets
      );
    });
  });
}

/**
 * すべてのブロックを解除（無効化時）
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

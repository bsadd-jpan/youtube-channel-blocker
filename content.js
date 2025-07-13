const DEBOUNCE_DELAY = 300;
let debounceTimer = null;

// ボタン生成（クリック時にブロックリストに追加して再処理）
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

    // チャンネル名をブロックリストに追加し、再描画
    chrome.storage.local.get(['blockedChannels'], (result) => {
      const updatedList = result.blockedChannels || [];
      if (!updatedList.includes(channelName)) {
        updatedList.push(channelName);
        chrome.storage.local.set({ blockedChannels: updatedList }, () => {
          console.log(`Blocked: ${channelName}`);
          runBlocker();
        });
      }
    });
  });
  return btn;
}

// ブロック対象のアイテムを非表示にする
function applyBlockDisplay(item, channelName, blockList, closestSelectors) {
  if (!blockList.includes(channelName)) return;

  // 指定した親要素ごと非表示にする
  const parent = item.closest(closestSelectors);
  if (parent) {
    parent.style.display = 'none';
  } else {
    item.style.display = 'none';
  }
}

// チャンネル名の要素とボタン挿入位置を指定して処理
function processItemGeneric(item, blockList, channelSelector, insertBeforeElemSelector, blockParentSelectors) {
  const channelNameElem = item.querySelector(channelSelector);
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();

  // 挿入位置の要素を取得
  let insertTarget = insertBeforeElemSelector 
    ? item.querySelector(insertBeforeElemSelector)
    : null;

  // 既にボタンがなければ作成・挿入
  const prevElem = insertTarget ? insertTarget.previousElementSibling : channelNameElem.previousElementSibling;
  if (!prevElem || !prevElem.classList?.contains('block-btn')) {
    const btn = createBlockButton(channelName, runBlocker);
    if (insertTarget) {
      insertTarget.parentElement.insertBefore(btn, insertTarget);
    } else if (channelNameElem.parentElement) {
      channelNameElem.parentElement.insertBefore(btn, channelNameElem);
    }
  }

  // ブロック判定と非表示
  applyBlockDisplay(item, channelName, blockList, blockParentSelectors);
}

// 各画面ごとにアイテムを処理し、ボタン追加＆ブロック判定
function runBlocker() {
  chrome.storage.local.get(['blockedChannels'], (result) => {
    const blockList = result.blockedChannels || [];

    // ホーム・おすすめ動画
    document.querySelectorAll('#dismissible').forEach(item => {
      processItemGeneric(
        item, blockList,
        '#channel-name a, ytd-channel-name a',
        null,
        'ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer'
      );
    });

    // 関連動画サイドバー
    document.querySelectorAll('yt-lockup-view-model').forEach(item => {
      processItemGeneric(
        item, blockList,
        '.yt-content-metadata-view-model-wiz__metadata-text',
        null,
        'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer'
      );
    });

    // 検索結果動画
    document.querySelectorAll('ytd-video-renderer').forEach(item => {
      processItemGeneric(
        item, blockList,
        '#channel-name a, ytd-channel-name a',
        'yt-img-shadow',
        'ytd-video-renderer'
      );
    });
  });
}

// DOM変化時に呼ばれる（YouTubeは動的なので必要）
function onMutations() {
  // 連続変化時は処理を遅延・まとめて実行
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runBlocker();
  }, DEBOUNCE_DELAY);
}

// 初期実行＆監視開始
runBlocker(); // ページロード時に一度実行

// ページ内のDOM変化を監視（動画リストの動的追加・削除に対応）
const observer = new MutationObserver(onMutations);
observer.observe(document.body, { childList: true, subtree: true });

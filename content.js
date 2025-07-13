const DEBOUNCE_DELAY = 300;
let debounceTimer = null;

// ホームや関連動画用
function processItem(item, blockList) {
  const channelNameElem = item.querySelector('#channel-name a, ytd-channel-name a');
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();

  // ×ボタンの追加（名前の前）
  if (!channelNameElem.previousElementSibling || !channelNameElem.previousElementSibling.classList?.contains('block-btn')) {
    const blockBtn = document.createElement('button');
    blockBtn.textContent = '×';
    blockBtn.className = 'block-btn';
    blockBtn.style.marginRight = '8px';  // 名前の前なので右マージン
    blockBtn.style.color = 'red';
    blockBtn.style.border = 'none';
    blockBtn.style.background = 'transparent';
    blockBtn.style.cursor = 'pointer';

    blockBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();

      chrome.storage.local.get(['blockedChannels'], (result) => {
        const updatedList = result.blockedChannels || [];
        if (!updatedList.includes(channelName)) {
          updatedList.push(channelName);
          chrome.storage.local.set({ blockedChannels: updatedList }, () => {
            console.log(`Blocked: ${channelName}`);
            runBlocker(); // 最新リストで再処理
          });
        }
      });
    });

    if (channelNameElem.parentElement) {
      channelNameElem.parentElement.insertBefore(blockBtn, channelNameElem);
    }
  }

  // ブロック判定と非表示
  if (blockList.includes(channelName)) {
    const parent = item.closest('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer');
    if (parent) {
      parent.style.display = 'none';
    } else {
      item.style.display = 'none';
    }
  }
}

// 検索結果用
function processSearchItem(item, blockList) {
  const channelNameElem = item.querySelector('#channel-name a, ytd-channel-name a');
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();

  const thumb = item.querySelector('yt-img-shadow');
  if (!thumb) return;

  if (!thumb.previousElementSibling || !thumb.previousElementSibling.classList?.contains('block-btn')) {
    const blockBtn = document.createElement('button');
    blockBtn.textContent = '×';
    blockBtn.className = 'block-btn';
    blockBtn.style.position = 'relative';
    blockBtn.style.left = '0';
    blockBtn.style.top = '0';
    blockBtn.style.marginRight = '8px';
    blockBtn.style.color = 'red';
    blockBtn.style.border = 'none';
    blockBtn.style.background = 'transparent';
    blockBtn.style.cursor = 'pointer';

    blockBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      event.preventDefault();

      chrome.storage.local.get(['blockedChannels'], (result) => {
        const updatedList = result.blockedChannels || [];
        if (!updatedList.includes(channelName)) {
          updatedList.push(channelName);
          chrome.storage.local.set({ blockedChannels: updatedList }, () => {
            console.log(`Blocked: ${channelName}`);
            runBlocker(); // 最新リストで再処理
          });
        }
      });
    });

    thumb.parentElement.insertBefore(blockBtn, thumb);
  }

  if (blockList.includes(channelName)) {
    const parent = item.closest('ytd-video-renderer');
    if (parent) {
      parent.style.display = 'none';
    } else {
      item.style.display = 'none';
    }
  }
}

function runBlocker() {
  chrome.storage.local.get(['blockedChannels'], (result) => {
    const blockList = result.blockedChannels || [];

    // ホーム・おすすめ動画
    const homeItems = document.querySelectorAll('#dismissible');
    homeItems.forEach(item => processItem(item, blockList));

    // 関連動画サイドバー
    const sideItems = document.querySelectorAll('yt-lockup-view-model');
    sideItems.forEach(item => {
      const channelNameElem = item.querySelector('.yt-content-metadata-view-model-wiz__metadata-text');
      if (!channelNameElem) return;

      const channelName = channelNameElem.textContent.trim();

      if (!channelNameElem.previousElementSibling || !channelNameElem.previousElementSibling.classList?.contains('block-btn')) {
        const blockBtn = document.createElement('button');
        blockBtn.textContent = '×';
        blockBtn.className = 'block-btn';
        blockBtn.style.marginRight = '8px';
        blockBtn.style.color = 'red';
        blockBtn.style.border = 'none';
        blockBtn.style.background = 'transparent';
        blockBtn.style.cursor = 'pointer';

        blockBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          event.preventDefault();

          chrome.storage.local.get(['blockedChannels'], (result) => {
            const updatedList = result.blockedChannels || [];
            if (!updatedList.includes(channelName)) {
              updatedList.push(channelName);
              chrome.storage.local.set({ blockedChannels: updatedList }, () => {
                console.log(`Blocked: ${channelName}`);
                runBlocker(); // 最新リストで再処理
              });
            }
          });
        });

        if (channelNameElem.parentElement) {
          channelNameElem.parentElement.insertBefore(blockBtn, channelNameElem);
        }
      }

      if (blockList.includes(channelName)) {
        const parent = item.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer');
        if (parent) {
          parent.style.display = 'none';
        } else {
          item.style.display = 'none';
        }
      }
    });

    // 検索結果動画
    const searchItems = document.querySelectorAll('ytd-video-renderer');
    searchItems.forEach(item => processSearchItem(item, blockList));
  });
}

function onMutations() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runBlocker();
  }, DEBOUNCE_DELAY);
}

// 初期実行＆監視開始
runBlocker();
const observer = new MutationObserver(onMutations);
observer.observe(document.body, { childList: true, subtree: true });

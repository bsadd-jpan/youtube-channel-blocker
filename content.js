const DEBOUNCE_DELAY = 300;
let debounceTimer = null;

// チャンネル名要素からボタン追加とブロック判定を行う
function processItem(item, blockList) {
  const channelNameElem = item.querySelector('#channel-name a, ytd-channel-name a');
  if (!channelNameElem) return;

  const channelName = channelNameElem.textContent.trim();

  // ×ボタンの追加
  if (!channelNameElem.nextElementSibling || !channelNameElem.nextElementSibling.classList.contains('block-btn')) {
    const blockBtn = document.createElement('button');
    blockBtn.textContent = '×';
    blockBtn.className = 'block-btn';
    blockBtn.style.marginLeft = '8px';
    blockBtn.style.color = 'red';
    blockBtn.style.border = 'none';
    blockBtn.style.background = 'transparent';
    blockBtn.style.cursor = 'pointer';

    blockBtn.addEventListener('click', () => {
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

    channelNameElem.parentElement.appendChild(blockBtn);
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

// 全体を走査してブロック処理
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

      if (!channelNameElem.nextElementSibling || !channelNameElem.nextElementSibling.classList.contains('block-btn')) {
        const blockBtn = document.createElement('button');
        blockBtn.textContent = '×';
        blockBtn.className = 'block-btn';
        blockBtn.style.marginLeft = '8px';
        blockBtn.style.color = 'red';
        blockBtn.style.border = 'none';
        blockBtn.style.background = 'transparent';
        blockBtn.style.cursor = 'pointer';

        blockBtn.addEventListener('click', () => {
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

        channelNameElem.parentElement.appendChild(blockBtn);
      }

      if (blockList.includes(channelName)) {
        const parent = item.closest('ytd-compact-video-renderer, ytd-compact-autoplay-renderer');
        if (parent) {
          parent.style.display = 'none';
        } else {
          item.style.display = 'none';
        }
      }
    });
  });
}

// MutationObserverのコールバック
function onMutations() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runBlocker();
  }, DEBOUNCE_DELAY);
}

// 初期化
runBlocker();
const observer = new MutationObserver(onMutations);
observer.observe(document.body, { childList: true, subtree: true });

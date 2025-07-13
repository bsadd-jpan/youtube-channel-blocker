function blockChannels(blockList) {
  // ホーム・おすすめの動画
  const homeItems = document.querySelectorAll('#dismissible');
  homeItems.forEach(item => {
    const channelNameElem = item.querySelector('#channel-name a, ytd-channel-name a');
    if (channelNameElem) {
      const channelName = channelNameElem.textContent.trim();
      if (blockList.includes(channelName)) {
        // 直上の親 <ytd-rich-item-renderer> を削除
        const parent = item.closest('ytd-rich-item-renderer');
        if (parent) {
          parent.remove();
        } else {
          item.remove(); // fallback
        }
      }
    }
  });

  // 動画再生ページ右側の関連動画
  const sideItems = document.querySelectorAll('yt-lockup-view-model');
  sideItems.forEach(item => {
    const channelNameElem = item.querySelector(
      '.yt-content-metadata-view-model-wiz__metadata-text'
    );
    if (channelNameElem) {
      const channelName = channelNameElem.textContent.trim();
      if (blockList.includes(channelName)) {
        // item.style.display = 'none';
        item.remove();
      }
    }
  });
}

// ストレージからリスト取得して監視
chrome.storage.sync.get(['blockedChannels'], (result) => {
  const blockList = result.blockedChannels || [];
  blockChannels(blockList);

  // 動的更新対応
  const observer = new MutationObserver(() => blockChannels(blockList));
  observer.observe(document.body, { childList: true, subtree: true });
});

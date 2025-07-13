document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('blockList');
  const saveBtn = document.getElementById('save');
  const status = document.createElement('div');
  status.style.color = 'green';
  status.style.marginTop = '8px';
  saveBtn.parentNode.insertBefore(status, saveBtn.nextSibling);

  // 読み込み
  chrome.storage.local.get(['blockedChannels'], (result) => {
    if (chrome.runtime.lastError) {
      status.textContent = '読み込みに失敗しました';
      return;
    }
    textarea.value = (result.blockedChannels || []).join('\n');
  });

  // 保存
  saveBtn.addEventListener('click', () => {
    const blockList = textarea.value
      .split('\n')
      .map(name => name.trim())
      .filter(Boolean);

    chrome.storage.local.set({ blockedChannels: blockList }, () => {
      if (chrome.runtime.lastError) {
        status.style.color = 'red';
        status.textContent = '保存に失敗しました';
        return;
      }
      status.style.color = 'green';
      status.textContent = '保存しました';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
});

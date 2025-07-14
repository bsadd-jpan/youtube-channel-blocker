document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('blockList');
  const saveBtn = document.getElementById('save');

  // エクスポート・インポートボタン追加
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'エクスポート';
  exportBtn.style.marginLeft = '8px';
  const importBtn = document.createElement('button');
  importBtn.textContent = 'インポート';
  importBtn.style.marginLeft = '8px';

  saveBtn.parentNode.insertBefore(exportBtn, saveBtn.nextSibling);
  saveBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);

  const status = document.createElement('div');
  status.style.color = 'green';
  status.style.marginTop = '8px';
  saveBtn.parentNode.insertBefore(status, importBtn.nextSibling);

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

  // エクスポート
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockedChannels'], (result) => {
      const data = JSON.stringify(result.blockedChannels || [], null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blockedChannels.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      status.style.color = 'green';
      status.textContent = 'エクスポートしました';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });

  // インポート
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const arr = JSON.parse(event.target.result);
          if (!Array.isArray(arr)) throw new Error();
          chrome.storage.local.set({ blockedChannels: arr }, () => {
            textarea.value = arr.join('\n');
            status.style.color = 'green';
            status.textContent = 'インポートしました';
            setTimeout(() => { status.textContent = ''; }, 2000);
          });
        } catch {
          status.style.color = 'red';
          status.textContent = 'インポート失敗（ファイル形式エラー）';
          setTimeout(() => { status.textContent = ''; }, 2000);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
});

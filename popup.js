document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('blockList');
  const saveBtn = document.getElementById('save');

  // トグルボタンを作成
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Blocker: ON';
  toggleBtn.style.marginLeft = '8px';
  toggleBtn.style.padding = '4px 8px';
  toggleBtn.style.border = 'none';
  toggleBtn.style.borderRadius = '4px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.color = 'white';
  toggleBtn.style.backgroundColor = 'red';

  saveBtn.parentNode.insertBefore(toggleBtn, saveBtn.nextSibling);

  // エクスポート・インポートボタン
  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'エクスポート';
  exportBtn.style.marginLeft = '8px';
  const importBtn = document.createElement('button');
  importBtn.textContent = 'インポート';
  importBtn.style.marginLeft = '8px';

  saveBtn.parentNode.insertBefore(exportBtn, toggleBtn.nextSibling);
  saveBtn.parentNode.insertBefore(importBtn, exportBtn.nextSibling);

  const status = document.createElement('div');
  status.style.color = 'green';
  status.style.marginTop = '8px';
  saveBtn.parentNode.insertBefore(status, importBtn.nextSibling);

  // 初期状態読み込み
  chrome.storage.local.get(['blockedChannels', 'blockerEnabled'], (result) => {
    // ブロックリスト
    textarea.value = (result.blockedChannels || []).join('\n');

    // トグル状態
    const isEnabled = result.blockerEnabled !== false; // デフォルトはON
    updateToggleButton(toggleBtn, isEnabled);
  });

  // 保存ボタン
  saveBtn.addEventListener('click', () => {
    const blockList = textarea.value
      .split('\n')
      .map(name => name.trim())
      .filter(Boolean);

    chrome.storage.local.set({ blockedChannels: blockList }, () => {
      if (chrome.runtime.lastError) {
        showStatus('保存に失敗しました', 'red');
        return;
      }
      showStatus('保存しました', 'green');
    });
  });

  // トグルボタン
  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockerEnabled'], (result) => {
      const isEnabled = !(result.blockerEnabled !== false); // 反転
      chrome.storage.local.set({ blockerEnabled: isEnabled }, () => {
        updateToggleButton(toggleBtn, isEnabled);
        const msg = isEnabled ? '有効化しました' : '無効化しました';
        showStatus(msg, 'green');
      });
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
      showStatus('エクスポートしました', 'green');
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
            showStatus('インポートしました', 'green');
          });
        } catch {
          showStatus('インポート失敗（ファイル形式エラー）', 'red');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // トグルボタンの見た目更新
  function updateToggleButton(btn, isEnabled) {
    if (isEnabled) {
      btn.textContent = 'Blocker: ON';
      btn.style.backgroundColor = 'red';
    } else {
      btn.textContent = 'Blocker: OFF';
      btn.style.backgroundColor = 'gray';
    }
  }

  // ステータス表示
  function showStatus(message, color) {
    status.textContent = message;
    status.style.color = color;
    setTimeout(() => { status.textContent = ''; }, 2000);
  }
});

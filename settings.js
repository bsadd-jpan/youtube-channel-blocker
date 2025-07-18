document.addEventListener('DOMContentLoaded', () => {
  const tabListBtn = document.getElementById('tab-list');
  const tabImportExportBtn = document.getElementById('tab-import-export');
  const sectionList = document.getElementById('section-list');
  const sectionImportExport = document.getElementById('section-import-export');
  const blockListContainer = document.getElementById('blockListContainer');
  const searchInput = document.getElementById('searchInput');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  const texts = {
    ja: {
      noMatch: '該当するチャンネルはありません。',
      removed: 'チャンネルをリストから解除しました',
      exported: 'エクスポートしました',
      imported: 'インポートしました',
      importError: 'インポート失敗（ファイル形式エラー）',
      removeBtn: '解除'
    },
    en: {
      noMatch: 'No matching channels.',
      removed: 'Channel removed from list',
      exported: 'Exported successfully',
      imported: 'Imported successfully',
      importError: 'Import failed (invalid file format)',
      removeBtn: 'Remove'
    }
  };

  // 言語はローカルストレージから取得
  function getLang(callback) {
    chrome.storage.local.get('language', (result) => {
      callback(result.language === 'en' ? 'en' : 'ja');
    });
  }

  // タブ切替
  const switchTab = (toList) => {
    tabListBtn.classList.toggle('active', toList);
    tabImportExportBtn.classList.toggle('active', !toList);
    sectionList.classList.toggle('active', toList);
    sectionImportExport.classList.toggle('active', !toList);
    clearStatus();
  };
  tabListBtn.addEventListener('click', () => switchTab(true));
  tabImportExportBtn.addEventListener('click', () => switchTab(false));

  // リスト描画
  const renderBlockList = (filter = '') => {
    chrome.storage.local.get('blockedChannels', (result) => {
      getLang((lang) => {
        const list = result.blockedChannels || [];
        const filtered = list.filter(name => name.toLowerCase().includes(filter.toLowerCase()));
        blockListContainer.innerHTML = '';

        if (filtered.length === 0) {
          const li = document.createElement('li');
          li.textContent = texts[lang].noMatch;
          blockListContainer.appendChild(li);
          return;
        }

        filtered.forEach(name => {
          const li = document.createElement('li');
          li.textContent = name;

          const btn = document.createElement('button');
          btn.textContent = texts[lang].removeBtn;
          btn.className = 'removeBtn';
          btn.addEventListener('click', () => removeChannel(name));

          li.appendChild(btn);
          blockListContainer.appendChild(li);
        });
      });
    });
  };

  // チャンネル削除
  const removeChannel = (name) => {
    chrome.storage.local.get('blockedChannels', (result) => {
      let list = result.blockedChannels || [];
      list = list.filter(item => item !== name);
      chrome.storage.local.set({ blockedChannels: list }, () => {
        renderBlockList(searchInput.value);
        getLang(lang => showStatus(texts[lang].removed, 'green'));
      });
    });
  };

  // 検索
  searchInput.addEventListener('input', () => renderBlockList(searchInput.value));

  // エクスポート
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get('blockedChannels', (result) => {
      const data = JSON.stringify(result.blockedChannels || [], null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'blocked_channels_backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      getLang(lang => showStatus(texts[lang].exported, 'green'));
    });
  });

  // インポート
  importBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arr = JSON.parse(event.target.result);
        if (!Array.isArray(arr)) throw new Error();
        chrome.storage.local.set({ blockedChannels: arr }, () => {
          renderBlockList(searchInput.value);
          getLang(lang => showStatus(texts[lang].imported, 'green'));
        });
      } catch {
        getLang(lang => showStatus(texts[lang].importError, 'red'));
      }
    };
    reader.readAsText(file);
  });

  // ステータス表示
  const showStatus = (msg, color) => {
    status.textContent = msg;
    status.style.backgroundColor = color === 'green' ? '#d4edda' : '#f8d7da';
    status.style.color = color === 'green' ? '#155724' : '#721c24';
    status.style.border = `1px solid ${color === 'green' ? '#c3e6cb' : '#f5c6cb'}`;
    status.style.padding = '8px';
    status.style.borderRadius = '4px';
    setTimeout(clearStatus, 3000);
  };

  const clearStatus = () => {
    status.textContent = '';
    status.style.backgroundColor = '';
    status.style.border = '';
  };

  // 初期描画
  renderBlockList();
});

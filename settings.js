document.addEventListener('DOMContentLoaded', () => {
  // タブボタン
  const tabListBtn = document.getElementById('tab-list');
  const tabKeywordsBtn = document.getElementById('tab-keywords');
  const tabImportExportBtn = document.getElementById('tab-import-export');

  // セクション
  const sectionList = document.getElementById('section-list');
  const sectionKeywords = document.getElementById('section-keywords');
  const sectionImportExport = document.getElementById('section-import-export');

  // 非表示リスト用要素
  const blockListContainer = document.getElementById('blockListContainer');
  const searchInput = document.getElementById('searchInput');

  // キーワードNGリスト用要素
  const keywordListContainer = document.getElementById('keywordListContainer');
  const keywordSearchInput = document.getElementById('keywordSearchInput');
  const addKeywordBtn = document.getElementById('addKeywordBtn');
  const keywordInputs = [
    document.getElementById('keyword1'),
    document.getElementById('keyword2'),
    document.getElementById('keyword3'),
  ];

  // エクスポート・インポート用要素
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  const texts = {
    ja: {
      noMatch: '該当するチャンネルはありません。',
      noMatchKeywords: '該当するキーワードセットはありません。',
      removed: 'チャンネルをリストから解除しました',
      removedKeyword: 'キーワードセットをリストから解除しました',
      addedKeyword: 'キーワードセットを追加しました',
      exported: 'エクスポートしました',
      imported: 'インポートしました',
      importError: 'インポート失敗（ファイル形式エラー）',
      removeBtn: '解除',
      removeBtnKeyword: '解除',
      exportList: 'チャンネル名ブロックリストをエクスポートしました',
      exportKeywords: '動画タイトルキーワードNGリストをエクスポートしました',
      importList: 'チャンネル名ブロックリストをインポートしました',
      importKeywords: '動画タイトルキーワードNGリストをインポートしました',
    },
    en: {
      noMatch: 'No matching channels.',
      noMatchKeywords: 'No matching keyword sets.',
      removed: 'Channel removed from list',
      removedKeyword: 'Keyword set removed from list',
      addedKeyword: 'Keyword set added',
      exported: 'Exported successfully',
      imported: 'Imported successfully',
      importError: 'Import failed (invalid file format)',
      removeBtn: 'Remove',
      removeBtnKeyword: 'Remove',
      exportList: 'Exported channel block list',
      exportKeywords: 'Exported title keyword NG list',
      importList: 'Imported channel block list',
      importKeywords: 'Imported title keyword NG list',
    }
  };

  // 言語取得
  function getLang(callback) {
    chrome.storage.local.get('language', (result) => {
      callback(result.language === 'en' ? 'en' : 'ja');
    });
  }

  // タブ切替関数
  function switchTab(to) {
    // to: 'list', 'keywords', 'importExport'
    tabListBtn.classList.toggle('active', to === 'list');
    tabKeywordsBtn.classList.toggle('active', to === 'keywords');
    tabImportExportBtn.classList.toggle('active', to === 'importExport');

    sectionList.style.display = to === 'list' ? 'block' : 'none';
    sectionKeywords.style.display = to === 'keywords' ? 'block' : 'none';
    sectionImportExport.style.display = to === 'importExport' ? 'block' : 'none';

    clearStatus();
  }

  tabListBtn.addEventListener('click', () => switchTab('list'));
  tabKeywordsBtn.addEventListener('click', () => switchTab('keywords'));
  tabImportExportBtn.addEventListener('click', () => switchTab('importExport'));

  // 非表示チャンネルリスト描画
  function renderBlockList(filter = '') {
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
  }

  // チャンネル削除
  function removeChannel(name) {
    chrome.storage.local.get('blockedChannels', (result) => {
      let list = result.blockedChannels || [];
      list = list.filter(item => item !== name);
      chrome.storage.local.set({ blockedChannels: list }, () => {
        renderBlockList(searchInput.value);
        getLang(lang => showStatus(texts[lang].removed, 'green'));
      });
    });
  }

  // チャンネル検索
  searchInput.addEventListener('input', () => renderBlockList(searchInput.value));

  // キーワードNGリスト描画
  // 表示は配列の配列を「スペース区切りでAND条件」として文字列化して表示
  function renderKeywordList(filter = '') {
    chrome.storage.local.get('titleKeywordSets', (result) => {
      getLang((lang) => {
        const list = result.titleKeywordSets || [];
        const filtered = list.filter(set => {
          const combined = set.join(' ').toLowerCase();
          return combined.includes(filter.toLowerCase());
        });

        keywordListContainer.innerHTML = '';

        if (filtered.length === 0) {
          const li = document.createElement('li');
          li.textContent = texts[lang].noMatchKeywords;
          keywordListContainer.appendChild(li);
          return;
        }

        filtered.forEach(set => {
          const li = document.createElement('li');
          li.textContent = set.join(' ');

          const btn = document.createElement('button');
          btn.textContent = texts[lang].removeBtnKeyword;
          btn.className = 'removeBtn';
          btn.addEventListener('click', () => removeKeywordSet(set));

          li.appendChild(btn);
          keywordListContainer.appendChild(li);
        });
      });
    });
  }

  // キーワードセット削除（完全一致で比較）
  function removeKeywordSet(targetSet) {
    chrome.storage.local.get('titleKeywordSets', (result) => {
      let list = result.titleKeywordSets || [];
      list = list.filter(set => {
        if (set.length !== targetSet.length) return true;
        for (let i = 0; i < set.length; i++) {
          if (set[i] !== targetSet[i]) return true;
        }
        return false;
      });
      chrome.storage.local.set({ titleKeywordSets: list }, () => {
        renderKeywordList(keywordSearchInput.value);
        getLang(lang => showStatus(texts[lang].removedKeyword, 'green'));
      });
    });
  }

  // キーワード検索
  keywordSearchInput.addEventListener('input', () => renderKeywordList(keywordSearchInput.value));

  // 新規キーワードセット追加ボタン処理
  addKeywordBtn.addEventListener('click', () => {
    const newKeywords = keywordInputs.map(input => input.value.trim()).filter(Boolean);
    if (newKeywords.length === 0) return; // 空入力は無視

    chrome.storage.local.get('titleKeywordSets', (result) => {
      let list = result.titleKeywordSets || [];

      // 重複チェック
      if (list.some(k => JSON.stringify(k) === JSON.stringify(newKeywords))) {
        return; // 重複あれば追加しない
      }

      if (list.length >= 1000) {
        getLang(lang => showStatus('キーワード上限(1000)に達しました', 'red'));
        return;
      }

      list.push(newKeywords);
      chrome.storage.local.set({ titleKeywordSets: list }, () => {
        renderKeywordList();
        keywordInputs.forEach(input => input.value = '');
        getLang(lang => showStatus(texts[lang].addedKeyword, 'green'));
      });
    });
  });

  // エクスポートボタン動作（現在のタブの内容をエクスポート）
  exportBtn.addEventListener('click', () => {
    getLang(lang => {
      if (tabListBtn.classList.contains('active')) {
        chrome.storage.local.get('blockedChannels', (result) => {
          const data = JSON.stringify(result.blockedChannels || [], null, 2);
          downloadJSON(data, 'blocked_channels_backup.json');
          showStatus(texts[lang].exportList, 'green');
        });
      } else if (tabKeywordsBtn.classList.contains('active')) {
        chrome.storage.local.get('titleKeywordSets', (result) => {
          const data = JSON.stringify(result.titleKeywordSets || [], null, 2);
          downloadJSON(data, 'title_keyword_ng_backup.json');
          showStatus(texts[lang].exportKeywords, 'green');
        });
      } else {
        showStatus('', '');
      }
    });
  });

  // インポートボタン動作（ファイル選択ダイアログ表示）
  importBtn.addEventListener('click', () => fileInput.click());

  // ファイル読み込み・インポート処理
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        getLang(lang => {
          if (tabListBtn.classList.contains('active')) {
            if (!Array.isArray(json) || json.some(item => typeof item !== 'string')) {
              showStatus(texts[lang].importError, 'red');
              return;
            }
            chrome.storage.local.set({ blockedChannels: json }, () => {
              renderBlockList(searchInput.value);
              showStatus(texts[lang].importList, 'green');
            });
          } else if (tabKeywordsBtn.classList.contains('active')) {
            if (!Array.isArray(json) || json.some(set => !Array.isArray(set) || set.some(w => typeof w !== 'string'))) {
              showStatus(texts[lang].importError, 'red');
              return;
            }
            chrome.storage.local.set({ titleKeywordSets: json }, () => {
              renderKeywordList(keywordSearchInput.value);
              showStatus(texts[lang].importKeywords, 'green');
            });
          } else {
            showStatus('', '');
          }
        });
      } catch {
        getLang(lang => showStatus(texts[lang].importError, 'red'));
      }
    };

    reader.readAsText(file);
  });

  // ステータス表示
  function showStatus(msg, color) {
    status.textContent = msg;
    if (color === 'green') {
      status.style.backgroundColor = '#d4edda';
      status.style.color = '#155724';
      status.style.border = '1px solid #c3e6cb';
    } else if (color === 'red') {
      status.style.backgroundColor = '#f8d7da';
      status.style.color = '#721c24';
      status.style.border = '1px solid #f5c6cb';
    } else {
      status.style.backgroundColor = '';
      status.style.color = '';
      status.style.border = '';
    }
    status.style.padding = msg ? '8px' : '';
    status.style.borderRadius = msg ? '4px' : '';
    if (msg) {
      setTimeout(clearStatus, 3000);
    }
  }

  function clearStatus() {
    status.textContent = '';
    status.style.backgroundColor = '';
    status.style.color = '';
    status.style.border = '';
    status.style.padding = '';
    status.style.borderRadius = '';
  }

  // JSONダウンロード補助
  function downloadJSON(data, filename) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 初期描画
  renderBlockList();
  renderKeywordList();
  switchTab('list');
});

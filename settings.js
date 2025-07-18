/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

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

  // エクスポート・インポート用要素（分離ボタン対応）
  const exportChannelsBtn = document.getElementById('exportChannelsBtn');
  const importChannelsBtn = document.getElementById('importChannelsBtn');
  const exportKeywordsBtn = document.getElementById('exportKeywordsBtn');
  const importKeywordsBtn = document.getElementById('importKeywordsBtn');
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  let currentImportTarget = ''; // "channels" or "keywords"

  const texts = {
    ja: {
      noMatch: '該当するチャンネルはありません。',
      noMatchKeywords: '該当するキーワードセットはありません。',
      removed: 'チャンネルをリストから解除しました',
      removedKeyword: 'キーワードセットをリストから解除しました',
      addedKeyword: 'キーワードセットを追加しました',
      exportList: 'チャンネル名ブロックリストをエクスポートしました',
      exportKeywords: '動画タイトルフィルターをエクスポートしました',
      importList: 'チャンネル名ブロックリストをインポートしました',
      importKeywords: '動画タイトルフィルターをインポートしました',
      importError: 'インポート失敗（ファイル形式エラー）',
      removeBtn: '解除',
      removeBtnKeyword: '解除',
      keywordTooLong: 'キーワードは30文字以内で入力してください。',
    },
    en: {
      noMatch: 'No matching channels.',
      noMatchKeywords: 'No matching keyword sets.',
      removed: 'Channel removed from list',
      removedKeyword: 'Keyword set removed from list',
      addedKeyword: 'Keyword set added',
      exportList: 'Exported channel block list',
      exportKeywords: 'Exported title keyword NG list',
      importList: 'Imported channel block list',
      importKeywords: 'Imported title keyword NG list',
      importError: 'Import failed (invalid file format)',
      removeBtn: 'Remove',
      removeBtnKeyword: 'Remove',
      keywordTooLong: 'Please enter keywords up to 30 characters.',
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

  // キーワードセット削除
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

  // キーワード入力に文字数制限とエラーメッセージ表示を追加
  keywordInputs.forEach(input => {
    input.setAttribute('maxlength', '30'); // HTML属性でも制限

    input.addEventListener('input', () => {
      if (input.value.length > 30) {
        input.value = input.value.slice(0, 30);
        getLang(lang => showStatus(texts[lang].keywordTooLong, 'red'));
      }
    });
  });

  // 新規キーワードセット追加
  addKeywordBtn.addEventListener('click', () => {
    const newKeywords = keywordInputs.map(input => input.value.trim()).filter(Boolean);
    if (newKeywords.length === 0) return;

    chrome.storage.local.get('titleKeywordSets', (result) => {
      let list = result.titleKeywordSets || [];

      if (list.some(k => JSON.stringify(k) === JSON.stringify(newKeywords))) {
        return;
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

  // エクスポート
  exportChannelsBtn.addEventListener('click', () => {
    getLang(lang => {
      chrome.storage.local.get('blockedChannels', (result) => {
        const data = JSON.stringify(result.blockedChannels || [], null, 2);
        downloadJSON(data, 'blocked_channels_backup.json');
        showStatus(texts[lang].exportList, 'green');
      });
    });
  });

  exportKeywordsBtn.addEventListener('click', () => {
    getLang(lang => {
      chrome.storage.local.get('titleKeywordSets', (result) => {
        const data = JSON.stringify(result.titleKeywordSets || [], null, 2);
        downloadJSON(data, 'title_keyword_ng_backup.json');
        showStatus(texts[lang].exportKeywords, 'green');
      });
    });
  });

  // インポート
  importChannelsBtn.addEventListener('click', () => {
    currentImportTarget = 'channels';
    fileInput.click();
  });

  importKeywordsBtn.addEventListener('click', () => {
    currentImportTarget = 'keywords';
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        getLang(lang => {
          if (currentImportTarget === 'channels') {
            if (!Array.isArray(json) || json.some(item => typeof item !== 'string')) {
              showStatus(texts[lang].importError, 'red');
              return;
            }
            chrome.storage.local.set({ blockedChannels: json }, () => {
              renderBlockList(searchInput.value);
              showStatus(texts[lang].importList, 'green');
            });
          } else if (currentImportTarget === 'keywords') {
            if (!Array.isArray(json) || json.some(set => !Array.isArray(set) || set.some(w => typeof w !== 'string'))) {
              showStatus(texts[lang].importError, 'red');
              return;
            }
            chrome.storage.local.set({ titleKeywordSets: json }, () => {
              renderKeywordList(keywordSearchInput.value);
              showStatus(texts[lang].importKeywords, 'green');
            });
          }
        });
      } catch {
        getLang(lang => showStatus(texts[lang].importError, 'red'));
      }
    };
    reader.readAsText(file);
  });

  // ステータス表示
  function showStatus(msg, type) {
  status.textContent = msg;
  status.classList.remove('success', 'error');
  if (type === 'green') {
    status.classList.add('success');
  } else {
    status.classList.add('error');
  }
  status.style.display = 'block';
  setTimeout(clearStatus, 3000);
}

function clearStatus() {
  status.textContent = '';
  status.classList.remove('success', 'error');
  status.style.display = 'none';
}

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

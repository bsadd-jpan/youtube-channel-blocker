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
  const tabLanguageBtn = document.getElementById('tab-language'); // 追加
  const tabDonationBtn = document.getElementById('tab-donation');

  // セクション
  const sectionList = document.getElementById('section-list');
  const sectionKeywords = document.getElementById('section-keywords');
  const sectionImportExport = document.getElementById('section-import-export');
  const sectionLanguage = document.getElementById('section-language'); // 追加
  const sectionDonation = document.getElementById('section-donation');

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
  const exportChannelsBtn = document.getElementById('exportChannelsBtn');
  const importChannelsBtn = document.getElementById('importChannelsBtn');
  const exportKeywordsBtn = document.getElementById('exportKeywordsBtn');
  const importKeywordsBtn = document.getElementById('importKeywordsBtn');
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  // 言語選択要素
  const langRadioJa = document.getElementById('lang-ja');
  const langRadioEn = document.getElementById('lang-en');

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
      const lang = result.language === 'en' ? 'en' : 'ja';
      callback(lang);
    });
  }

  // 言語切替イベント
  function setLanguage(lang) {
    chrome.storage.local.set({ language: lang }, () => {
      renderBlockList();
      renderKeywordList();
    });
  }

  langRadioJa.addEventListener('change', () => setLanguage('ja'));
  langRadioEn.addEventListener('change', () => setLanguage('en'));

  // 言語UI初期化
  getLang((lang) => {
    if (lang === 'en') {
      langRadioEn.checked = true;
    } else {
      langRadioJa.checked = true;
    }
  });

  // タブ切替関数
  function switchTab(to) {
    tabListBtn.classList.toggle('active', to === 'list');
    tabKeywordsBtn.classList.toggle('active', to === 'keywords');
    tabImportExportBtn.classList.toggle('active', to === 'importExport');
    tabLanguageBtn.classList.toggle('active', to === 'language');
    tabDonationBtn.classList.toggle('active', to === 'donation');

    sectionList.style.display = to === 'list' ? 'block' : 'none';
    sectionKeywords.style.display = to === 'keywords' ? 'block' : 'none';
    sectionImportExport.style.display = to === 'importExport' ? 'block' : 'none';
    sectionLanguage.style.display = to === 'language' ? 'block' : 'none';
    sectionDonation.style.display = to === 'donation' ? 'block' : 'none';

    clearStatus();
  }

  tabListBtn.addEventListener('click', () => switchTab('list'));
  tabKeywordsBtn.addEventListener('click', () => switchTab('keywords'));
  tabImportExportBtn.addEventListener('click', () => switchTab('importExport'));
  tabLanguageBtn.addEventListener('click', () => switchTab('language'));
  tabDonationBtn.addEventListener('click', () => switchTab('donation'));

  // 非表示リスト描画
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

  searchInput.addEventListener('input', () => renderBlockList(searchInput.value));

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

  keywordSearchInput.addEventListener('input', () => renderKeywordList(keywordSearchInput.value));

  keywordInputs.forEach(input => {
    input.setAttribute('maxlength', '30');
    input.addEventListener('input', () => {
      if (input.value.length > 30) {
        input.value = input.value.slice(0, 30);
        getLang(lang => showStatus(texts[lang].keywordTooLong, 'red'));
      }
    });
  });

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

  function applyUIText(lang) {
  // タブ
  tabListBtn.textContent = lang === 'en' ? 'Block List' : '非表示リスト';
  tabKeywordsBtn.textContent = lang === 'en' ? 'Title Filter' : '動画タイトルフィルター';
  tabImportExportBtn.textContent = lang === 'en' ? 'Export/Import' : 'エクスポート／インポート';
  tabLanguageBtn.textContent = lang === 'en' ? 'Language' : '表示言語';
  tabDonationBtn.textContent = lang === 'en' ? '💛 Donate' : '💛 寄付';

  // セクション見出し・ラベルなど
  document.querySelector('#section-list h2').textContent = lang === 'en' ? 'Blocked Channel List' : '非表示リスト（チャンネル名）';
  searchInput.placeholder = lang === 'en' ? 'Search...' : '検索...';

  document.querySelector('#section-keywords h2').textContent = lang === 'en' ? 'Video Title Filter List' : '動画タイトルフィルターリスト';
  document.getElementById('keyword1').placeholder = lang === 'en' ? 'Keyword 1' : 'キーワード1';
  document.getElementById('keyword2').placeholder = lang === 'en' ? 'Keyword 2' : 'キーワード2';
  document.getElementById('keyword3').placeholder = lang === 'en' ? 'Keyword 3' : 'キーワード3';
  addKeywordBtn.textContent = lang === 'en' ? 'Add' : '追加';
  keywordSearchInput.placeholder = lang === 'en' ? 'Search...' : '検索...';

  document.querySelector('#section-import-export h2').textContent = lang === 'en' ? 'Export / Import' : 'エクスポート／インポート';
  document.querySelector('#section-import-export h3:nth-of-type(1)').textContent = lang === 'en' ? 'Channel List' : 'チャンネルリスト';
  exportChannelsBtn.textContent = lang === 'en' ? 'Export' : 'エクスポート';
  importChannelsBtn.textContent = lang === 'en' ? 'Import' : 'インポート';

  const h3Elements = document.querySelectorAll('#section-import-export h3');
  if (h3Elements.length >= 2) {
    h3Elements[0].textContent = lang === 'en' ? 'Channel List' : 'チャンネルリスト';
    h3Elements[1].textContent = lang === 'en' ? 'Title Filters' : '動画タイトルフィルター';
  } else {
    // console.warn('Expected at least 2 h3 elements under #section-import-export');
  }
  exportKeywordsBtn.textContent = lang === 'en' ? 'Export' : 'エクスポート';
  importKeywordsBtn.textContent = lang === 'en' ? 'Import' : 'インポート';

  document.querySelector('#section-language h2').textContent = lang === 'en' ? 'Language Setting' : '表示言語';
  document.querySelector('#section-language p').textContent = lang === 'en'
    ? 'Choose the language to use for the UI:'
    : 'UIに使用する言語を選択してください：';

  document.querySelector('#section-donation h2').textContent = lang === 'en'
    ? 'Support the Developer'
    : '開発者を応援する';
  document.querySelector('#section-donation p').textContent = lang === 'en'
    ? 'If you found this extension useful, please consider donating.'
    : 'この拡張機能が役に立ったと感じたら、寄付をご検討ください。';
  document.querySelector('#section-donation a').textContent = lang === 'en'
    ? 'Donate via PayPal'
    : 'PayPalで寄付';
}

// 言語変更時にも反映
function setLanguage(lang) {
  chrome.storage.local.set({ language: lang }, () => {
    applyUIText(lang);       // ★ UIに反映
    renderBlockList();
    renderKeywordList();
  });
}

// 初期描画に追加（langRadioの下あたり）
getLang((lang) => {
  if (lang === 'en') {
    langRadioEn.checked = true;
  } else {
    langRadioJa.checked = true;
  }
  applyUIText(lang); // ★ 初期UI反映
});

});

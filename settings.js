/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

// ============================================================
// settings.js - 設定画面のメインロジック
//
// 翻訳データは i18n.js に一元管理
// セクション別に整理:
//   1. DOM要素の取得
//   2. ユーティリティ関数
//   3. タブ切替
//   4. CRUDリスト管理ファクトリー
//   5. リストマネージャーの生成
//   6. 正規表現フィルター (IndexedDB + Render)
//   7. エクスポート / インポート（テーブル駆動）
//   8. ショート動画トグル
//   9. ホワイトリストバイパストグル
//  10. UIテキスト適用 (i18n)
//  11. 初期化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // 1. DOM要素の取得
  // ============================================================

  // タブボタン
  const tabListBtn = document.getElementById('tab-list');
  const tabKeywordsBtn = document.getElementById('tab-keywords');
  const tabChannelFilterBtn = document.getElementById('tab-channel-filter');
  const tabCommentsBtn = document.getElementById('tab-blocked-comments');
  const tabAdvancedSettingsBtn = document.getElementById('tab-advanced-settings');
  const tabImportExportBtn = document.getElementById('tab-import-export');
  const tabHideShortsBtn = document.getElementById('tab-hide-shorts');
  const tabLanguageBtn = document.getElementById('tab-language');
  const tabDonationBtn = document.getElementById('tab-donation');
  const tabHelpBtn = document.getElementById('tab-help');

  // ホワイトリストタブ
  const tabWhitelistBtn = document.getElementById('tab-whitelist');

  // セクション
  const sectionList = document.getElementById('section-list');
  const sectionKeywords = document.getElementById('section-keywords');
  const sectionChannelFilter = document.getElementById('section-channel-filter');
  const sectionBlockedComments = document.getElementById('section-blocked-comments');
  const sectionAdvancedSettings = document.getElementById('section-advanced-settings');
  const advancedSubtabs = document.getElementById('advancedSubtabs');
  const sectionImportExport = document.getElementById('section-import-export');
  const sectionLanguage = document.getElementById('section-language');
  const sectionHideShorts = document.getElementById('section-hide-shorts');
  const sectionHelp = document.getElementById('section-help');
  const sectionDonation = document.getElementById('section-donation');

  // ホワイトリストセクション
  const sectionWhitelist = document.getElementById('section-whitelist');
  const whitelistContainer = document.getElementById('whitelistContainer');
  const whitelistSearchInput = document.getElementById('whitelistSearchInput');
  const addWhitelistChannelBtn = document.getElementById('addWhitelistChannelBtn');
  const whitelistChannelInput = document.getElementById('whitelistChannelInput');

  // 非表示チャンネルリスト用
  const blockListContainer = document.getElementById('blockListContainer');
  const searchInput = document.getElementById('searchInput');
  const addBlockChannelBtn = document.getElementById('addBlockChannelBtn');
  const blockChannelInput = document.getElementById('blockChannelInput');

  // チャンネルNGフィルター用
  const channelFilterListContainer = document.getElementById('channelFilterListContainer');
  const channelFilterSearchInput = document.getElementById('channelFilterSearchInput');
  const addChannelFilterBtn = document.getElementById('addChannelFilterBtn');
  const channelFilterInputs = [
    document.getElementById('channelFilter1'),
    document.getElementById('channelFilter2'),
    document.getElementById('channelFilter3'),
  ];

  // タイトルNGフィルター用
  const keywordListContainer = document.getElementById('keywordListContainer');
  const keywordSearchInput = document.getElementById('keywordSearchInput');
  const addKeywordBtn = document.getElementById('addKeywordBtn');
  const keywordInputs = [
    document.getElementById('keyword1'),
    document.getElementById('keyword2'),
    document.getElementById('keyword3'),
  ];

  // コメント非表示リスト用
  const commentListContainer = document.getElementById('commentListContainer');
  const commentSearchInput = document.getElementById('commentSearchInput');
  const addCommentUserBtn = document.getElementById('addCommentUserBtn');
  const commentUserInput = document.getElementById('commentUserInput');

  // エクスポート・インポート用
  const exportChannelsBtn = document.getElementById('exportChannelsBtn');
  const importChannelsBtn = document.getElementById('importChannelsBtn');
  const exportTitleKeywordsBtn = document.getElementById('exportTitleKeywordsBtn');
  const importTitleKeywordsBtn = document.getElementById('importTitleKeywordsBtn');
  const exportChannelKeywordsBtn = document.getElementById('exportChannelKeywordsBtn');
  const importChannelKeywordsBtn = document.getElementById('importChannelKeywordsBtn');
  const exportBlockedCommentsBtn = document.getElementById('exportBlockedCommentsBtn');
  const importBlockedCommentsBtn = document.getElementById('importBlockedCommentsBtn');
  const exportWhitelistBtn = document.getElementById('exportWhitelistBtn');
  const importWhitelistBtn = document.getElementById('importWhitelistBtn');
  const fileInput = document.getElementById('fileInput');
  const status = document.getElementById('status');

  // 言語選択
  const langRadioJa = document.getElementById('lang-ja');
  const langRadioEn = document.getElementById('lang-en');

  // ショート動画トグル
  const hideShortsButton = document.getElementById('hideShortsButton');

  // ホワイトリストバイパストグル
  const whitelistBypassButton = document.getElementById('whitelistBypassButton');

  // ホワイトリストショート非表示トグル
  const whitelistHideShortsButton = document.getElementById('whitelistHideShortsButton');

  // ブロックポップアップトグル
  const showBlockPopupButton = document.getElementById('showBlockPopupButton');

  // ×ボタン表示トグル
  const showCloseButtonButton = document.getElementById('showCloseButtonButton');

  let currentImportTarget = '';

  // ============================================================
  // 2. ユーティリティ関数
  // ============================================================

  function showStatus(msg, type) {
    status.textContent = msg;
    status.classList.remove('success', 'error');
    status.classList.add(type === 'green' ? 'success' : 'error');
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

  // ============================================================
  // 3. タブ切替
  // ============================================================

  const TAB_MAP = {
    list:             { btn: tabListBtn,             section: sectionList },
    keywords:         { btn: tabKeywordsBtn,         section: sectionKeywords },
    channelFilter:    { btn: tabChannelFilterBtn,     section: sectionChannelFilter },
    blockedComments:  { btn: tabCommentsBtn,          section: sectionBlockedComments },
    advancedSettings: { btn: tabAdvancedSettingsBtn,  section: sectionAdvancedSettings },
    importExport:     { btn: tabImportExportBtn,      section: sectionImportExport },
    hideShorts:       { btn: tabHideShortsBtn,        section: sectionHideShorts },
    language:         { btn: tabLanguageBtn,          section: sectionLanguage },
    help:             { btn: tabHelpBtn,              section: sectionHelp },
    donation:         { btn: tabDonationBtn,          section: sectionDonation },
    whitelist:        { btn: tabWhitelistBtn,         section: sectionWhitelist },
  };

  function switchTab(to) {
    Object.entries(TAB_MAP).forEach(([key, { btn, section }]) => {
      btn.classList.toggle('active', key === to);
      section.style.display = key === to ? 'block' : 'none';
    });
    clearStatus();
  }

  // タブクリックイベント
  tabListBtn.addEventListener('click', () => switchTab('list'));
  tabKeywordsBtn.addEventListener('click', () => switchTab('keywords'));
  tabChannelFilterBtn.addEventListener('click', () => switchTab('channelFilter'));
  tabCommentsBtn.addEventListener('click', () => switchTab('blockedComments'));
  tabImportExportBtn.addEventListener('click', () => switchTab('importExport'));
  tabHideShortsBtn.addEventListener('click', () => switchTab('hideShorts'));
  tabLanguageBtn.addEventListener('click', () => switchTab('language'));
  tabDonationBtn.addEventListener('click', () => switchTab('donation'));
  tabHelpBtn.addEventListener('click', () => switchTab('help'));
  tabWhitelistBtn.addEventListener('click', () => switchTab('whitelist'));

  tabAdvancedSettingsBtn.addEventListener('click', () => {
    switchTab('advancedSettings');
    advancedSubtabs.style.display = 'block';
  });

  // 高度な設定以外のタブクリック時にサブタブを閉じる
  document.querySelectorAll('.tab').forEach(btn => {
    if (btn.id !== 'tab-advanced-settings') {
      btn.addEventListener('click', () => {
        advancedSubtabs.style.display = 'none';
      });
    }
  });

  // ============================================================
  // 4. CRUDリスト管理ファクトリー
  // ============================================================

  /**
   * シンプルな文字列リスト（ブロックリスト・コメント・ホワイトリスト）用の
   * CRUD管理オブジェクトを生成するファクトリー関数
   *
   * @param {Object} config
   * @param {string}      config.storageKey    - chrome.storage.local のキー
   * @param {HTMLElement}  config.container     - リスト表示先の ul/div 要素
   * @param {HTMLElement}  config.searchInput   - 検索入力フィールド
   * @param {HTMLElement}  config.addBtn        - 追加ボタン
   * @param {HTMLElement}  config.addInput      - 追加入力フィールド
   * @param {number}       config.limit         - リスト上限数
   * @param {number}       config.nameMaxLength - アイテム文字数上限
   * @param {Object}       config.i18nKeys      - 各操作の翻訳キーマップ
   * @returns {{ render: Function }}
   */
  function createSimpleListManager(config) {
    const { storageKey, container, searchInput, addBtn, addInput, limit, nameMaxLength, i18nKeys } = config;

    function render(filter = '') {
      chrome.storage.local.get(storageKey, (result) => {
        getCurrentLang((lang) => {
          const list = result[storageKey] || [];
          const filtered = list.filter(name => name.toLowerCase().includes(filter.toLowerCase()));
          container.innerHTML = '';

          if (filtered.length === 0) {
            const li = document.createElement('li');
            li.textContent = t(i18nKeys.noMatch, lang);
            container.appendChild(li);
            return;
          }

          filtered.forEach(name => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;

            const editBtn = document.createElement('button');
            editBtn.textContent = t('edit', lang);
            editBtn.className = 'editBtn';
            editBtn.style.marginLeft = '8px';

            const removeBtn = document.createElement('button');
            removeBtn.textContent = t('remove', lang);
            removeBtn.className = 'removeBtn';
            removeBtn.addEventListener('click', () => remove(name));

            const btnWrapper = document.createElement('span');
            btnWrapper.style.display = 'flex';
            btnWrapper.style.gap = '8px';
            btnWrapper.appendChild(editBtn);
            btnWrapper.appendChild(removeBtn);

            let editing = false;
            editBtn.addEventListener('click', () => {
              if (editing) return;
              editing = true;
              const input = document.createElement('input');
              input.type = 'text';
              input.value = name;
              input.style.flex = '1';
              input.maxLength = nameMaxLength;

              const saveBtn = document.createElement('button');
              saveBtn.textContent = t('save', lang);
              saveBtn.className = 'saveBtn';

              const cancelBtn = document.createElement('button');
              cancelBtn.textContent = t('cancel', lang);
              cancelBtn.className = 'cancelBtn';

              li.replaceChild(input, nameSpan);
              btnWrapper.replaceChild(cancelBtn, editBtn);
              btnWrapper.insertBefore(saveBtn, cancelBtn);

              saveBtn.onclick = () => {
                const newName = input.value.trim();
                if (!newName || newName === name) { cancelBtn.onclick(); return; }
                chrome.storage.local.get(storageKey, (res) => {
                  let list = res[storageKey] || [];
                  const idx = list.indexOf(name);
                  if (idx !== -1) {
                    list[idx] = newName;
                    chrome.storage.local.set({ [storageKey]: list }, () => {
                      render(searchInput.value);
                      getCurrentLang(lang => showStatus(t(i18nKeys.edited, lang), 'green'));
                    });
                  }
                });
              };
              cancelBtn.onclick = () => {
                li.replaceChild(nameSpan, input);
                btnWrapper.replaceChild(editBtn, saveBtn);
                btnWrapper.removeChild(cancelBtn);
                editing = false;
              };
            });

            li.appendChild(nameSpan);
            li.appendChild(btnWrapper);
            container.appendChild(li);
          });
        });
      });
    }

    function remove(name) {
      chrome.storage.local.get(storageKey, (result) => {
        let list = result[storageKey] || [];
        list = list.filter(item => item !== name);
        chrome.storage.local.set({ [storageKey]: list }, () => {
          render(searchInput.value);
          getCurrentLang(lang => showStatus(t(i18nKeys.removed, lang), 'green'));
        });
      });
    }

    addBtn.addEventListener('click', () => {
      const newItem = addInput.value.trim();
      if (!newItem) return;
      chrome.storage.local.get(storageKey, (result) => {
        let list = result[storageKey] || [];
        if (list.includes(newItem)) {
          getCurrentLang(lang => showStatus(t(i18nKeys.alreadyExists, lang), 'red'));
          return;
        }
        if (list.length >= limit) {
          getCurrentLang(lang => showStatus(t(i18nKeys.limitReached, lang), 'red'));
          return;
        }
        list.push(newItem);
        chrome.storage.local.set({ [storageKey]: list }, () => {
          render(searchInput.value);
          addInput.value = '';
          getCurrentLang(lang => showStatus(t(i18nKeys.added, lang), 'green'));
        });
      });
    });

    searchInput.addEventListener('input', () => render(searchInput.value));

    return { render };
  }

  /**
   * キーワードセットリスト（チャンネルNGフィルター・タイトルNGフィルター）用の
   * CRUD管理オブジェクトを生成するファクトリー関数
   *
   * @param {Object} config
   * @param {string}        config.storageKey    - chrome.storage.local のキー
   * @param {HTMLElement}    config.container     - リスト表示先の ul/div 要素
   * @param {HTMLElement}    config.searchInput   - 検索入力フィールド
   * @param {HTMLElement}    config.addBtn        - 追加ボタン
   * @param {HTMLElement[]}  config.filterInputs  - キーワード入力フィールド（3つ）
   * @param {number}         config.limit         - セット上限数
   * @param {number}         config.kwMaxLength   - キーワード文字数上限
   * @param {Object}         config.i18nKeys      - 各操作の翻訳キーマップ
   * @returns {{ render: Function }}
   */
  function createKeywordSetListManager(config) {
    const { storageKey, container, searchInput, addBtn, filterInputs, limit, kwMaxLength, i18nKeys } = config;

    function render(filter = '') {
      chrome.storage.local.get(storageKey, (result) => {
        getCurrentLang((lang) => {
          const list = result[storageKey] || [];
          const filtered = list.filter(set => set.join(' ').toLowerCase().includes(filter.toLowerCase()));
          container.innerHTML = '';

          if (filtered.length === 0) {
            const li = document.createElement('li');
            li.textContent = t(i18nKeys.noMatch, lang);
            container.appendChild(li);
            return;
          }

          filtered.forEach(set => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';

            const setSpan = document.createElement('span');
            setSpan.textContent = set.join(' ');

            const editBtn = document.createElement('button');
            editBtn.textContent = t('edit', lang);
            editBtn.className = 'editBtn';
            editBtn.style.marginLeft = '8px';

            const removeBtn = document.createElement('button');
            removeBtn.textContent = t('remove', lang);
            removeBtn.className = 'removeBtn';
            removeBtn.addEventListener('click', () => remove(set));

            const btnWrapper = document.createElement('span');
            btnWrapper.style.display = 'flex';
            btnWrapper.style.gap = '8px';
            btnWrapper.appendChild(editBtn);
            btnWrapper.appendChild(removeBtn);

            let editing = false;
            editBtn.addEventListener('click', () => {
              if (editing) return;
              editing = true;

              const inputs = [0, 1, 2].map(i => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = set[i] || '';
                input.style.width = '80px';
                input.maxLength = kwMaxLength;
                input.style.marginRight = '4px';
                return input;
              });

              const saveBtn = document.createElement('button');
              saveBtn.textContent = t('save', lang);
              saveBtn.className = 'saveBtn';

              const cancelBtn = document.createElement('button');
              cancelBtn.textContent = t('cancel', lang);
              cancelBtn.className = 'cancelBtn';

              const wrapper = document.createElement('span');
              inputs.forEach(input => wrapper.appendChild(input));
              li.replaceChild(wrapper, setSpan);
              btnWrapper.replaceChild(cancelBtn, editBtn);
              btnWrapper.insertBefore(saveBtn, cancelBtn);

              saveBtn.onclick = () => {
                const newSet = inputs.map(input => input.value.trim()).filter(Boolean);
                if (newSet.length === 0 || JSON.stringify(newSet) === JSON.stringify(set)) {
                  cancelBtn.onclick();
                  return;
                }
                chrome.storage.local.get(storageKey, (res) => {
                  let list = res[storageKey] || [];
                  const idx = list.findIndex(s => JSON.stringify(s) === JSON.stringify(set));
                  if (idx !== -1) {
                    list[idx] = newSet;
                    chrome.storage.local.set({ [storageKey]: list }, () => {
                      render(searchInput.value);
                      getCurrentLang(lang => showStatus(t(i18nKeys.edited, lang), 'green'));
                    });
                  }
                });
              };
              cancelBtn.onclick = () => {
                li.replaceChild(setSpan, li.firstChild);
                btnWrapper.replaceChild(editBtn, saveBtn);
                btnWrapper.removeChild(cancelBtn);
                editing = false;
              };
            });

            li.appendChild(setSpan);
            li.appendChild(btnWrapper);
            container.appendChild(li);
          });
        });
      });
    }

    function remove(targetSet) {
      chrome.storage.local.get(storageKey, (result) => {
        let list = result[storageKey] || [];
        list = list.filter(set => {
          if (set.length !== targetSet.length) return true;
          for (let i = 0; i < set.length; i++) {
            if (set[i] !== targetSet[i]) return true;
          }
          return false;
        });
        chrome.storage.local.set({ [storageKey]: list }, () => {
          render(searchInput.value);
          getCurrentLang(lang => showStatus(t(i18nKeys.removed, lang), 'green'));
        });
      });
    }

    filterInputs.forEach(input => {
      input.setAttribute('maxlength', String(kwMaxLength));
      input.addEventListener('input', () => {
        if (input.value.length > kwMaxLength) {
          input.value = input.value.slice(0, kwMaxLength);
          getCurrentLang(lang => showStatus(t(i18nKeys.tooLong, lang), 'red'));
        }
      });
    });

    addBtn.addEventListener('click', () => {
      const newKeywords = filterInputs.map(input => input.value.trim()).filter(Boolean);
      if (newKeywords.length === 0) return;
      chrome.storage.local.get(storageKey, (result) => {
        let list = result[storageKey] || [];
        if (list.some(k => JSON.stringify(k) === JSON.stringify(newKeywords))) return;
        if (list.length >= limit) {
          getCurrentLang(lang => showStatus(t(i18nKeys.limitReached, lang), 'red'));
          return;
        }
        list.push(newKeywords);
        chrome.storage.local.set({ [storageKey]: list }, () => {
          render();
          filterInputs.forEach(input => input.value = '');
          getCurrentLang(lang => showStatus(t(i18nKeys.added, lang), 'green'));
        });
      });
    });

    searchInput.addEventListener('input', () => render(searchInput.value));

    return { render };
  }

  // ============================================================
  // 5. リストマネージャーの生成
  // ============================================================

  /** 非表示チャンネルリスト */
  const blockListManager = createSimpleListManager({
    storageKey: STORAGE_KEYS.BLOCKED_CHANNELS,
    container: blockListContainer,
    searchInput: searchInput,
    addBtn: addBlockChannelBtn,
    addInput: blockChannelInput,
    limit: LIMITS.BLOCK_LIST,
    nameMaxLength: LIMITS.CHANNEL_NAME_LENGTH,
    i18nKeys: {
      noMatch: 'noMatch',
      removed: 'removed',
      edited: 'channelEdited',
      added: 'channelAdded',
      alreadyExists: 'channelAlreadyBlocked',
      limitReached: 'listLimitReached',
    },
  });

  /** チャンネルNGフィルター */
  const channelFilterManager = createKeywordSetListManager({
    storageKey: STORAGE_KEYS.CHANNEL_KEYWORD_SETS,
    container: channelFilterListContainer,
    searchInput: channelFilterSearchInput,
    addBtn: addChannelFilterBtn,
    filterInputs: channelFilterInputs,
    limit: LIMITS.KEYWORD_SETS,
    kwMaxLength: LIMITS.CHANNEL_KW_LENGTH,
    i18nKeys: {
      noMatch: 'noMatchChannelFilter',
      removed: 'channelFilterRemoved',
      edited: 'channelFilterEdited',
      added: 'channelFilterAdded',
      limitReached: 'channelFilterLimit',
      tooLong: 'keywordTooLong10',
    },
  });

  /** タイトルNGフィルター */
  const titleFilterManager = createKeywordSetListManager({
    storageKey: STORAGE_KEYS.TITLE_KEYWORD_SETS,
    container: keywordListContainer,
    searchInput: keywordSearchInput,
    addBtn: addKeywordBtn,
    filterInputs: keywordInputs,
    limit: LIMITS.KEYWORD_SETS,
    kwMaxLength: LIMITS.TITLE_KW_LENGTH,
    i18nKeys: {
      noMatch: 'noMatchKeywords',
      removed: 'removedKeyword',
      edited: 'keywordEdited',
      added: 'addedKeyword',
      limitReached: 'keywordLimit',
      tooLong: 'keywordTooLong30',
    },
  });

  /** 非表示コメントユーザー */
  const commentListManager = createSimpleListManager({
    storageKey: STORAGE_KEYS.BLOCKED_COMMENTS,
    container: commentListContainer,
    searchInput: commentSearchInput,
    addBtn: addCommentUserBtn,
    addInput: commentUserInput,
    limit: LIMITS.COMMENT_LIST,
    nameMaxLength: LIMITS.CHANNEL_NAME_LENGTH,
    i18nKeys: {
      noMatch: 'noMatchComments',
      removed: 'removedComment',
      edited: 'commentUserEdited',
      added: 'commentUserAdded',
      alreadyExists: 'userAlreadyBlocked',
      limitReached: 'listLimitReached',
    },
  });

  /** ホワイトリスト */
  const whitelistManager = createSimpleListManager({
    storageKey: STORAGE_KEYS.WHITELISTED_CHANNELS,
    container: whitelistContainer,
    searchInput: whitelistSearchInput,
    addBtn: addWhitelistChannelBtn,
    addInput: whitelistChannelInput,
    limit: LIMITS.WHITELIST,
    nameMaxLength: LIMITS.CHANNEL_NAME_LENGTH,
    i18nKeys: {
      noMatch: 'noMatchWhitelist',
      removed: 'whitelistRemoved',
      edited: 'whitelistEdited',
      added: 'whitelistAdded',
      alreadyExists: 'whitelistAlreadyExists',
      limitReached: 'whitelistLimitReached',
    },
  });

  // ============================================================
  // 6. 正規表現フィルター (IndexedDB + Render)
  // ============================================================

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('RegexListsDB', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('regexLists')) {
          db.createObjectStore('regexLists', { keyPath: 'type' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getRegexList(type) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('regexLists', 'readonly');
      const store = tx.objectStore('regexLists');
      const req = store.get(type);
      req.onsuccess = () => resolve(req.result?.list || []);
      req.onerror = () => reject(req.error);
    });
  }

  async function setRegexList(type, list) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('regexLists', 'readwrite');
      const store = tx.objectStore('regexLists');
      const req = store.put({ type, list });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function renderRegexList(type, container, filter = '') {
    const list = await getRegexList(type);
    getCurrentLang((lang) => {
      container.innerHTML = '';
      const filtered = list.filter(pattern => pattern.toLowerCase().includes(filter.toLowerCase()));

      if (!filtered.length) {
        const li = document.createElement('li');
        li.textContent = t('noMatchRegex', lang);
        container.appendChild(li);
        return;
      }

      filtered.forEach((pattern) => {
        const listIdx = list.indexOf(pattern);

        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        const span = document.createElement('span');
        span.textContent = pattern;

        const editBtn = document.createElement('button');
        editBtn.textContent = t('edit', lang);
        editBtn.className = 'editBtn';
        editBtn.style.marginLeft = '8px';

        const removeBtn = document.createElement('button');
        removeBtn.textContent = t('remove', lang);
        removeBtn.className = 'removeBtn';

        const btnWrapper = document.createElement('span');
        btnWrapper.style.display = 'flex';
        btnWrapper.style.gap = '8px';
        btnWrapper.append(editBtn, removeBtn);

        li.append(span, btnWrapper);
        container.appendChild(li);

        // 編集
        editBtn.onclick = () => {
          const input = document.createElement('input');
          input.type = 'text';
          input.value = pattern;
          input.style.flex = '1';

          const saveBtn = document.createElement('button');
          saveBtn.textContent = t('save', lang);
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = t('cancel', lang);

          li.replaceChild(input, span);
          btnWrapper.replaceChild(cancelBtn, editBtn);
          btnWrapper.insertBefore(saveBtn, cancelBtn);

          saveBtn.onclick = async () => {
            const newPattern = input.value.trim();
            if (!newPattern) return cancelBtn.onclick();
            if (newPattern.length > LIMITS.REGEX_LENGTH) {
              alert(t('regexMaxLength', lang));
              return;
            }
            if (listIdx !== -1) list[listIdx] = newPattern;
            await setRegexList(type, list);
            await renderRegexList(type, container, filter);
          };

          cancelBtn.onclick = () => {
            li.replaceChild(span, input);
            btnWrapper.replaceChild(editBtn, saveBtn);
            btnWrapper.removeChild(cancelBtn);
          };
        };

        // 削除
        removeBtn.onclick = async () => {
          if (listIdx !== -1) list.splice(listIdx, 1);
          await setRegexList(type, list);
          await renderRegexList(type, container, filter);
        };
      });
    });
  }

  // 高度な設定サブタブ
  document.querySelectorAll('.advanced-subtab').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.advanced-subtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('#sidebar .tab').forEach(t => t.classList.remove('active'));
      const advancedTab = document.getElementById('tab-advanced-settings');
      if (advancedTab) advancedTab.classList.add('active');

      const target = btn.getAttribute('data-target');
      const tabContent = document.getElementById('advancedTabContent');
      tabContent.innerHTML = '';

      getCurrentLang(async (lang) => {
        const h2 = document.createElement('h2');
        h2.textContent = target === 'channelRegex' ? t('channelRegexTab', lang) : t('titleRegexTab', lang);
        h2.id = 'regexSectionTitle';
        tabContent.appendChild(h2);

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = t('search', lang);
        searchInput.id = 'regexSearchInput';
        tabContent.appendChild(searchInput);

        const addInput = document.createElement('input');
        addInput.type = 'text';
        addInput.placeholder = t('regexPattern', lang);
        addInput.id = 'regexAddInput';
        tabContent.appendChild(addInput);

        const addBtn = document.createElement('button');
        addBtn.textContent = t('add', lang);
        addBtn.id = 'regexAddBtn';
        tabContent.appendChild(addBtn);

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        ul.style.border = '1px solid #ddd';
        ul.style.borderRadius = '6px';
        ul.style.overflow = 'hidden';
        tabContent.appendChild(ul);

        searchInput.oninput = () => renderRegexList(target, ul, searchInput.value);

        addBtn.onclick = async () => {
          const pattern = addInput.value.trim();
          if (!pattern) return;
          if (pattern.length > LIMITS.REGEX_LENGTH) {
            alert(t('regexMaxLength', lang));
            return;
          }
          const list = await getRegexList(target);
          if (list.length >= LIMITS.REGEX_LIST) {
            alert(t('regexListLimit', lang));
            return;
          }
          if (!list.includes(pattern)) {
            list.push(pattern);
            await setRegexList(target, list);
            await renderRegexList(target, ul, searchInput.value);
            addInput.value = '';
          }
        };

        await renderRegexList(target, ul);
      });
    });
  });

  // ============================================================
  // 7. エクスポート / インポート（テーブル駆動）
  // ============================================================

  /**
   * エクスポート/インポート設定テーブル
   * 各リストのストレージキー、バリデーション、上限、描画関数を一元定義
   */
  const IMPORT_EXPORT_CONFIG = {
    channels: {
      storageKey: STORAGE_KEYS.BLOCKED_CHANNELS,
      filename: 'blocked_channels_backup.json',
      exportBtn: exportChannelsBtn,
      importBtn: importChannelsBtn,
      validate: (json) => Array.isArray(json) && json.every(item => typeof item === 'string'),
      limit: LIMITS.BLOCK_LIST,
      render: () => blockListManager.render(searchInput.value),
      exportMsg: 'exportList',
      importMsg: 'importList',
    },
    keywords: {
      storageKey: STORAGE_KEYS.TITLE_KEYWORD_SETS,
      filename: 'title_keyword_ng_backup.json',
      exportBtn: exportTitleKeywordsBtn,
      importBtn: importTitleKeywordsBtn,
      validate: (json) => Array.isArray(json) && json.every(set => Array.isArray(set) && set.every(w => typeof w === 'string')),
      limit: null,
      render: () => titleFilterManager.render(keywordSearchInput.value),
      exportMsg: 'exportKeywords',
      importMsg: 'importKeywords',
    },
    channelKeywords: {
      storageKey: STORAGE_KEYS.CHANNEL_KEYWORD_SETS,
      filename: 'channel_keyword_ng_backup.json',
      exportBtn: exportChannelKeywordsBtn,
      importBtn: importChannelKeywordsBtn,
      validate: (json) => Array.isArray(json) && json.every(set => Array.isArray(set) && set.every(w => typeof w === 'string')),
      limit: null,
      render: () => channelFilterManager.render(channelFilterSearchInput.value),
      exportMsg: 'exportChannelKeywords',
      importMsg: 'importChannelKeywords',
    },
    blockedComments: {
      storageKey: STORAGE_KEYS.BLOCKED_COMMENTS,
      filename: 'blocked_comments_users_backup.json',
      exportBtn: exportBlockedCommentsBtn,
      importBtn: importBlockedCommentsBtn,
      validate: (json) => Array.isArray(json) && json.every(item => typeof item === 'string'),
      limit: LIMITS.COMMENT_LIST,
      render: () => commentListManager.render(commentSearchInput.value),
      exportMsg: 'exportBlockedComments',
      importMsg: 'importBlockedComments',
    },
    whitelist: {
      storageKey: STORAGE_KEYS.WHITELISTED_CHANNELS,
      filename: 'whitelist_backup.json',
      exportBtn: exportWhitelistBtn,
      importBtn: importWhitelistBtn,
      validate: (json) => Array.isArray(json) && json.every(item => typeof item === 'string'),
      limit: LIMITS.WHITELIST,
      render: () => whitelistManager.render(whitelistSearchInput.value),
      exportMsg: 'exportWhitelist',
      importMsg: 'importWhitelist',
    },
  };

  // エクスポートハンドラ一括登録
  Object.values(IMPORT_EXPORT_CONFIG).forEach(({ storageKey, filename, exportBtn, exportMsg }) => {
    exportBtn.addEventListener('click', () => {
      chrome.storage.local.get(storageKey, (result) => {
        downloadJSON(JSON.stringify(result[storageKey] || [], null, 2), filename);
        getCurrentLang(lang => showStatus(t(exportMsg, lang), 'green'));
      });
    });
  });

  // インポートハンドラ一括登録
  const importTargetKeys = Object.keys(IMPORT_EXPORT_CONFIG);
  Object.values(IMPORT_EXPORT_CONFIG).forEach(({ importBtn }, index) => {
    importBtn.addEventListener('click', () => {
      currentImportTarget = importTargetKeys[index];
      fileInput.click();
    });
  });

  // ファイル読み込みハンドラ（テーブル駆動）
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const config = IMPORT_EXPORT_CONFIG[currentImportTarget];
        if (!config) return;
        getCurrentLang(lang => {
          if (!config.validate(json)) {
            showStatus(t('importError', lang), 'red'); return;
          }
          if (config.limit && json.length > config.limit) {
            showStatus(t('importListLimit', lang), 'red'); return;
          }
          chrome.storage.local.set({ [config.storageKey]: json }, () => {
            config.render();
            showStatus(t(config.importMsg, lang), 'green');
          });
        });
      } catch {
        getCurrentLang(lang => showStatus(t('importError', lang), 'red'));
      }
    };
    reader.readAsText(file);
  });

  // ============================================================
  // 8. ショート動画トグル
  // ============================================================

  function updateShortsButtonState(enabled, lang) {
    hideShortsButton.classList.toggle('on', enabled);
    hideShortsButton.classList.toggle('off', !enabled);
    hideShortsButton.textContent = enabled ? t('shortsFilterOn', lang) : t('shortsFilterOff', lang);
  }

  hideShortsButton.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEYS.HIDE_SHORTS_FLAG, (result) => {
      const next = !result[STORAGE_KEYS.HIDE_SHORTS_FLAG];
      chrome.storage.local.set({ [STORAGE_KEYS.HIDE_SHORTS_FLAG]: next }, () => {
        getCurrentLang(lang => {
          updateShortsButtonState(next, lang);
          showStatus(next ? t('hideShortsEnabled', lang) : t('hideShortsDisabled', lang), 'green');
        });
      });
    });
  });

  chrome.storage.local.get(STORAGE_KEYS.HIDE_SHORTS_FLAG, (result) => {
    getCurrentLang(lang => updateShortsButtonState(!!result[STORAGE_KEYS.HIDE_SHORTS_FLAG], lang));
  });

  // ============================================================
  // 9. ホワイトリストバイパストグル
  // ============================================================

  /**
   * ホワイトリストバイパスボタンの表示状態を更新する
   * @param {boolean} enabled - バイパス有効かどうか
   * @param {string} lang - 言語コード
   */
  function updateWhitelistBypassState(enabled, lang) {
    whitelistBypassButton.classList.toggle('on', enabled);
    whitelistBypassButton.classList.toggle('off', !enabled);
    whitelistBypassButton.textContent = enabled ? t('whitelistBypassAllOn', lang) : t('whitelistBypassAllOff', lang);
  }

  /** ホワイトリストバイパストグルボタン */
  whitelistBypassButton.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEYS.WHITELIST_BYPASS_ALL, (result) => {
      const next = !result[STORAGE_KEYS.WHITELIST_BYPASS_ALL];
      chrome.storage.local.set({ [STORAGE_KEYS.WHITELIST_BYPASS_ALL]: next }, () => {
        getCurrentLang(lang => {
          updateWhitelistBypassState(next, lang);
          showStatus(next ? t('whitelistBypassEnabled', lang) : t('whitelistBypassDisabled', lang), 'green');
        });
      });
    });
  });

  /** ホワイトリストバイパスボタンの初期状態読み込み */
  chrome.storage.local.get(STORAGE_KEYS.WHITELIST_BYPASS_ALL, (result) => {
    getCurrentLang(lang => updateWhitelistBypassState(result[STORAGE_KEYS.WHITELIST_BYPASS_ALL] !== false, lang));
  });

  // ============================================================
  // 9-2. ホワイトリストショート非表示トグル
  // ============================================================

  /**
   * ホワイトリストショート非表示ボタンの表示状態を更新する
   * @param {boolean} enabled - ショート非表示が有効かどうか
   * @param {string} lang - 言語コード
   */
  function updateWhitelistHideShortsState(enabled, lang) {
    whitelistHideShortsButton.classList.toggle('on', enabled);
    whitelistHideShortsButton.classList.toggle('off', !enabled);
    whitelistHideShortsButton.textContent = enabled ? t('whitelistHideShortsOn', lang) : t('whitelistHideShortsOff', lang);
  }

  /** ホワイトリストショート非表示トグルボタン */
  whitelistHideShortsButton.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEYS.WHITELIST_HIDE_SHORTS, (result) => {
      const next = !result[STORAGE_KEYS.WHITELIST_HIDE_SHORTS];
      chrome.storage.local.set({ [STORAGE_KEYS.WHITELIST_HIDE_SHORTS]: next }, () => {
        getCurrentLang(lang => {
          updateWhitelistHideShortsState(next, lang);
          showStatus(next ? t('whitelistHideShortsEnabled', lang) : t('whitelistHideShortsDisabled', lang), 'green');
        });
      });
    });
  });

  /** ホワイトリストショート非表示ボタンの初期状態読み込み */
  chrome.storage.local.get(STORAGE_KEYS.WHITELIST_HIDE_SHORTS, (result) => {
    getCurrentLang(lang => updateWhitelistHideShortsState(!!result[STORAGE_KEYS.WHITELIST_HIDE_SHORTS], lang));
  });

  // ============================================================
  // 9-3. ブロックポップアップトグル
  // ============================================================

  function updateShowBlockPopupState(enabled, lang) {
    showBlockPopupButton.classList.toggle('on', enabled);
    showBlockPopupButton.classList.toggle('off', !enabled);
    showBlockPopupButton.textContent = enabled ? t('showBlockPopupOn', lang) : t('showBlockPopupOff', lang);
  }

  showBlockPopupButton.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEYS.SHOW_BLOCK_POPUP, (result) => {
      const current = result[STORAGE_KEYS.SHOW_BLOCK_POPUP] !== false;
      const next = !current;
      chrome.storage.local.set({ [STORAGE_KEYS.SHOW_BLOCK_POPUP]: next }, () => {
        getCurrentLang(lang => {
          updateShowBlockPopupState(next, lang);
          showStatus(next ? t('showBlockPopupEnabled', lang) : t('showBlockPopupDisabled', lang), 'green');
        });
      });
    });
  });

  chrome.storage.local.get(STORAGE_KEYS.SHOW_BLOCK_POPUP, (result) => {
    getCurrentLang(lang => updateShowBlockPopupState(result[STORAGE_KEYS.SHOW_BLOCK_POPUP] !== false, lang));
  });

  // ============================================================
  // 9-4. ×ボタン表示トグル
  // ============================================================

  function updateShowCloseButtonState(enabled, lang) {
    showCloseButtonButton.classList.toggle('on', enabled);
    showCloseButtonButton.classList.toggle('off', !enabled);
    showCloseButtonButton.textContent = enabled ? t('showCloseButtonOn', lang) : t('showCloseButtonOff', lang);
  }

  showCloseButtonButton.addEventListener('click', () => {
    chrome.storage.local.get(STORAGE_KEYS.SHOW_CLOSE_BUTTON, (result) => {
      const current = result[STORAGE_KEYS.SHOW_CLOSE_BUTTON] !== false;
      const next = !current;
      chrome.storage.local.set({ [STORAGE_KEYS.SHOW_CLOSE_BUTTON]: next }, () => {
        getCurrentLang(lang => {
          updateShowCloseButtonState(next, lang);
          showStatus(next ? t('showCloseButtonEnabled', lang) : t('showCloseButtonDisabled', lang), 'green');
        });
      });
    });
  });

  chrome.storage.local.get(STORAGE_KEYS.SHOW_CLOSE_BUTTON, (result) => {
    getCurrentLang(lang => updateShowCloseButtonState(result[STORAGE_KEYS.SHOW_CLOSE_BUTTON] !== false, lang));
  });

  // ============================================================
  // 10. UIテキスト適用 (i18n)
  // ============================================================

  function applyUIText(lang) {
    // タブ
    tabListBtn.textContent = t('tabBlockList', lang);
    tabChannelFilterBtn.textContent = t('tabChannelFilter', lang);
    tabKeywordsBtn.textContent = t('tabTitleFilter', lang);
    tabCommentsBtn.textContent = t('tabBlockedComments', lang);
    tabAdvancedSettingsBtn.textContent = t('tabAdvancedSettings', lang);
    tabAdvancedSettingsBtn.title = t('tabAdvancedSettingsTitle', lang);
    tabImportExportBtn.textContent = t('tabImportExport', lang);
    tabHideShortsBtn.textContent = t('tabHideShorts', lang);
    tabLanguageBtn.textContent = t('tabLanguage', lang);
    tabDonationBtn.textContent = t('tabDonation', lang);
    tabHelpBtn.textContent = t('tabHelp', lang);
    tabWhitelistBtn.textContent = t('tabWhitelist', lang);

    // セクション見出し
    document.querySelector('#section-list h2').textContent = t('sectionBlockedChannelList', lang);
    searchInput.placeholder = t('search', lang);
    document.querySelector('#section-channel-filter h2').textContent = t('sectionChannelFilterList', lang);
    blockChannelInput.placeholder = t('channelName', lang);
    addBlockChannelBtn.textContent = t('add', lang);
    document.getElementById('channelFilter1').placeholder = t('keyword1', lang);
    document.getElementById('channelFilter2').placeholder = t('keyword2', lang);
    document.getElementById('channelFilter3').placeholder = t('keyword3', lang);
    addChannelFilterBtn.textContent = t('add', lang);
    channelFilterSearchInput.placeholder = t('search', lang);

    document.querySelector('#section-keywords h2').textContent = t('sectionTitleFilterList', lang);
    document.getElementById('keyword1').placeholder = t('keyword1', lang);
    document.getElementById('keyword2').placeholder = t('keyword2', lang);
    document.getElementById('keyword3').placeholder = t('keyword3', lang);
    addKeywordBtn.textContent = t('add', lang);
    keywordSearchInput.placeholder = t('search', lang);

    document.querySelector('#section-blocked-comments h2').textContent = t('sectionBlockedCommentUsers', lang);
    commentUserInput.placeholder = t('username', lang);
    addCommentUserBtn.textContent = t('add', lang);
    commentSearchInput.placeholder = t('search', lang);

    // ホワイトリストセクション
    document.querySelector('#section-whitelist h2').textContent = t('sectionWhitelist', lang);
    whitelistSearchInput.placeholder = t('search', lang);
    whitelistChannelInput.placeholder = t('channelName', lang);
    addWhitelistChannelBtn.textContent = t('add', lang);

    // 高度な設定サブタブ
    document.getElementById('channelRegex').textContent = t('channelRegexTab', lang);
    document.getElementById('titleRegex').textContent = t('titleRegexTab', lang);

    // エクスポート／インポートセクション
    document.querySelector('#section-import-export h2').textContent = t('sectionExportImport', lang);
    document.querySelector('#section-import-export p').textContent = t('backupRecommendation', lang);
    const h3Elements = document.querySelectorAll('#section-import-export h3');
    h3Elements[0].textContent = t('ieBlockList', lang);
    h3Elements[1].textContent = t('ieChannelFilter', lang);
    h3Elements[2].textContent = t('ieTitleFilter', lang);
    h3Elements[3].textContent = t('ieCommentList', lang);
    h3Elements[4].textContent = t('ieWhitelist', lang);
    exportChannelsBtn.textContent = t('exportBtn', lang);
    importChannelsBtn.textContent = t('importBtn', lang);
    exportChannelKeywordsBtn.textContent = t('exportBtn', lang);
    importChannelKeywordsBtn.textContent = t('importBtn', lang);
    exportTitleKeywordsBtn.textContent = t('exportBtn', lang);
    importTitleKeywordsBtn.textContent = t('importBtn', lang);
    exportBlockedCommentsBtn.textContent = t('exportBtn', lang);
    importBlockedCommentsBtn.textContent = t('importBtn', lang);
    exportWhitelistBtn.textContent = t('exportBtn', lang);
    importWhitelistBtn.textContent = t('importBtn', lang);

    // 表示/非表示トグル
    document.querySelector('#section-hide-shorts h2').textContent = t('sectionShowHideToggle', lang);
    document.getElementById('toggle-group-shorts').textContent = t('toggleGroupShorts', lang);
    document.getElementById('toggle-group-whitelist').textContent = t('toggleGroupWhitelist', lang);
    document.getElementById('toggle-group-ui').textContent = t('toggleGroupUI', lang);
    chrome.storage.local.get([STORAGE_KEYS.HIDE_SHORTS_FLAG, STORAGE_KEYS.WHITELIST_BYPASS_ALL, STORAGE_KEYS.WHITELIST_HIDE_SHORTS, STORAGE_KEYS.SHOW_BLOCK_POPUP, STORAGE_KEYS.SHOW_CLOSE_BUTTON], (result) => {
      updateShortsButtonState(!!result[STORAGE_KEYS.HIDE_SHORTS_FLAG], lang);
      updateWhitelistBypassState(result[STORAGE_KEYS.WHITELIST_BYPASS_ALL] !== false, lang);
      updateWhitelistHideShortsState(!!result[STORAGE_KEYS.WHITELIST_HIDE_SHORTS], lang);
      updateShowBlockPopupState(result[STORAGE_KEYS.SHOW_BLOCK_POPUP] !== false, lang);
      updateShowCloseButtonState(result[STORAGE_KEYS.SHOW_CLOSE_BUTTON] !== false, lang);
    });

    // 言語セクション
    document.querySelector('#section-language h2').textContent = t('sectionLanguageSetting', lang);
    document.querySelector('#section-language p').textContent = t('languagePrompt', lang);

    // ヘルプセクション
    document.querySelector('#section-help h2').textContent = t('sectionHelp', lang);
    document.querySelector('#help-message-1').textContent = t('helpIntro', lang);
    document.querySelector('#help-message-3').textContent = t('helpDisclaimer', lang);

    // アコーディオンタイトル
    document.querySelector('#accordion-title-1').textContent = t('accordionBlockList', lang);
    document.querySelector('#accordion-title-2').textContent = t('accordionChannelFilter', lang);
    document.querySelector('#accordion-title-3').textContent = t('accordionTitleFilter', lang);
    document.querySelector('#accordion-title-4').textContent = t('accordionBlockedComments', lang);
    document.querySelector('#accordion-title-5').textContent = t('accordionExportImport', lang);
    document.querySelector('#accordion-title-6').textContent = t('accordionShowHide', lang);
    document.querySelector('#accordion-title-7').textContent = t('accordionConvertCB', lang);
    document.querySelector('#accordion-title-8').textContent = t('accordionRegex', lang);
    document.querySelector('#accordion-title-9').textContent = t('accordionWhitelist', lang);

    // 共通説明文
    document.querySelectorAll('.common-description-1').forEach(el => {
      el.textContent = t('commonListDescription', lang);
    });

    // 非表示チャンネルリストヘルプ
    document.querySelector('#hide-channel-description-1').textContent = t('helpBlockChannel1', lang);
    document.querySelector('#hide-channel-description-2').textContent = t('helpBlockChannel2', lang);
    document.querySelector('#hide-channel-description-3').textContent = t('helpBlockChannel3', lang);
    document.querySelector('#hide-channel-description-4').textContent = t('helpBlockChannel4', lang);
    document.querySelector('#hide-channel-description-5').textContent = t('helpBlockChannel5', lang);

    // チャンネルNGフィルターヘルプ
    document.querySelector('#channel-filter-description-1').textContent = t('helpChannelFilter1', lang);
    document.querySelector('#channel-filter-description-2').textContent = t('helpChannelFilter2', lang);
    document.querySelector('#channel-filter-description-3').textContent = t('helpChannelFilter3', lang);

    // タイトルNGフィルターヘルプ
    document.querySelector('#video-title-filter-description-1').textContent = t('helpTitleFilter1', lang);
    document.querySelector('#video-title-filter-description-2').textContent = t('helpTitleFilter2', lang);
    document.querySelector('#video-title-filter-description-3').textContent = t('helpTitleFilter3', lang);
    document.querySelector('#video-title-filter-description-4').textContent = t('helpTitleFilter4', lang);
    document.querySelector('#video-title-filter-description-5').textContent = t('helpTitleFilter5', lang);
    document.querySelector('#video-title-filter-description-6').textContent = t('helpTitleFilter6', lang);

    // コメントユーザーヘルプ
    document.querySelector('#hide-comment-description-1').textContent = t('helpComment1', lang);
    document.querySelector('#hide-comment-description-2').textContent = t('helpComment2', lang);
    document.querySelector('#hide-comment-description-3').textContent = t('helpComment3', lang);
    document.querySelector('#hide-comment-description-4').textContent = t('helpComment4', lang);

    // 正規表現フィルターヘルプ
    document.querySelector('#regex-filter-description-1').textContent = t('helpRegex1', lang);
    document.querySelector('#regex-filter-description-2').textContent = t('helpRegex2', lang);
    document.querySelector('#regex-filter-example-1').textContent = t('helpRegexEx1', lang);
    document.querySelector('#regex-filter-example-2').textContent = t('helpRegexEx2', lang);
    document.querySelector('#regex-filter-example-3').textContent = t('helpRegexEx3', lang);
    document.querySelector('#regex-filter-example-4').textContent = t('helpRegexEx4', lang);
    document.querySelector('#regex-filter-example-5').textContent = t('helpRegexEx5', lang);
    document.querySelector('#regex-filter-example-6').textContent = t('helpRegexEx6', lang);

    // エクスポート／インポートヘルプ
    document.querySelector('#export-import-description-1').textContent = t('helpExportImport1', lang);
    document.querySelector('#export-import-description-2').textContent = t('helpExportImport2', lang);
    document.querySelector('#export-import-description-3').textContent = t('helpExportImport3', lang);
    document.querySelector('#export-import-description-4').textContent = t('helpExportImport4', lang);

    // 表示/非表示ヘルプ
    document.querySelector('#show-hide-description-1').textContent = t('helpShowHide1', lang);
    document.querySelector('#show-hide-description-2').textContent = t('helpShowHide2', lang);
    document.querySelector('#show-hide-description-3').textContent = t('helpShowHide3', lang);
    document.querySelector('#show-hide-description-4').textContent = t('helpShowHide4', lang);
    document.querySelector('#show-hide-description-5').textContent = t('helpShowHide5', lang);

    // Channel Blockerインポートヘルプ
    document.querySelector('#import-from-cb-description-1').textContent = t('helpCBImport1', lang);

    // ホワイトリストヘルプ
    document.querySelector('#whitelist-description-1').textContent = t('helpWhitelist1', lang);
    document.querySelector('#whitelist-description-2').textContent = t('helpWhitelist2', lang);
    document.querySelector('#whitelist-description-3').textContent = t('helpWhitelist3', lang);

    // 寄付セクション
    document.querySelector('#donation-h2').textContent = t('donationTitle', lang);
    document.querySelector('#donation-message-1').textContent = t('donationMsg1', lang);
    document.querySelector('#donation-message-2').textContent = t('donationMsg2', lang);
    document.querySelector('#donation-message-3').textContent = t('donationMsg3', lang);
    document.querySelector('#paypal-button').textContent = t('paypalButton', lang);
    document.querySelector('#kofi-button').textContent = t('kofiButton', lang);
    document.querySelector('#promotion-h2').textContent = t('promotionTitle', lang);
    document.querySelector('#donation-message-4').textContent = t('donationMsg4', lang);
    document.querySelector('#donation-message-6').textContent = t('donationMsg6', lang);
    document.querySelector('#donation-message-6-1').innerHTML = t('donationTwitter', lang);
    document.querySelector('#donation-message-6-2').innerHTML = t('donationBlog', lang);
    document.querySelector('#donation-message-6-3').innerHTML = t('donationGithub', lang);
    document.querySelector('#donation-message-7').textContent = t('donationMsg7', lang);
  }

  // ============================================================
  // 言語切替
  // ============================================================

  function setLanguage(lang) {
    chrome.storage.local.set({ [STORAGE_KEYS.LANGUAGE]: lang }, () => {
      applyUIText(lang);
      blockListManager.render();
      titleFilterManager.render();
      commentListManager.render();
      whitelistManager.render();
    });
  }

  langRadioJa.addEventListener('change', () => setLanguage('ja'));
  langRadioEn.addEventListener('change', () => setLanguage('en'));

  // アコーディオン処理
  document.querySelectorAll('.accordion-title').forEach((button) => {
    button.addEventListener('click', () => {
      const content = button.nextElementSibling;
      const isOpen = content.style.display === 'block';
      document.querySelectorAll('.accordion-content').forEach((c) => c.style.display = 'none');
      content.style.display = isOpen ? 'none' : 'block';
    });
  });

  // ============================================================
  // 11. 初期化
  // ============================================================

  blockListManager.render();
  titleFilterManager.render();
  channelFilterManager.render();
  commentListManager.render();
  whitelistManager.render();
  switchTab('list');

  getCurrentLang((lang) => {
    if (lang === 'en') langRadioEn.checked = true;
    else langRadioJa.checked = true;
    applyUIText(lang);
  });

});

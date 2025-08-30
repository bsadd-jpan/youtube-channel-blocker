/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

document.addEventListener('DOMContentLoaded', () => {
  // タブボタン
  const tabListBtn = document.getElementById('tab-list');
  const tabKeywordsBtn = document.getElementById('tab-keywords');
  const tabChannelFilterBtn = document.getElementById('tab-channel-filter'); // ★追加
  const tabImportExportBtn = document.getElementById('tab-import-export');
  const tabLanguageBtn = document.getElementById('tab-language'); // 追加
  const tabHideShortsBtn = document.getElementById('tab-hide-shorts');  // 新規追加
  const tabDonationBtn = document.getElementById('tab-donation');


  // セクション
  const sectionList = document.getElementById('section-list');
  const sectionKeywords = document.getElementById('section-keywords');
  const sectionChannelFilter = document.getElementById('section-channel-filter'); // ★追加
  const sectionBlockedComments = document.getElementById('section-blocked-comments');
  const sectionImportExport = document.getElementById('section-import-export');
  const sectionLanguage = document.getElementById('section-language'); // 追加
  const sectionHideShorts = document.getElementById('section-hide-shorts'); // 新規追加
  const sectionDonation = document.getElementById('section-donation');

  // チャンネルフィルターリスト用要素
  const channelFilterListContainer = document.getElementById('channelFilterListContainer');
  const channelFilterSearchInput = document.getElementById('channelFilterSearchInput');

  // 非表示リスト用要素
  const blockListContainer = document.getElementById('blockListContainer');
  const searchInput = document.getElementById('searchInput');
  const addBlockChannelBtn = document.getElementById('addBlockChannelBtn'); // 追加
  const blockChannelInput = document.getElementById('blockChannelInput');   // 追加

  // コメント非表示リスト用要素
  const tabCommentsBtn = document.getElementById('tab-blocked-comments');
  const commentListContainer = document.getElementById('commentListContainer');
  const commentSearchInput = document.getElementById('commentSearchInput');

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
  const exportTitleKeywordsBtn = document.getElementById('exportTitleKeywordsBtn');
  const importTitleKeywordsBtn = document.getElementById('importTitleKeywordsBtn');
  const exportChannelKeywordsBtn = document.getElementById('exportChannelKeywordsBtn');
  const importChannelKeywordsBtn = document.getElementById('importChannelKeywordsBtn');
  const exportBlockedCommentsBtn = document.getElementById('exportBlockedCommentsBtn');
  const importBlockedCommentsBtn = document.getElementById('importBlockedCommentsBtn');
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
      removed: 'チャンネルをリストから削除しました',
      removedKeyword: 'キーワードセットをリストから削除しました',
      addedKeyword: 'キーワードセットを追加しました',
      exportList: 'チャンネルNGフィルターをエクスポートしました',
      exportKeywords: '動画タイトルNGフィルターをエクスポートしました',
      exportChannelKeywords: 'チャンネルNGフィルターをエクスポートしました',
      importList: 'チャンネルNGフィルターをインポートしました',
      importKeywords: '動画タイトルNGフィルターをインポートしました',
      importChannelKeywords: 'チャンネルNGフィルターをインポートしました',
      importBlockedComments: '非表示コメントユーザーリストをインポートしました',
      exportBlockedComments: '非表示コメントユーザーリストをエクスポートしました',
      importError: 'インポート失敗（ファイル形式エラー）',
      removeBtn: '削除',
      removeBtnKeyword: '削除',
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
      exportChannelKeywords: 'Exported channel filter set',
      importList: 'Imported channel block list',
      importKeywords: 'Imported title keyword NG list',
      importChannelKeywords: 'Imported channel filter set',
      importBlockedComments: 'Imported blocked comment users list',
      exportBlockedComments: 'Exported blocked comment users list',
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
      renderBlockedCommentUsers();
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
    tabChannelFilterBtn.classList.toggle('active', to === 'channelFilter'); // ★追加
    tabCommentsBtn.classList.toggle('active', to === 'blockedComments');
    tabImportExportBtn.classList.toggle('active', to === 'importExport');
    tabHideShortsBtn.classList.toggle('active', to === 'hideShorts');  // 追加
    tabLanguageBtn.classList.toggle('active', to === 'language');
    tabDonationBtn.classList.toggle('active', to === 'donation');

    sectionList.style.display = to === 'list' ? 'block' : 'none';
    sectionKeywords.style.display = to === 'keywords' ? 'block' : 'none';
    sectionChannelFilter.style.display = to === 'channelFilter' ? 'block' : 'none'; // ★追加
    sectionBlockedComments.style.display = to === 'blockedComments' ? 'block' : 'none';
    sectionImportExport.style.display = to === 'importExport' ? 'block' : 'none';
    sectionHideShorts.style.display = to === 'hideShorts' ? 'block' : 'none';  // 追加
    sectionLanguage.style.display = to === 'language' ? 'block' : 'none';
    sectionDonation.style.display = to === 'donation' ? 'block' : 'none';

    clearStatus();
  }

  // タブボタンのクリックイベント追加
  tabHideShortsBtn.addEventListener('click', () => switchTab('hideShorts'));

  // hideShortsFlagの切り替え用のUI制御を追加（ボタンバージョン）
  const hideShortsButton = document.getElementById('hideShortsButton');

  // ボタンの状態を更新
  function updateButtonState(enabled, lang) {
    hideShortsButton.classList.toggle('on', enabled);
    hideShortsButton.classList.toggle('off', !enabled);

    hideShortsButton.textContent = lang === 'en'
      ? (enabled ? 'Shorts Filter: ON' : 'Shorts Filter: OFF')
      : (enabled ? 'ショート動画フィルター：有効' : 'ショート動画フィルター：無効');
  }

  // ボタンクリックでトグル
  hideShortsButton.addEventListener('click', () => {
    chrome.storage.local.get('hideShortsFlag', (result) => {
      const current = !!result.hideShortsFlag;
      const next = !current;

      chrome.storage.local.set({ hideShortsFlag: next }, () => {
        getLang(lang => {
          updateButtonState(next, lang);
          showStatus(
            next
              ? (lang === 'en' ? 'Hide Shorts enabled' : 'ショート動画非表示を有効にしました')
              : (lang === 'en' ? 'Hide Shorts disabled' : 'ショート動画非表示を無効にしました'),
            'green'
          );
        });
      });
    });
  });

  // ページロード時に設定を読み込んで反映
  chrome.storage.local.get('hideShortsFlag', (result) => {
    getLang(lang => {
      updateButtonState(!!result.hideShortsFlag, lang);
    });
  });


  tabListBtn.addEventListener('click', () => switchTab('list'));
  tabKeywordsBtn.addEventListener('click', () => switchTab('keywords'));
  tabChannelFilterBtn.addEventListener('click', () => switchTab('channelFilter')); // ★追加
  tabCommentsBtn.addEventListener('click', () => switchTab('blockedComments'));
  tabImportExportBtn.addEventListener('click', () => switchTab('importExport'));
  tabLanguageBtn.addEventListener('click', () => switchTab('language'));
  tabDonationBtn.addEventListener('click', () => switchTab('donation'));

  // チャンネルフィルターリスト描画
  function renderChannelFilterList(filter = '') {
    chrome.storage.local.get('channelKeywordSets', (result) => {
      getLang((lang) => {
        const list = result.channelKeywordSets || [];
        const filtered = list.filter(set => {
          const combined = set.join(' ').toLowerCase();
          return combined.includes(filter.toLowerCase());
        });

        channelFilterListContainer.innerHTML = '';

        if (filtered.length === 0) {
          const li = document.createElement('li');
          li.textContent = lang === 'en' ? 'No matching channel keyword sets.' : '該当するチャンネルフィルターセットはありません。';
          channelFilterListContainer.appendChild(li);
          return;
        }

        filtered.forEach(set => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';

          // キーワードセット表示 or 編集用input群
          const setSpan = document.createElement('span');
          setSpan.textContent = set.join(' ');

          // 編集ボタン
          const editBtn = document.createElement('button');
          editBtn.textContent = lang === 'en' ? 'Edit' : '編集';
          editBtn.className = 'editBtn';
          editBtn.style.marginLeft = '8px';

          let editing = false;

          editBtn.addEventListener('click', () => {
            if (editing) return;
            editing = true;
            // input群とボタン群を生成
            const inputs = [0, 1, 2].map(i => {
              const input = document.createElement('input');
              input.type = 'text';
              input.value = set[i] || '';
              input.style.width = '80px';
              input.maxLength = 10;
              input.style.marginRight = '4px';
              return input;
            });

            const saveBtn = document.createElement('button');
            saveBtn.textContent = lang === 'en' ? 'Save' : '保存';
            saveBtn.className = 'saveBtn';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = lang === 'en' ? 'Cancel' : 'キャンセル';
            cancelBtn.className = 'cancelBtn';

            // 入力欄とボタンを置き換え
            li.replaceChild(
              (() => {
                const wrapper = document.createElement('span');
                inputs.forEach(input => wrapper.appendChild(input));
                return wrapper;
              })(),
              setSpan
            );
            btnWrapper.replaceChild(cancelBtn, editBtn);
            btnWrapper.insertBefore(saveBtn, cancelBtn);

            saveBtn.onclick = () => {
              const newSet = inputs.map(input => input.value.trim()).filter(Boolean);
              if (newSet.length === 0 || JSON.stringify(newSet) === JSON.stringify(set)) {
                cancelBtn.onclick();
                return;
              }
              chrome.storage.local.get('channelKeywordSets', (result) => {
                let list = result.channelKeywordSets || [];
                const idx = list.findIndex(s => JSON.stringify(s) === JSON.stringify(set));
                if (idx !== -1) {
                  list[idx] = newSet;
                  chrome.storage.local.set({ channelKeywordSets: list }, () => {
                    renderChannelFilterList(channelFilterSearchInput.value);
                    getLang(lang => showStatus(lang === 'en' ? 'Channel keyword set edited' : 'チャンネルフィルターセットを編集しました', 'green'));
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

          // Removeボタン
          const btn = document.createElement('button');
          btn.textContent = lang === 'en' ? 'Remove' : '削除';
          btn.className = 'removeBtn';
          btn.addEventListener('click', () => removeChannelKeywordSet(set));

          // ボタンを右端に配置
          const btnWrapper = document.createElement('span');
          btnWrapper.style.display = 'flex';
          btnWrapper.style.gap = '8px';
          btnWrapper.appendChild(editBtn);
          btnWrapper.appendChild(btn);

          li.appendChild(setSpan);
          li.appendChild(btnWrapper);
          channelFilterListContainer.appendChild(li);
        });
      });
    });
  }

  function removeChannelKeywordSet(targetSet) {
    chrome.storage.local.get('channelKeywordSets', (result) => {
      let list = result.channelKeywordSets || [];
      list = list.filter(set => {
        if (set.length !== targetSet.length) return true;
        for (let i = 0; i < set.length; i++) {
          if (set[i] !== targetSet[i]) return true;
        }
        return false;
      });
      chrome.storage.local.set({ channelKeywordSets: list }, () => {
        renderChannelFilterList(channelFilterSearchInput.value);
        getLang(lang => showStatus(lang === 'en' ? 'Channel keyword set removed' : 'チャンネルフィルターセットを削除しました', 'green'));
      });
    });
  }

  // 追加ボタン
  const addChannelFilterBtn = document.getElementById('addChannelFilterBtn');
  const channelFilterInputs = [
    document.getElementById('channelFilter1'),
    document.getElementById('channelFilter2'),
    document.getElementById('channelFilter3'),
  ];

  addChannelFilterBtn.addEventListener('click', () => {
    const newKeywords = channelFilterInputs.map(input => input.value.trim()).filter(Boolean);
    if (newKeywords.length === 0) return;

    chrome.storage.local.get('channelKeywordSets', (result) => {
      let list = result.channelKeywordSets || [];

      if (list.some(k => JSON.stringify(k) === JSON.stringify(newKeywords))) {
        return;
      }

      if (list.length >= 5000) {
        getLang(lang => showStatus(lang === 'en'
          ? 'Channel filter set limit (5000) reached'
          : 'チャンネルフィルターセット上限(5000)に達しました', 'red'));
        return;
      }

      list.push(newKeywords);
      chrome.storage.local.set({ channelKeywordSets: list }, () => {
        renderChannelFilterList();
        channelFilterInputs.forEach(input => input.value = '');
        getLang(lang => showStatus(lang === 'en'
          ? 'Channel filter set added'
          : 'チャンネルフィルターセットを追加しました', 'green'));
      });
    });
  });

  channelFilterInputs.forEach(input => {
    input.setAttribute('maxlength', '10');
    input.addEventListener('input', () => {
      if (input.value.length > 10) {
        input.value = input.value.slice(0, 10);
        getLang(lang => showStatus(lang === 'en'
          ? 'Please enter keywords up to 10 characters.'
          : 'キーワードは10文字以内で入力してください。', 'red'));
      }
    });
  });


  channelFilterSearchInput.addEventListener('input', () => renderChannelFilterList(channelFilterSearchInput.value));

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
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';

          // 左側：チャンネル名 or 編集用input
          const nameSpan = document.createElement('span');
          nameSpan.textContent = name;

          // 編集ボタン
          const editBtn = document.createElement('button');
          editBtn.textContent = lang === 'en' ? 'Edit' : '編集';
          editBtn.className = 'editBtn';
          editBtn.style.marginLeft = '8px';

          let editing = false;

          editBtn.addEventListener('click', () => {
            if (editing) return;
            editing = true;
            // inputとボタン群を生成
            const input = document.createElement('input');
            input.type = 'text';
            input.value = name;
            input.style.flex = '1';
            input.maxLength = 100;

            const saveBtn = document.createElement('button');
            saveBtn.textContent = lang === 'en' ? 'Save' : '保存';
            saveBtn.className = 'saveBtn';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = lang === 'en' ? 'Cancel' : 'キャンセル';
            cancelBtn.className = 'cancelBtn';

            // 入力欄とボタンを置き換え
            li.replaceChild(input, nameSpan);
            btnWrapper.replaceChild(cancelBtn, editBtn);
            btnWrapper.insertBefore(saveBtn, cancelBtn);

            saveBtn.onclick = () => {
              const newName = input.value.trim();
              if (!newName || newName === name) {
                cancelBtn.onclick();
                return;
              }
              chrome.storage.local.get('blockedChannels', (result) => {
                let list = result.blockedChannels || [];
                const idx = list.indexOf(name);
                if (idx !== -1) {
                  list[idx] = newName;
                  chrome.storage.local.set({ blockedChannels: list }, () => {
                    renderBlockList(searchInput.value);
                    getLang(lang => showStatus(lang === 'en' ? 'Channel name edited' : 'チャンネル名を編集しました', 'green'));
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

          // Removeボタン
          const btn = document.createElement('button');
          btn.textContent = texts[lang].removeBtn;
          btn.className = 'removeBtn';
          btn.addEventListener('click', () => removeChannel(name));

          // ボタンを右端に配置
          const btnWrapper = document.createElement('span');
          btnWrapper.style.display = 'flex';
          btnWrapper.style.gap = '8px';
          btnWrapper.appendChild(editBtn);
          btnWrapper.appendChild(btn);

          li.appendChild(nameSpan);
          li.appendChild(btnWrapper);
          blockListContainer.appendChild(li);
        });
      });
    });
  }

  // 追加ボタンのイベント
  addBlockChannelBtn.addEventListener('click', () => {
    const newChannel = blockChannelInput.value.trim();
    if (!newChannel) return;
    chrome.storage.local.get('blockedChannels', (result) => {
      let list = result.blockedChannels || [];
      if (list.includes(newChannel)) {
        getLang(lang => showStatus(lang === 'en'
          ? 'Channel already in block list'
          : 'すでにリストに存在します', 'red'));
        return;
      }
      if (list.length >= 10000) {
        getLang(lang => showStatus(lang === 'en'
          ? 'Block list limit reached'
          : 'リスト上限に達しました', 'red'));
        return;
      }
      list.push(newChannel);
      chrome.storage.local.set({ blockedChannels: list }, () => {
        renderBlockList(searchInput.value);
        blockChannelInput.value = '';
        getLang(lang => showStatus(lang === 'en'
          ? 'Channel added to block list'
          : 'リストに追加しました', 'green'));
      });
    });
  });

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

  // --- 動画タイトルフィルターリスト描画 ---
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
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';

          // キーワードセット表示 or 編集用input群
          const setSpan = document.createElement('span');
          setSpan.textContent = set.join(' ');

          // 編集ボタン
          const editBtn = document.createElement('button');
          editBtn.textContent = lang === 'en' ? 'Edit' : '編集';
          editBtn.className = 'editBtn';
          editBtn.style.marginLeft = '8px';

          let editing = false;

          editBtn.addEventListener('click', () => {
            if (editing) return;
            editing = true;
            // input群とボタン群を生成
            const inputs = [0, 1, 2].map(i => {
              const input = document.createElement('input');
              input.type = 'text';
              input.value = set[i] || '';
              input.style.width = '80px';
              input.maxLength = 30;
              input.style.marginRight = '4px';
              return input;
            });

            const saveBtn = document.createElement('button');
            saveBtn.textContent = lang === 'en' ? 'Save' : '保存';
            saveBtn.className = 'saveBtn';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = lang === 'en' ? 'Cancel' : 'キャンセル';
            cancelBtn.className = 'cancelBtn';

            // 入力欄とボタンを置き換え
            li.replaceChild(
              (() => {
                const wrapper = document.createElement('span');
                inputs.forEach(input => wrapper.appendChild(input));
                return wrapper;
              })(),
              setSpan
            );
            btnWrapper.replaceChild(cancelBtn, editBtn);
            btnWrapper.insertBefore(saveBtn, cancelBtn);

            saveBtn.onclick = () => {
              const newSet = inputs.map(input => input.value.trim()).filter(Boolean);
              if (newSet.length === 0 || JSON.stringify(newSet) === JSON.stringify(set)) {
                cancelBtn.onclick();
                return;
              }
              chrome.storage.local.get('titleKeywordSets', (result) => {
                let list = result.titleKeywordSets || [];
                const idx = list.findIndex(s => JSON.stringify(s) === JSON.stringify(set));
                if (idx !== -1) {
                  list[idx] = newSet;
                  chrome.storage.local.set({ titleKeywordSets: list }, () => {
                    renderKeywordList(keywordSearchInput.value);
                    getLang(lang => showStatus(lang === 'en' ? 'Keyword set edited' : 'キーワードセットを編集しました', 'green'));
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

          // Removeボタン
          const btn = document.createElement('button');
          btn.textContent = texts[lang].removeBtnKeyword;
          btn.className = 'removeBtn';
          btn.addEventListener('click', () => removeKeywordSet(set));

          // ボタンを右端に配置
          const btnWrapper = document.createElement('span');
          btnWrapper.style.display = 'flex';
          btnWrapper.style.gap = '8px';
          btnWrapper.appendChild(editBtn);
          btnWrapper.appendChild(btn);

          li.appendChild(setSpan);
          li.appendChild(btnWrapper);
          keywordListContainer.appendChild(li);
        });
      });
    });
  }

  // --- コメントユーザー非表示リスト描画 ---
  function renderBlockedCommentUsers(filter = '') {
    chrome.storage.local.get('blockedComments', (result) => {
      getLang(lang => {
        const list = result.blockedComments || [];
        const filtered = list.filter(name => name.toLowerCase().includes(filter.toLowerCase()));

        commentListContainer.innerHTML = '';

        if (filtered.length === 0) {
          const li = document.createElement('li');
          li.textContent = texts[lang].noMatchComments || (lang === 'en' ? 'No matching users' : '一致するユーザーはありません');
          commentListContainer.appendChild(li);
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
          editBtn.textContent = lang === 'en' ? 'Edit' : '編集';
          editBtn.className = 'editBtn';
          editBtn.style.marginLeft = '8px';

          let editing = false;

          editBtn.addEventListener('click', () => {
            if (editing) return;
            editing = true;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = name;
            input.style.flex = '1';
            input.maxLength = 100;

            const saveBtn = document.createElement('button');
            saveBtn.textContent = lang === 'en' ? 'Save' : '保存';
            saveBtn.className = 'saveBtn';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = lang === 'en' ? 'Cancel' : 'キャンセル';
            cancelBtn.className = 'cancelBtn';

            li.replaceChild(input, nameSpan);
            btnWrapper.replaceChild(cancelBtn, editBtn);
            btnWrapper.insertBefore(saveBtn, cancelBtn);

            saveBtn.onclick = () => {
              const newName = input.value.trim();
              if (!newName || newName === name) { cancelBtn.onclick(); return; }
              chrome.storage.local.get('blockedComments', (result) => {
                let list = result.blockedComments || [];
                const idx = list.indexOf(name);
                if (idx !== -1) {
                  list[idx] = newName;
                  chrome.storage.local.set({ blockedComments: list }, () => {
                    renderBlockedCommentUsers(commentSearchInput.value);
                    getLang(lang => showStatus(lang === 'en' ? 'User edited' : 'ユーザー名を編集しました', 'green'));
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

          const removeBtn = document.createElement('button');
          removeBtn.textContent = texts[lang].removeBtn || (lang === 'en' ? 'Remove' : '削除');
          removeBtn.className = 'removeBtn';
          removeBtn.addEventListener('click', () => removeBlockedCommentUser(name));

          const btnWrapper = document.createElement('span');
          btnWrapper.style.display = 'flex';
          btnWrapper.style.gap = '8px';
          btnWrapper.appendChild(editBtn);
          btnWrapper.appendChild(removeBtn);

          li.appendChild(nameSpan);
          li.appendChild(btnWrapper);
          commentListContainer.appendChild(li);
        });
      });
    });
  }

  // コメントユーザー追加
  addCommentUserBtn.addEventListener('click', () => {
    const newUser = commentUserInput.value.trim();
    if (!newUser) return;

    chrome.storage.local.get('blockedComments', (result) => {
      let list = result.blockedComments || [];
      if (list.includes(newUser)) {
        getLang(lang => showStatus(lang === 'en' ? 'User already blocked' : 'すでにリストに存在します', 'red'));
        return;
      }
      if (list.length >= 10000) {
        getLang(lang => showStatus(lang === 'en' ? 'Block list limit reached' : 'リスト上限に達しました', 'red'));
        return;
      }
      list.push(newUser);
      chrome.storage.local.set({ blockedComments: list }, () => {
        renderBlockedCommentUsers(commentSearchInput.value);
        commentUserInput.value = '';
        getLang(lang => showStatus(lang === 'en' ? 'User added to block list' : 'ユーザーをリストに追加しました', 'green'));
      });
    });
  });

  // コメントユーザー削除
  function removeBlockedCommentUser(name) {
    chrome.storage.local.get('blockedComments', (result) => {
      let list = result.blockedComments || [];
      list = list.filter(item => item !== name);
      chrome.storage.local.set({ blockedComments: list }, () => {
        renderBlockedCommentUsers(commentSearchInput.value);
        getLang(lang => showStatus(texts[lang].removedComment || (lang === 'en' ? 'User removed' : 'ユーザーを削除しました'), 'green'));
      });
    });
  }

  // 検索
  commentSearchInput.addEventListener('input', () => renderBlockedCommentUsers(commentSearchInput.value));

  // 初期描画
  renderBlockedCommentUsers();


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

  // キーワード入力の最大文字数制限30文字
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

      if (list.length >= 5000) {
        getLang(lang => showStatus('キーワード上限(5000)に達しました', 'red'));
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

  // エクスポート処理一覧
  exportChannelsBtn.addEventListener('click', () => {
    getLang(lang => {
      chrome.storage.local.get('blockedChannels', (result) => {
        const data = JSON.stringify(result.blockedChannels || [], null, 2);
        downloadJSON(data, 'blocked_channels_backup.json');
        showStatus(texts[lang].exportList, 'green');
      });
    });
  });

  exportTitleKeywordsBtn.addEventListener('click', () => {
    getLang(lang => {
      chrome.storage.local.get('titleKeywordSets', (result) => {
        const data = JSON.stringify(result.titleKeywordSets || [], null, 2);
        downloadJSON(data, 'title_keyword_ng_backup.json');
        showStatus(texts[lang].exportKeywords, 'green');
      });
    });
  });

  exportChannelKeywordsBtn.addEventListener('click', () => {
    getLang(lang => {
      chrome.storage.local.get('channelKeywordSets', (result) => {
        const data = JSON.stringify(result.channelKeywordSets || [], null, 2);
        downloadJSON(data, 'channel_keyword_ng_backup.json');
        showStatus(texts[lang].exportChannelKeywords, 'green');
      });
    });
  });

  exportBlockedCommentsBtn.addEventListener('click', () => {
    getLang(lang => {
      chrome.storage.local.get('blockedComments', (result) => {
        const data = JSON.stringify(result.blockedComments || [], null, 2);
        downloadJSON(data, 'blocked_comments_users_backup.json');
        showStatus(texts[lang].exportBlockedComments, 'green');
      });
    });
  });

  // ツイートボタンの設定
  // document.addEventListener("DOMContentLoaded", () => {
  //   const tweetBtn = document.getElementById("tweet-support-button");
  //   if (tweetBtn) {
  //     tweetBtn.addEventListener("click", () => {
  //       const defaultText = "Good work #YouTubeChannelBlocker";
  //       const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(defaultText);
  //       window.open(url, "_blank", "width=600,height=400");
  //     });
  //   }
  // });

  importChannelsBtn.addEventListener('click', () => {
    currentImportTarget = 'channels';
    fileInput.click();
  });

  importTitleKeywordsBtn.addEventListener('click', () => {
    currentImportTarget = 'keywords';
    fileInput.click();
  });

  importChannelKeywordsBtn.addEventListener('click', () => {
    currentImportTarget = 'channelKeywords';
    fileInput.click();
  });

  importBlockedCommentsBtn.addEventListener('click', () => {
    currentImportTarget = 'blockedComments';
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
            // ★ 10000件制限を追加
            if (json.length > 10000) {
              showStatus(lang === 'en'
                ? 'The list limit of 10,000 entries has been reached. Import cannot be completed.'
                : 'リスト上限(10000)に達しました。インポートできません。', 'red');
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
          } else if (currentImportTarget === 'channelKeywords') {
            if (!Array.isArray(json) || json.some(set => !Array.isArray(set) || set.some(w => typeof w !== 'string'))) {
              showStatus(texts[lang].importError, 'red');
              return;
            }
            chrome.storage.local.set({ channelKeywordSets: json }, () => {
              renderChannelFilterList(channelFilterSearchInput.value);
              showStatus(texts[lang].importChannelKeywords, 'green');
            });
          } else if (currentImportTarget === 'blockedComments') {
            if (!Array.isArray(json) || json.some(item => typeof item !== 'string')) {
              showStatus(texts[lang].importError, 'red');
              return;
            }
            if (json.length > 10000) {
              showStatus(lang === 'en'
                ? 'The list limit of 10,000 entries has been reached. Import cannot be completed.'
                : 'リスト上限(10000)に達しました。インポートできません。', 'red');
              return;
            }
            chrome.storage.local.set({ blockedComments: json }, () => {
              renderBlockedCommentUsers(commentSearchInput.value);
              showStatus(texts[lang].exportBlockedComments, 'green');
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
  renderChannelFilterList();
  renderBlockedCommentUsers();

  function applyUIText(lang) {
    // タブ
    tabListBtn.textContent = lang === 'en' ? 'Block Channel List' : '非表示チャンネルリスト';
    tabChannelFilterBtn.textContent = lang === 'en' ? 'Channel Filter' : 'チャンネルNGフィルター';
    tabKeywordsBtn.textContent = lang === 'en' ? 'Title Filter' : 'タイトルNGフィルター';
    tabCommentsBtn.textContent = lang === 'en' ? 'Blocked Comment Users List' : '非表示コメントユーザーリスト';
    tabImportExportBtn.textContent = lang === 'en' ? 'Export/Import' : 'エクスポート／インポート';
    tabHideShortsBtn.textContent = lang === 'en' ? 'Show/Hide Toggle' : '表示／非表示切替';
    tabLanguageBtn.textContent = lang === 'en' ? 'Language' : '言語（Language）';
    tabDonationBtn.textContent = lang === 'en' ? '💛 Support Developer' : '💛 開発者を応援';


    // セクション見出し・ラベルなど
    document.querySelector('#section-list h2').textContent = lang === 'en' ? 'Blocked Channel List' : '非表示チャンネルリスト';
    searchInput.placeholder = lang === 'en' ? 'Search...' : '検索...';

    // ★ チャンネルNGフィルタータブ・セクション
    tabChannelFilterBtn.textContent = lang === 'en' ? 'Channel Filter' : 'チャンネルNGフィルター';
    document.querySelector('#section-channel-filter h2').textContent = lang === 'en'
      ? 'Channel Filter List'
      : 'チャンネルNGフィルター';
    document.getElementById('channelFilter1').placeholder = lang === 'en' ? 'Keyword 1' : 'キーワード1';
    document.getElementById('channelFilter2').placeholder = lang === 'en' ? 'Keyword 2' : 'キーワード2';
    document.getElementById('channelFilter3').placeholder = lang === 'en' ? 'Keyword 3' : 'キーワード3';
    addChannelFilterBtn.textContent = lang === 'en' ? 'Add' : '追加';
    channelFilterSearchInput.placeholder = lang === 'en' ? 'Search...' : '検索...';

    // タイトルNGフィルタータブ・セクション
    document.querySelector('#section-keywords h2').textContent = lang === 'en' ? 'Title Filter List' : 'タイトルNGフィルター';
    document.getElementById('keyword1').placeholder = lang === 'en' ? 'Keyword 1' : 'キーワード1';
    document.getElementById('keyword2').placeholder = lang === 'en' ? 'Keyword 2' : 'キーワード2';
    document.getElementById('keyword3').placeholder = lang === 'en' ? 'Keyword 3' : 'キーワード3';
    addKeywordBtn.textContent = lang === 'en' ? 'Add' : '追加';
    keywordSearchInput.placeholder = lang === 'en' ? 'Search...' : '検索...';

    // 非表示コメントユーザータブ・セクション
    document.querySelector('#section-blocked-comments h2').textContent = lang === 'en' ? 'Blocked Comment Users List' : '非表示コメントユーザーリスト';
    document.getElementById('commentUserInput').placeholder = lang === 'en' ? 'Username' : 'ユーザー名';
    addCommentUserBtn.textContent = lang === 'en' ? 'Add' : '追加';
    commentSearchInput.placeholder = lang === 'en' ? 'Search...' : '検索...';

    // ★ エクスポート・インポートセクション
    document.querySelector('#section-import-export h2').textContent = lang === 'en' ? 'Export / Import' : 'エクスポート／インポート';
    document.querySelector('#section-import-export p').textContent = lang === 'en' ? '💡 We recommend backing up your data regularly.' : '💡 定期的なバックアップを推奨します。';
    document.querySelector('#section-import-export h3:nth-of-type(1)').textContent = lang === 'en' ? 'Block Channel List' : '非表示チャンネルリスト';

    const h3Elements = document.querySelectorAll('#section-import-export h3');
    h3Elements[0].textContent = lang === 'en' ? 'Block Channel List' : '非表示チャンネルリスト';
    h3Elements[1].textContent = lang === 'en' ? 'Channel Filter List' : 'チャンネルNGフィルター';
    h3Elements[2].textContent = lang === 'en' ? 'Title Filter List' : 'タイトルNGフィルター';
    h3Elements[3].textContent = lang === 'en' ? 'Blocked Comment User List' : '非表示コメントユーザーリスト';

    // 非表示リストのエクスポート・インポートボタン
    exportChannelsBtn.textContent = lang === 'en' ? 'Export' : 'エクスポート';
    importChannelsBtn.textContent = lang === 'en' ? 'Import' : 'インポート';

    // チャンネルNGフィルターのエクスポート・インポートボタン
    exportChannelKeywordsBtn.textContent = lang === 'en' ? 'Export' : 'エクスポート';
    importChannelKeywordsBtn.textContent = lang === 'en' ? 'Import' : 'インポート';

    // タイトルNGフィルターのエクスポート・インポートボタン
    exportTitleKeywordsBtn.textContent = lang === 'en' ? 'Export' : 'エクスポート';
    importTitleKeywordsBtn.textContent = lang === 'en' ? 'Import' : 'インポート';

    // 非表示コメントユーザーリスト
    exportBlockedCommentsBtn.textContent = lang === 'en' ? 'Export' : 'エクスポート';
    importBlockedCommentsBtn.textContent = lang === 'en' ? 'Import' : 'インポート';

    // 表示/非表示
    document.querySelector('#section-hide-shorts h2').textContent = lang === 'en'
      ? 'Show/Hide Toggle'
      : '表示／非表示切替';
    // ボタンのテキスト切り替え
    chrome.storage.local.get('hideShortsFlag', (result) => {
      const enabled = !!result.hideShortsFlag;
      updateButtonState(enabled, lang);
    });

    document.querySelector('#section-language h2').textContent = lang === 'en' ? 'Language Setting' : '表示言語';
    document.querySelector('#section-language p').textContent = lang === 'en'
      ? 'Choose the language to use for the UI:'
      : 'UIに使用する言語を選択してください：';

    // Donation section
    document.querySelector('#donation-h2').textContent = lang === 'en'
      ? '🎁 Support the Developer with a Donation'
      : '🎁 寄付で開発者を応援';

    document.querySelector('#donation-message-1').textContent = lang === 'en'
      ? 'Thank you for visiting this page!'
      : 'このページを見ていただきありがとうございます！';

    document.querySelector('#donation-message-2').textContent = lang === 'en'
      ? 'If you find this extension useful, please consider making a donation.'
      : 'この拡張機能が役に立ったと感じたら、寄付をご検討いただければ幸いです！';

    document.querySelector('#donation-message-3').textContent = lang === 'en'
      ? 'Ko-fi allows anonymous donations without registration using a credit card (PayPal requires registration).'
      : 'Ko-fiは登録不要で匿名かつクレジットカードからの寄付が可能です（PayPalは登録が必要）。';

    document.querySelector('#paypal-button').textContent = lang === 'en'
      ? 'Donate with PayPal'
      : 'PayPalで寄付';

    document.querySelector('#kofi-button').textContent = lang === 'en'
      ? 'Donate with Ko-fi'
      : 'Ko-fiで寄付';

    document.querySelector('#promotion-h2').textContent = lang === 'en'
      ? '📢 Support the Developer by Spreading the Word'
      : '📢 宣伝で開発者を応援（寄付が難しい方へ）';

    document.querySelector('#donation-message-4').textContent = lang === 'en'
      ? 'If donating is difficult, sharing this extension, following on X, or posting on social media is also a great way to help!'
      : '寄付が難しい場合でも、SNSでの拡散や記事のシェア、アカウントのフォローなどで応援していただけます！';

    document.querySelector('#donation-message-5').textContent = lang === 'en'
      ? 'Promotion helps raise awareness of the developer’s other projects, increases blog traffic, and grows the extension’s user base.'
      : '宣伝によって、他の制作物の認知やブログのPVが増えたり、拡張機能のユーザーが増えたりします！';

    document.querySelector('#donation-message-6').textContent = lang === 'en'
      ? 'You can also share using the Tweet button below!'
      : '下のツイートボタンからシェアもできます！';

  }

  // 言語変更時にも反映
  function setLanguage(lang) {
    chrome.storage.local.set({ language: lang }, () => {
      applyUIText(lang);       // ★ UIに反映
      renderBlockList();
      renderKeywordList();
      renderBlockedCommentUsers();
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

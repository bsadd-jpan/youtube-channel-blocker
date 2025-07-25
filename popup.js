/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('blockList');
  const saveBtn = document.getElementById('save');

  // ボタン作成関数（共通）
  function createButton(text) {
    const btn = document.createElement('button');
    btn.style.marginLeft = '8px';
    btn.style.padding = '4px 8px';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.style.color = 'white';
    return btn;
  }

  // トグルボタンを作成
  const toggleBtn = createButton('Blocker: ON');
  toggleBtn.style.backgroundColor = 'red';
  saveBtn.parentNode.insertBefore(toggleBtn, saveBtn.nextSibling);

  // 直近の1つを削除ボタン
  const removeLastBtn = createButton('直近の1つを削除');
  removeLastBtn.style.backgroundColor = '#f08c00';
  saveBtn.parentNode.insertBefore(removeLastBtn, toggleBtn.nextSibling);

  // エクスポート・インポートボタンの親コンテナを作成
  const exportImportWrapper = document.createElement('div');
  exportImportWrapper.style.display = 'flex';
  exportImportWrapper.style.gap = '8px';  // ボタン間の隙間

  const exportBtn = createButton('エクスポート');
  exportBtn.style.backgroundColor = '#007bff';
  const importBtn = createButton('インポート');
  importBtn.style.backgroundColor = '#007bff';

  // 親にボタンを入れる
  exportImportWrapper.appendChild(exportBtn);
  exportImportWrapper.appendChild(importBtn);

  // 親要素をsaveBtnの後ろに挿入
  saveBtn.parentNode.insertBefore(exportImportWrapper, removeLastBtn.nextSibling);

  // 設定ボタン
  const settingsBtn = createButton('設定');
  settingsBtn.style.backgroundColor = '#28a745'; // 緑
  saveBtn.parentNode.insertBefore(settingsBtn, exportImportWrapper.nextSibling);

  // 言語切替ボタン
  const langBtn = createButton('English');
  langBtn.style.backgroundColor = '#6c757d'; // グレー
  saveBtn.parentNode.insertBefore(langBtn, settingsBtn.nextSibling);

  // ステータス表示
  const status = document.createElement('div');
  status.style.color = 'green';
  status.style.marginTop = '8px';
  saveBtn.parentNode.insertBefore(status, langBtn.nextSibling);

  // 言語用テキスト
  const texts = {
    ja: {
      removeLast: '直近の1つを削除',
      export: 'エクスポート',
      import: 'インポート',
      settings: '設定',
      blockerOn: 'Blocker: ON',
      blockerOff: 'Blocker: OFF',
      langSwitch: '言語（Language）: 日本語',
      saved: '保存しました',
      saveFailed: '保存に失敗しました',
      listEmpty: 'リストは空です',
      removedLast: '直近の1つを削除しました',
      enabled: '有効化しました',
      disabled: '無効化しました',
      exportDone: 'エクスポートしました',
      importDone: 'インポートしました',
      importFail: 'インポート失敗（ファイル形式エラー）',
    },
    en: {
      removeLast: 'Remove Last',
      export: 'Export',
      import: 'Import',
      settings: 'Settings',
      blockerOn: 'Blocker: ON',
      blockerOff: 'Blocker: OFF',
      langSwitch: 'Language(言語): English',
      saved: 'Saved',
      saveFailed: 'Failed to save',
      listEmpty: 'List is empty',
      removedLast: 'Removed last entry',
      enabled: 'Enabled',
      disabled: 'Disabled',
      exportDone: 'Exported',
      importDone: 'Imported',
      importFail: 'Import failed (file format error)',
    }
  };

  // 現在の言語取得（ストレージ or デフォルトja）
  function getLanguage(callback) {
    chrome.storage.local.get(['language'], (result) => {
      callback(result.language === 'en' ? 'en' : 'ja');
    });
  }

  // UIテキスト更新
  function updateUIText(lang) {
    removeLastBtn.textContent = texts[lang].removeLast;
    exportBtn.textContent = texts[lang].export;
    importBtn.textContent = texts[lang].import;
    settingsBtn.textContent = texts[lang].settings;
    langBtn.textContent = texts[lang].langSwitch;
    saveBtn.textContent = lang === 'ja' ? '保存' : 'Save';

    // toggleボタンの状態は更新ToggleButton内で
    // statusメッセージはリセット
    status.textContent = '';
  }

  // toggleボタンの見た目更新
  function updateToggleButton(btn, isEnabled, lang) {
    if (isEnabled) {
      btn.textContent = texts[lang].blockerOn;
      btn.style.backgroundColor = 'red';
    } else {
      btn.textContent = texts[lang].blockerOff;
      btn.style.backgroundColor = 'gray';
    }
  }

  // ステータス表示
  function showStatus(message, color) {
    status.textContent = message;
    status.style.color = color;
    setTimeout(() => { status.textContent = ''; }, 2000);
  }

  // 初期状態読み込み
  chrome.storage.local.get(['blockedChannels', 'blockerEnabled', 'language'], (result) => {
    textarea.value = (result.blockedChannels || []).join('\n');
    const isEnabled = result.blockerEnabled !== false; // default ON
    const lang = result.language === 'en' ? 'en' : 'ja';

    updateUIText(lang);
    updateToggleButton(toggleBtn, isEnabled, lang);
  });

  // 保存ボタン
  saveBtn.addEventListener('click', () => {
    const blockList = textarea.value
      .split('\n')
      .map(name => name.trim())
      .filter(Boolean);

    chrome.storage.local.set({ blockedChannels: blockList }, () => {
      if (chrome.runtime.lastError) {
        getLanguage(lang => showStatus(texts[lang].saveFailed, 'red'));
        return;
      }
      getLanguage(lang => showStatus(texts[lang].saved, 'green'));
    });
  });

  // 直近の1つを削除ボタン
  removeLastBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockedChannels', 'language'], (result) => {
      let blockList = result.blockedChannels || [];
      const lang = result.language === 'en' ? 'en' : 'ja';
      if (blockList.length === 0) {
        showStatus(texts[lang].listEmpty, 'red');
        return;
      }
      blockList.pop();
      chrome.storage.local.set({ blockedChannels: blockList }, () => {
        textarea.value = blockList.join('\n');
        showStatus(texts[lang].removedLast, 'green');
      });
    });
  });

  // トグルボタン
  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockerEnabled', 'language'], (result) => {
      const lang = result.language === 'en' ? 'en' : 'ja';
      const isEnabled = !(result.blockerEnabled !== false); // toggle
      chrome.storage.local.set({ blockerEnabled: isEnabled }, () => {
        updateToggleButton(toggleBtn, isEnabled, lang);
        const msg = isEnabled ? texts[lang].enabled : texts[lang].disabled;
        showStatus(msg, 'green');
      });
    });
  });

  // エクスポート
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get(['blockedChannels', 'language'], (result) => {
      const lang = result.language === 'en' ? 'en' : 'ja';
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
      showStatus(texts[lang].exportDone, 'green');
    });
  });

  // インポート
  importBtn.addEventListener('click', () => {
    chrome.storage.local.get(['language'], (result) => {
      const lang = result.language === 'en' ? 'en' : 'ja';
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
              showStatus(texts[lang].importDone, 'green');
            });
          } catch {
            showStatus(texts[lang].importFail, 'red');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  });

  // 設定ボタン
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // 言語切替ボタン
  langBtn.addEventListener('click', () => {
    chrome.storage.local.get(['language'], (result) => {
      const currentLang = result.language === 'en' ? 'en' : 'ja';
      const newLang = currentLang === 'ja' ? 'en' : 'ja';
      chrome.storage.local.set({ language: newLang }, () => {
        updateUIText(newLang);
        // toggleボタンの状態更新も
        chrome.storage.local.get(['blockerEnabled'], (res) => {
          const isEnabled = res.blockerEnabled !== false;
          updateToggleButton(toggleBtn, isEnabled, newLang);
          showStatus(newLang === 'ja' ? '言語を日本語に切り替えました' : 'Switched to English', 'green');
        });
      });
    });
  });
});

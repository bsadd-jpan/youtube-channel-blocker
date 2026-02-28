/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

// ============================================================
// popup.js - ポップアップ画面のメインロジック
//
// 翻訳データは i18n.js に一元管理
//
// セクション:
//   - DOM要素の取得
//   - ボタン生成ヘルパー
//   - UIボタンの作成・配置
//   - ステータス表示
//   - UIテキスト更新（i18n）
//   - 初期状態の読み込み
//   - イベントハンドラ
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  // DOM要素の取得
  // ============================================================

  const textarea = document.getElementById("blockList");
  const saveBtn = document.getElementById("save");

  // ============================================================
  // ボタン生成ヘルパー
  // ============================================================

  /**
   * ボタン要素を生成するヘルパー
   * @param {string} bgColor - 背景色
   * @returns {HTMLButtonElement}
   */
  function createButton(bgColor = '#007bff') {
    const btn = document.createElement("button");
    btn.style.cssText = `
      margin-left: 8px;
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      color: white;
      background-color: ${bgColor};
    `;
    return btn;
  }

  // ============================================================
  // UIボタンの作成・配置
  // ============================================================

  // トグルボタン
  const toggleBtn = createButton("red");
  saveBtn.parentNode.insertBefore(toggleBtn, saveBtn.nextSibling);

  // 直近の1つを削除ボタン
  const removeLastBtn = createButton("#f08c00");
  saveBtn.parentNode.insertBefore(removeLastBtn, toggleBtn.nextSibling);

  // エクスポート・インポートボタン
  const exportImportWrapper = document.createElement("div");
  exportImportWrapper.style.display = "flex";
  exportImportWrapper.style.gap = "8px";

  const exportBtn = createButton("#007bff");
  const importBtn = createButton("#007bff");
  exportImportWrapper.appendChild(exportBtn);
  exportImportWrapper.appendChild(importBtn);
  saveBtn.parentNode.insertBefore(exportImportWrapper, removeLastBtn.nextSibling);

  // 設定ボタン
  const settingsBtn = createButton("#28a745");
  saveBtn.parentNode.insertBefore(settingsBtn, exportImportWrapper.nextSibling);

  // 言語切替ボタン
  const langBtn = createButton("#6c757d");
  saveBtn.parentNode.insertBefore(langBtn, settingsBtn.nextSibling);

  // ステータス表示エリア
  const status = document.createElement("div");
  status.style.color = "green";
  status.style.marginTop = "8px";
  saveBtn.parentNode.insertBefore(status, langBtn.nextSibling);

  // ============================================================
  // ステータス表示
  // ============================================================

  /**
   * ステータスメッセージを表示し、一定時間後にクリアする
   * @param {string} message - 表示する文字列
   * @param {string} color - 表示色
   * @param {string} fontSize - フォントサイズ
   */
  function showStatus(message, color, fontSize = "15px") {
    status.textContent = message;
    status.style.color = color;
    status.style.fontSize = fontSize;
    setTimeout(() => {
      status.textContent = "";
    }, 2000);
  }

  // ============================================================
  // UIテキスト更新（全ボタン・ラベルを現在の言語に合わせる）
  // ============================================================

  /**
   * 全ボタン・ラベルを現在の言語に合わせて更新する
   * @param {string} lang - 言語コード
   */
  function updateUIText(lang) {
    document.getElementById("title").textContent = t('popupTitle', lang);
    removeLastBtn.textContent = t('removeLast', lang);
    exportBtn.textContent = t('exportBtn', lang);
    importBtn.textContent = t('importBtn', lang);
    settingsBtn.textContent = t('settings', lang);
    langBtn.textContent = t('langSwitch', lang);
    saveBtn.textContent = t('save', lang);
    status.textContent = "";
  }

  /**
   * トグルボタンの表示状態を更新する
   * @param {HTMLButtonElement} btn - トグルボタン要素
   * @param {boolean} isEnabled - 有効かどうか
   * @param {string} lang - 言語コード
   */
  function updateToggleButton(btn, isEnabled, lang) {
    btn.textContent = isEnabled ? t('blockerOn', lang) : t('blockerOff', lang);
    btn.style.backgroundColor = isEnabled ? "red" : "gray";
  }

  // ============================================================
  // 初期状態の読み込み
  // ============================================================

  chrome.storage.local.get(
    [STORAGE_KEYS.BLOCKED_CHANNELS, STORAGE_KEYS.BLOCKER_ENABLED, STORAGE_KEYS.LANGUAGE],
    (result) => {
      textarea.value = (result[STORAGE_KEYS.BLOCKED_CHANNELS] || []).join("\n");
      const isEnabled = result[STORAGE_KEYS.BLOCKER_ENABLED] !== false;
      const lang = result[STORAGE_KEYS.LANGUAGE] === "en" ? "en" : "ja";
      updateUIText(lang);
      updateToggleButton(toggleBtn, isEnabled, lang);
    }
  );

  // ============================================================
  // イベントハンドラ
  // ============================================================

  // 保存ボタン
  saveBtn.addEventListener("click", () => {
    const blockList = textarea.value
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);
    chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_CHANNELS]: blockList }, () => {
      getCurrentLang((lang) => {
        if (chrome.runtime.lastError) {
          showStatus(t('saveFailed', lang), "red");
          return;
        }
        showStatus(t('saved', lang), "green");
      });
    });
  });

  // 直近の1つを削除
  removeLastBtn.addEventListener("click", () => {
    chrome.storage.local.get([STORAGE_KEYS.BLOCKED_CHANNELS], (result) => {
      let blockList = result[STORAGE_KEYS.BLOCKED_CHANNELS] || [];
      getCurrentLang((lang) => {
        if (blockList.length === 0) {
          showStatus(t('listEmpty', lang), "red");
          return;
        }
        const removedChannel = blockList.pop();
        chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_CHANNELS]: blockList }, () => {
          textarea.value = blockList.join("\n");
          showStatus(`${t('removedLast', lang)}: ${removedChannel}`, "red");
        });
      });
    });
  });

  // トグルボタン
  toggleBtn.addEventListener("click", () => {
    chrome.storage.local.get([STORAGE_KEYS.BLOCKER_ENABLED], (result) => {
      const isEnabled = !(result[STORAGE_KEYS.BLOCKER_ENABLED] !== false);
      chrome.storage.local.set({ [STORAGE_KEYS.BLOCKER_ENABLED]: isEnabled }, () => {
        getCurrentLang((lang) => {
          updateToggleButton(toggleBtn, isEnabled, lang);
          showStatus(isEnabled ? t('enabled', lang) : t('disabled', lang), "green");
        });
      });
    });
  });

  // エクスポート
  exportBtn.addEventListener("click", () => {
    chrome.storage.local.get([STORAGE_KEYS.BLOCKED_CHANNELS], (result) => {
      const data = JSON.stringify(result[STORAGE_KEYS.BLOCKED_CHANNELS] || [], null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blocked_channels_backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      getCurrentLang((lang) => showStatus(t('exportDone', lang), "green"));
    });
  });

  // インポート
  importBtn.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        getCurrentLang((lang) => {
          try {
            const arr = JSON.parse(event.target.result);
            if (!Array.isArray(arr)) throw new Error();
            chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_CHANNELS]: arr }, () => {
              textarea.value = arr.join("\n");
              showStatus(t('importDone', lang), "green");
            });
          } catch {
            showStatus(t('importFail', lang), "red");
          }
        });
      };
      reader.readAsText(file);
    };
    input.click();
  });

  // 設定ボタン
  settingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // 言語切替ボタン
  langBtn.addEventListener("click", () => {
    getCurrentLang((currentLang) => {
      const newLang = currentLang === "ja" ? "en" : "ja";
      chrome.storage.local.set({ [STORAGE_KEYS.LANGUAGE]: newLang }, () => {
        updateUIText(newLang);
        chrome.storage.local.get([STORAGE_KEYS.BLOCKER_ENABLED], (res) => {
          const isEnabled = res[STORAGE_KEYS.BLOCKER_ENABLED] !== false;
          updateToggleButton(toggleBtn, isEnabled, newLang);
          showStatus(t('langSwitched', newLang), "green");
        });
      });
    });
  });
});

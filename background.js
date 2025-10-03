/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

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

async function getRegexListDB(type) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('regexLists', 'readonly');
    const store = tx.objectStore('regexLists');
    const req = store.get(type);
    req.onsuccess = () => resolve(req.result?.list || []);
    req.onerror = () => reject(req.error);
  });
}

async function setRegexListDB(type, list) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('regexLists', 'readwrite');
    const store = tx.objectStore('regexLists');
    const req = store.put({ type, list });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// message handler: content <-> background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return;

  if (msg.action === 'getRegexList') {
    getRegexListDB(msg.type)
      .then(list => sendResponse({ ok: true, list }))
      .catch(err => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true; // async response
  }

  if (msg.action === 'setRegexList') {
    setRegexListDB(msg.type, msg.list)
      .then(() => sendResponse({ ok: true }))
      .catch(err => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true;
  }
});

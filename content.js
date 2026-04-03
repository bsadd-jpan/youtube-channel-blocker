/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

// ============================================================
// content.js - メインロジック（runBlocker, Observer, 初期化）
//
// ユーティリティ関数は content-utils.js に分離
// 翻訳データは i18n.js に一元管理
//
// セクション:
//   - 定数定義（デバウンス・ショート・ページセレクタ）
//   - メイン処理: runBlocker
//   - ブロック解除: clearBlocks
//   - MutationObserver（DOM変更の監視）
//   - 初回実行
// ============================================================
// 定数定義
// ============================================================

/** デバウンス遅延（ms） */
const DEBOUNCE_DELAY = 300;
/** デバウンスタイマーID */
let debounceTimer = null;
/** ショート動画非表示フラグ */
let hideShortsFlag = false;

// ============================================================
// ショート動画の非表示セレクタ定義
// ============================================================

const SHORTS_HIDE_RULES = [
  { childSelector: 'a[href^="/shorts/"]', parentSelector: "ytd-rich-shelf-renderer" },
  { childSelector: 'a[href^="/shorts/"]', parentSelector: "grid-shelf-view-model" },
  { childSelector: 'a[href^="/shorts/"]', parentSelector: "ytd-reel-shelf-renderer" },
  { childSelector: 'a[href^="/shorts/"]', parentSelector: "ytd-video-renderer" },
  { childSelector: 'a[href^="/shorts/"]', parentSelector: "ytd-compact-video-renderer" },
  { childSelector: 'a[href^="/shorts/"]', parentSelector: "yt-lockup-view-model" },
];

// ============================================================
// 各画面のセレクタ定義
// PAGE_SELECTORS 変更時は CLEARABLE_SELECTORS / WATCHED_SELECTORS も確認すること
// ============================================================

const PAGE_SELECTORS = [
  {
    // ホーム画面の動画
    itemSelector: "ytd-rich-grid-renderer > ytd-rich-item-renderer",
    channelSelector: "a.yt-core-attributed-string__link[href^='/@']",
    insertBeforeSelector: null,
    parentSelectors: "ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer",
  },
  {
    // 関連動画サイドバー: 通常動画用
    itemSelector: "yt-lockup-view-model",
    channelSelector: ".yt-content-metadata-view-model__metadata-row .yt-core-attributed-string",
    insertBeforeSelector: null,
    parentSelectors: "ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-compact-autoplay-renderer",
  },
  {
    // 関連動画サイドバー: ショート動画用
    itemSelector: "ytd-compact-video-renderer",
    channelSelector: "ytd-channel-name #text",
    insertBeforeSelector: null,
    parentSelectors: "ytd-compact-video-renderer",
  },
  {
    // 検索結果動画
    itemSelector: "ytd-video-renderer",
    channelSelector: "#channel-name a, ytd-channel-name a",
    insertBeforeSelector: "yt-img-shadow",
    parentSelectors: "ytd-video-renderer",
  },
  {
    // 検索画面のチャンネル名
    itemSelector: "ytd-channel-renderer",
    channelSelector: "ytd-channel-name #text, #channel-name a, ytd-channel-name a",
    insertBeforeSelector: null,
    parentSelectors: "ytd-channel-renderer",
  },
  {
    // 履歴動画
    itemSelector: "ytd-video-renderer",
    channelSelector: "ytd-channel-name #text a, #channel-info ytd-channel-name a",
    insertBeforeSelector: "ytd-video-renderer ytd-channel-name",
    parentSelectors: "ytd-video-renderer",
  },
  {
    // 動画再生ページ
    itemSelector: "ytd-video-owner-renderer",
    channelSelector: "ytd-channel-name #text",
    insertBeforeSelector: null,
    parentSelectors: null,
  },
];

/**
 * ブロック解除時に復元する要素のセレクタ
 * PAGE_SELECTORS の itemSelector / parentSelectors から導出
 */
const CLEARABLE_SELECTORS =
  "ytd-rich-item-renderer, ytd-video-renderer, ytd-channel-renderer, " +
  "ytd-compact-video-renderer, ytd-compact-autoplay-renderer, yt-lockup-view-model";

/**
 * MutationObserver の監視対象セレクタ
 * 主要な動画・チャンネル要素の追加を検知する
 */
const WATCHED_SELECTORS =
  "ytd-video-renderer, ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-channel-renderer";

// ============================================================
// メイン処理: runBlocker
// ============================================================

/**
 * 各画面ごとにアイテムを処理し、ボタン追加＆ブロック判定
 */
async function runBlocker() {
  // background 経由で正規表現リストを取得
  const channelPatterns = await getRegexListFromBackground("channelRegex");
  const titlePatterns = await getRegexListFromBackground("titleRegex");

  const channelRegexList = channelPatterns.map(parseUserRegex).filter(Boolean);
  const titleRegexList = titlePatterns.map(parseUserRegex).filter(Boolean);

  chrome.storage.local.get(
    [STORAGE_KEYS.BLOCKER_ENABLED, STORAGE_KEYS.BLOCKED_CHANNELS, STORAGE_KEYS.CHANNEL_KEYWORD_SETS, STORAGE_KEYS.TITLE_KEYWORD_SETS, STORAGE_KEYS.HIDE_SHORTS_FLAG, STORAGE_KEYS.BLOCKED_COMMENTS, STORAGE_KEYS.WHITELISTED_CHANNELS, STORAGE_KEYS.WHITELIST_BYPASS_ALL, STORAGE_KEYS.WHITELIST_HIDE_SHORTS, STORAGE_KEYS.SHOW_BLOCK_POPUP, STORAGE_KEYS.SHOW_CLOSE_BUTTON],
    (result) => {
      if (result[STORAGE_KEYS.BLOCKER_ENABLED] === false) {
        console.log("Blocker is disabled");
        clearBlocks();
        return;
      }

      const blockedChannels = new Set(result[STORAGE_KEYS.BLOCKED_CHANNELS] || []);
      const whitelistedChannels = new Set(result[STORAGE_KEYS.WHITELISTED_CHANNELS] || []);
      const whitelistBypassAll = result[STORAGE_KEYS.WHITELIST_BYPASS_ALL] !== false;
      const whitelistHideShorts = !!result[STORAGE_KEYS.WHITELIST_HIDE_SHORTS];
      showBlockPopupFlag = result[STORAGE_KEYS.SHOW_BLOCK_POPUP] !== false;
      const showCloseButton = result[STORAGE_KEYS.SHOW_CLOSE_BUTTON] !== false;

      // チャンネル名フィルター用キーワードセット
      const channelKeywords = (result[STORAGE_KEYS.CHANNEL_KEYWORD_SETS] || [])
        .slice(0, LIMITS.KEYWORD_SETS)
        .map((set) => set.slice(0, LIMITS.KEYWORDS_PER_SET));

      // タイトルフィルター用キーワードセット
      const titleKeywords = (result[STORAGE_KEYS.TITLE_KEYWORD_SETS] || [])
        .slice(0, LIMITS.KEYWORD_SETS)
        .map((set) => set.slice(0, LIMITS.KEYWORDS_PER_SET));

      // ショート動画非表示
      if (hideShortsFlag) {
        SHORTS_HIDE_RULES.forEach(({ childSelector, parentSelector }) => {
          hideParentByChildSelector(childSelector, parentSelector);
        });
      }

      // フィルターコンテキスト（全ページセレクタ共通）
      const filterContext = {
        blockedChannels,
        onBlock: runBlocker,
        channelKeywords,
        titleKeywords,
        channelRegexList,
        titleRegexList,
        whitelistedChannels,
        whitelistBypassAll,
        hideShortsFlag,
        whitelistHideShorts,
        showCloseButton,
      };

      // 各ページセレクタのアイテムを処理
      PAGE_SELECTORS.forEach(({ itemSelector, ...selectorConfig }) => {
        document.querySelectorAll(itemSelector).forEach((item) => {
          processVideoItem(item, { ...filterContext, ...selectorConfig });
        });
      });

      // チャンネルページ
      document.querySelectorAll("yt-dynamic-text-view-model").forEach((item) => {
        const isChannelPage = !!item
          .closest(".yt-page-header-view-model__page-header-headline-info")
          ?.querySelector("yt-content-metadata-view-model");

        if (isChannelPage) {
          processVideoItem(item, {
            ...filterContext,
            channelSelector: '[role="text"]',
            channelRegexList: [],
            titleRegexList: [],
          });
        }
      });

      // コメント欄処理（ユーザー単位で非表示）
      const blockedComments = new Set(result[STORAGE_KEYS.BLOCKED_COMMENTS] || []);

      // 親コメント用
      document.querySelectorAll("ytd-comment-thread-renderer").forEach((item) => {
        processCommentUserBlock(item, {
          blockedComments,
          userSelector: "#author-text span",
          buttonContainerSelector: "#author-text",
          onBlock: runBlocker,
        });
      });

      // 返信コメント用
      document.querySelectorAll("ytd-comment-replies-renderer ytd-comment-view-model").forEach((item) => {
        processCommentUserBlock(item, {
          blockedComments,
          userSelector: "#header-author #author-text span",
          buttonContainerSelector: "#header-author #author-text",
          onBlock: runBlocker,
        });
      });
    }
  );
}

// ============================================================
// ブロック解除
// ============================================================

/**
 * すべてのブロックを解除（無効化時）
 */
function clearBlocks() {
  document
    .querySelectorAll(CLEARABLE_SELECTORS)
    .forEach((item) => {
      item.style.display = "";
    });
}

// ============================================================
// MutationObserver（DOM変更の監視）
// ============================================================

const observer = new MutationObserver((mutationsList) => {
  let triggered = false;
  for (const mutation of mutationsList) {
    for (const node of mutation.addedNodes) {
      if (
        node.nodeType === 1 &&
        (node.matches?.(WATCHED_SELECTORS) || node.querySelector?.(WATCHED_SELECTORS))
      ) {
        runBlocker();
        triggered = true;
        break;
      }
    }
    if (triggered) break;
  }
  if (!triggered) {
    handleDebouncedMutation();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

/**
 * デバウンス付き変更検知ハンドラ
 */
function handleDebouncedMutation() {
  const videoCount = document.querySelectorAll("ytd-video-renderer").length;
  if (videoCount >= 5) {
    runBlocker();
    clearTimeout(debounceTimer);
  } else {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runBlocker();
    }, DEBOUNCE_DELAY);
  }
}

// ============================================================
// ストレージ変更の監視
// ============================================================

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes[STORAGE_KEYS.SHOW_BLOCK_POPUP]) {
    showBlockPopupFlag = changes[STORAGE_KEYS.SHOW_BLOCK_POPUP].newValue !== false;
  }
  if (
    changes[STORAGE_KEYS.SHOW_CLOSE_BUTTON] ||
    changes[STORAGE_KEYS.SHOW_BLOCK_POPUP]
  ) {
    runBlocker();
  }
});

// ============================================================
// 初回実行
// ============================================================

loadHideShortsFlag(() => {
  runBlocker();
});

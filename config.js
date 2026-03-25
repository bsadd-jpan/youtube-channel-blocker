/*!
 * Copyright (c) 2025 AKS_Studio aki009
 * This software is licensed under the MIT License.
 * See the LICENSE file for details.
 */

// ============================================================
// config.js - 共有定数（全スクリプトから参照）
//
// リスト上限・文字数制限などの定数を一元管理
// content.js / content-utils.js / settings.js で共有
// ============================================================

/** ストレージキー名（chrome.storage.local 用） */
const STORAGE_KEYS = {
  BLOCKER_ENABLED:      'blockerEnabled',
  BLOCKED_CHANNELS:     'blockedChannels',
  CHANNEL_KEYWORD_SETS: 'channelKeywordSets',
  TITLE_KEYWORD_SETS:   'titleKeywordSets',
  HIDE_SHORTS_FLAG:     'hideShortsFlag',
  BLOCKED_COMMENTS:     'blockedComments',
  WHITELISTED_CHANNELS: 'whitelistedChannels',
  WHITELIST_BYPASS_ALL: 'whitelistBypassAll',
  WHITELIST_HIDE_SHORTS:'whitelistHideShorts',
  LANGUAGE:             'language',
};

/** リスト上限・文字数制限 */
const LIMITS = {
  /** ブロックリスト上限 */
  BLOCK_LIST:          10000,
  /** ホワイトリスト上限 */
  WHITELIST:           10000,
  /** コメントブロックリスト上限 */
  COMMENT_LIST:        10000,
  /** キーワードセット上限 */
  KEYWORD_SETS:        5000,
  /** 1セットあたりのキーワード数上限 */
  KEYWORDS_PER_SET:    3,
  /** チャンネルキーワード文字数上限 */
  CHANNEL_KW_LENGTH:   10,
  /** タイトルキーワード文字数上限 */
  TITLE_KW_LENGTH:     30,
  /** 正規表現リスト上限 */
  REGEX_LIST:          1000,
  /** 正規表現パターン文字数上限 */
  REGEX_LENGTH:        200,
  /** チャンネル名文字数上限 */
  CHANNEL_NAME_LENGTH: 100,
};

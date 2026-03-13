/**
 * アフィリエイトコード生成ユーティリティ
 * 形式: cb_ + 8文字ランダム英数字（小文字）
 * 例: cb_xk9m2plq
 */

export function generateAffiliateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "cb_";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * スラッグ生成（LP公開URL用）
 * 形式: lp- + タイムスタンプ(base36) + ランダム4文字
 * 例: lp-m1abc2de-x9k2
 */
export function generateLpSlug(): string {
  const timestamp = Date.now().toString(36);
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `lp-${timestamp}-${random}`;
}

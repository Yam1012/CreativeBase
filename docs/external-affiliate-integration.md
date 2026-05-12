# 外部アフィリエイト（レントラックス・もしも）連携手順

## 概要

`datanote.net/creativebase/lp.php` を経由する外部アフィリエイトリンクから登録された場合、Creative Base管理画面でも経由情報を記録できるようにする仕組み。

```
[アフィリエイター(自分のサイト)]
  ↓ ASPのリンク（aff=XXXパラメータ付き）
[datanote.net/creativebase/lp.php?aff=XXX&source=rentracks]   ← パラメータを受け取り
  ↓ 「新規登録」ボタン（パラメータを引き継いで遷移）
[creative-base.vercel.app/register?aff=XXX&source=rentracks]   ← パラメータを保存
  ↓ Stripe決済完了
[ExternalAffiliateLog レコード作成]
  → /admin/external-affiliates で一覧表示
```

## lp.php側で必要な実装

`datanote.net/creativebase/lp.php` に以下のPHPコードを追加してください。

### 1. パラメータ受信（ページ冒頭）

```php
<?php
// 外部アフィリエイトのパラメータを受け取る
$aff_id = isset($_GET['aff']) ? htmlspecialchars($_GET['aff'], ENT_QUOTES, 'UTF-8') : '';
$aff_source = isset($_GET['source']) ? htmlspecialchars($_GET['source'], ENT_QUOTES, 'UTF-8') : '';

// ASPに応じてsourceを正規化
// レントラックスは ?aid=XXX で来る場合もある → ?aff=XXX&source=rentracks に統一
if (empty($aff_source)) {
  if (isset($_GET['aid'])) {  // レントラックス標準パラメータ
    $aff_id = htmlspecialchars($_GET['aid'], ENT_QUOTES, 'UTF-8');
    $aff_source = 'rentracks';
  } elseif (isset($_GET['msr'])) {  // もしも標準パラメータ
    $aff_id = htmlspecialchars($_GET['msr'], ENT_QUOTES, 'UTF-8');
    $aff_source = 'moshimo';
  }
}

// 登録URLを構築
$register_url = 'https://creative-base.vercel.app/register';
if ($aff_id) {
  $register_url .= '?aff=' . urlencode($aff_id);
  if ($aff_source) {
    $register_url .= '&source=' . urlencode($aff_source);
  }
}
?>
```

### 2. 「新規登録」ボタンのリンク差し替え

```html
<!-- 修正前 -->
<a href="https://creative-base.vercel.app/register">新規登録</a>

<!-- 修正後 -->
<a href="<?php echo $register_url; ?>">新規登録</a>
```

「このプランで申し込み」ボタンも同様に差し替え。

### 3. （任意）Cookieに保存して滞在中も保持

ユーザーがLP内を回遊しても情報が失われないように、Cookieに保存することを推奨。

```php
<?php
if ($aff_id) {
  setcookie('cb_aff_id', $aff_id, time() + (30 * 24 * 60 * 60), '/');
  setcookie('cb_aff_source', $aff_source, time() + (30 * 24 * 60 * 60), '/');
}

// Cookieに既存値があれば優先（再訪時のため）
if (empty($aff_id) && isset($_COOKIE['cb_aff_id'])) {
  $aff_id = $_COOKIE['cb_aff_id'];
  $aff_source = $_COOKIE['cb_aff_source'] ?? 'other';
  $register_url = 'https://creative-base.vercel.app/register?aff=' . urlencode($aff_id);
  if ($aff_source) $register_url .= '&source=' . urlencode($aff_source);
}
?>
```

## ASP別パラメータ対応表

| ASP | 標準クエリ | sourceの値 |
|-----|-----------|-----------|
| レントラックス | `?aid=XXX` または `?aff=XXX&source=rentracks` | `rentracks` |
| もしもアフィリエイト | `?msr=XXX` または `?aff=XXX&source=moshimo` | `moshimo` |
| その他 | `?aff=XXX&source=other` | `other` |

## テスト方法

1. テスト用URLでアクセス：
   ```
   https://datanote.net/creativebase/lp.php?aff=test_aff_001&source=rentracks
   ```
2. lp.phpの「新規登録」ボタンが
   `https://creative-base.vercel.app/register?aff=test_aff_001&source=rentracks`
   に遷移することを確認
3. 登録 + 決済を完了
4. Creative Base管理画面 `/admin/external-affiliates` で記録を確認
   - source: `rentracks`
   - affiliateId: `test_aff_001`
   - eventType: `registration`
   - baseAmount: 決済額

## 既存のCVタグとの関係

既存の `lib/affiliate-config.ts` にあるレントラックス・もしものCVタグは引き続き動作します（ASP側への成果通知に必要）。

本機能は **Creative Base側の独自記録** であり、ASP側のシステムとは独立しています。両方を組み合わせることで:

- **ASP側ダッシュボード**: 正式な成果記録・報酬計算
- **Creative Base管理画面**: 自社管理用の補助記録（ASPの確認なしに状況把握）

## 連絡先

実装で不明な点があれば、Creative Base開発担当までお問い合わせください。

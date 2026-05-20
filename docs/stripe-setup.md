# Stripe連携 セットアップ手順

## 1. Stripe アカウント準備

1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. 左下の「テストモード」トグルが ON になっていることを確認（最初は必ずテストモードで）

## 2. APIキー取得

1. Stripe Dashboard → **開発者** → **APIキー**
2. 以下2つをコピー：
   - **公開可能キー**: `pk_test_xxxxxxxxxx`
   - **シークレットキー**: `sk_test_xxxxxxxxxx`（**revealして表示後コピー**）

## 3. 環境変数設定

### Vercelダッシュボード
プロジェクト → **Settings** → **Environment Variables** で以下を追加：

```
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
STRIPE_WEBHOOK_SECRET=（後述のWebhook設定後に取得）
```

設定後、**Redeploy** で反映。

### ローカル開発時
`.env` に同じ値を設定し、`npm run dev` でサーバー再起動。

## 4. Product / Price 作成

Stripe側にコースに対応するProductとPriceを作成します。

1. 管理者でログイン → 管理画面 → **設定・サポート** ▼ → **Stripeセットアップ**
2. 「Stripe APIキー: ✅ 設定済み」を確認
3. 「**Stripe Product / Priceを作成**」ボタンをクリック
4. 全コース（Entry / Start Up / Standard）の Product ID / Price ID が表示されればOK

## 5. Webhook URL 登録

1. Stripe Dashboard → **開発者** → **Webhook** → **エンドポイントを追加**
2. **エンドポイントURL**: `https://creative-base.vercel.app/api/webhooks/stripe`
3. **リッスンするイベント**: 以下を選択
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 作成後、「**署名シークレットを表示**」をクリックし `whsec_xxxxx` をコピー
5. Vercel環境変数の `STRIPE_WEBHOOK_SECRET` に設定 → Redeploy

## 6. テスト

### 新規登録テスト
1. `/register` で新規ユーザー登録
2. コース選択 → 決済画面で以下のテストカード使用：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来（例: `12/30`）
   - CVC: 任意の3桁（例: `123`）
   - 郵便番号: 任意
3. 決済完了後、`/register/complete` に遷移
4. Stripe Dashboard → 支払い に決済が記録されていることを確認
5. Stripe Dashboard → サブスクリプション に契約が作成されていることを確認

### その他のテストカード
- 認証失敗: `4000 0027 6000 3184`（3Dセキュア要求）
- 支払い拒否: `4000 0000 0000 9995`
- カード期限切れ: `4000 0000 0000 0069`

詳細: https://docs.stripe.com/testing

## 7. 本番モード切替

検証完了後、本番化する手順：

1. Stripe Dashboard 左下のトグルを「**本番モード**」に切替
2. **開発者** → **APIキー** で本番キーを取得
   - `sk_live_xxxxxxxxxx`
   - `pk_live_xxxxxxxxxx`
3. Vercel環境変数を本番キーに差し替え
4. **Webhook URLを本番モードでも登録**（テストと本番は別管理）
5. 管理画面 → Stripeセットアップ → 「Stripe Product / Priceを作成」を実行
   - 本番モードでのProduct/PriceIDが新規作成される
6. 必要なら既存DBの `stripeProductId`, `stripePriceId` を本番のIDに上書き

## 8. ローカル開発でのWebhook受信

ローカル環境では Stripe CLI を使ってWebhookをフォワードします。

```bash
# Stripe CLI インストール（Windows）
# https://docs.stripe.com/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

表示される `whsec_xxxxx` を `.env` の `STRIPE_WEBHOOK_SECRET` に設定。

## トラブルシューティング

| 症状 | 対策 |
|------|------|
| 決済ページが読み込まれない | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` が設定されているか確認 |
| Webhook が動かない | `STRIPE_WEBHOOK_SECRET` がWebhook作成時のシークレットと一致しているか確認 |
| Subscription作成失敗 | コースの `stripePriceId` がDBにあるか確認（Stripeセットアップ画面を確認） |
| 「Stripeが未設定です」エラー | `STRIPE_SECRET_KEY` が `sk_test_` または `sk_live_` で始まっているか確認 |

## 既存モックデータについて

本番化前にモック決済（`mock_pi_xxx`）で登録した既存ユーザーは：

- 既存契約のStripe Subscription はないため、月次課金は走らない
- 解約処理時にStripe APIエラーが出る可能性 → 該当箇所で `stripeSubscriptionId?.startsWith("mock_")` チェックを追加してスキップ済み（または手動マイグレーションで補完）
- 履歴情報として残しておくのは無害

実運用前に既存テストユーザーを `/admin/users/[id]` から「アカウント無効化」しておくことを推奨。

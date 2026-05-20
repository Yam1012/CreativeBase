# メール送信セットアップ手順（Resend）

## なぜResend？

- 開発者フレンドリーで信頼性が高い
- 月3,000通まで無料、その後 $20/月〜
- 配信ログが Resend Dashboard で詳細に確認可能
- ドメイン認証（SPF/DKIM/DMARC）が簡単
- React コンポーネントから直接メールHTML生成可能

## セットアップ手順

### 1. Resend アカウント作成

1. https://resend.com にアクセス
2. サインアップ（GitHub/Google連携可）

### 2. ドメイン認証（本番運用に必須）

1. Resend Dashboard → **Domains** → **Add Domain**
2. `datanote.net` を入力
3. 表示されたDNSレコード（SPF, DKIM, DMARC）を、ドメイン管理画面に追加
4. 認証完了まで数分〜数時間待つ
5. ステータスが **Verified** になればOK

> ⚠️ ドメイン認証していないと、テスト用の `onboarding@resend.dev` からしか送信できません

### 3. API キー取得

1. Resend Dashboard → **API Keys** → **Create API Key**
2. 名前: `Creative Base Production` 等
3. Permission: **Full Access**
4. 生成されたキー（`re_...` 形式）をコピー（一度しか表示されないので注意）

### 4. Vercel環境変数に設定

Vercel Dashboard → Project → Settings → Environment Variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Creative Base <noreply@datanote.net>
```

→ **Save** → **Redeploy**

### 5. テスト送信

1. パスワード再発行などのメール送信を試す
2. Resend Dashboard → **Logs** で配信状況確認
3. 失敗時はエラー詳細も確認可能

## SMTPフォールバック

`RESEND_API_KEY` が未設定の場合、既存のnodemailerによるSMTP送信に自動フォールバックします。
本番運用時は Resend の利用を強く推奨します。

## EmailLog （管理機能）

Creative Base 側でも全メール送信履歴を保存:
- `recipient`: 宛先
- `provider`: resend / smtp / dev
- `messageId`: 送信プロバイダのメッセージID
- `status`: sent / failed
- `errorDetail`: 失敗時の詳細

将来的に `/admin/email-logs` ページで一覧表示可能。

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "プライバシーポリシー | Creative Base",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />トップへ戻る</Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 space-y-6 text-sm leading-relaxed">
          <header className="border-b pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">プライバシーポリシー</h1>
            <p className="text-xs text-gray-500 mt-2">最終更新日：2026年5月20日</p>
          </header>

          <section className="space-y-3">
            <p>
              株式会社データノート（以下「当社」といいます）は、お客様の個人情報の重要性を認識し、その保護の徹底を図るため、本プライバシーポリシーを定め、これを実行いたします。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">1. 収集する個人情報</h2>
            <p>当社は、本サービスの提供にあたり、以下の個人情報を収集することがあります。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>氏名・フリガナ</li>
              <li>メールアドレス</li>
              <li>電話番号</li>
              <li>住所</li>
              <li>法人名・所属組織名</li>
              <li>Chatwork ID等の連絡先情報</li>
              <li>クレジットカード情報（Stripe社の決済システムを利用し、当社サーバーには保存されません）</li>
              <li>サービス利用履歴・アクセスログ</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">2. 利用目的</h2>
            <p>当社は、収集した個人情報を以下の目的で利用します。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの提供、運営、改善</li>
              <li>ユーザー認証および利用者管理</li>
              <li>料金請求・決済処理</li>
              <li>お問い合わせ・サポート対応</li>
              <li>制作物の納品・配送</li>
              <li>新サービスや各種お知らせのご案内</li>
              <li>利用規約違反者への対応</li>
              <li>サービス改善のための統計分析</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">3. 第三者提供</h2>
            <p>当社は、以下の場合を除き、お客様の個人情報を第三者に開示・提供することはありません。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>お客様の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護のために必要であって、本人の同意を得ることが困難な場合</li>
              <li>業務委託先（決済代行業者、メール配信業者、クラウドサーバー業者等）に必要な範囲で提供する場合</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">4. 業務委託先</h2>
            <p>当社は、本サービスの提供にあたり、以下の業務委託先に個人情報を提供する場合があります。これらの委託先は、当社が定める個人情報保護の基準を満たしています。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Stripe, Inc.（決済処理）</li>
              <li>Vercel, Inc.（ホスティング・ファイルストレージ）</li>
              <li>Neon, Inc.（データベース）</li>
              <li>Google LLC（アクセス解析）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">5. クッキー（Cookie）等の利用</h2>
            <p>本サービスは、サービスの提供および利用状況の分析のため、クッキーおよび類似の技術を利用することがあります。お客様はブラウザの設定によりクッキーの使用を無効にすることができますが、その場合、本サービスの一部機能が利用できなくなる可能性があります。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">6. 個人情報の開示・訂正・削除</h2>
            <p>お客様は、当社に対し、自己の個人情報の開示・訂正・追加・削除・利用停止・消去等を求めることができます。ご希望の場合は、下記のお問い合わせ窓口までご連絡ください。当社は、法令に従い適切な対応を行います。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">7. 安全管理措置</h2>
            <p>当社は、個人情報の漏洩、滅失または毀損の防止その他の個人情報の安全管理のために、適切かつ合理的な水準の安全管理措置を講じます。具体的には、SSL/TLSによる通信の暗号化、データベースのアクセス制御、定期的なセキュリティ監査等を実施しています。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">8. プライバシーポリシーの変更</h2>
            <p>当社は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のプライバシーポリシーは、本サイト上に掲載した時点で効力を生じるものとします。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold border-l-4 border-blue-500 pl-3">9. お問い合わせ窓口</h2>
            <p>個人情報の取扱いに関するお問い合わせは、以下までご連絡ください。</p>
            <div className="bg-gray-50 rounded p-4 mt-2">
              <p>株式会社データノート</p>
              <p>Email: <a href="mailto:support@datanote.net" className="text-blue-600 hover:underline">support@datanote.net</a></p>
              <p>受付時間: 平日 10:00〜18:00</p>
            </div>
          </section>

          <footer className="border-t pt-4 mt-8 text-xs text-gray-500">
            <p>以上</p>
            <p className="mt-2">株式会社データノート</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

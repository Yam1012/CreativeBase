import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "特定商取引法に基づく表記 | Creative Base",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />トップへ戻る</Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-10 space-y-4 text-sm leading-relaxed">
          <header className="border-b pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">特定商取引法に基づく表記</h1>
            <p className="text-xs text-gray-500 mt-2">最終更新日：2026年5月20日</p>
          </header>

          <div className="space-y-1">
            <Row label="販売事業者" value="株式会社データノート" />
            <Row label="運営責任者" value="代表取締役" />
            <Row label="所在地" value="お問い合わせ時に開示" />
            <Row label="電話番号" value="お問い合わせ時に開示（カスタマーサポート: support@datanote.net）" />
            <Row label="メールアドレス" value={<a href="mailto:support@datanote.net" className="text-blue-600 hover:underline">support@datanote.net</a>} />
            <Row label="販売価格" value="各コース・サービスページに記載の通り（税別）" />
            <Row label="商品代金以外の必要料金" value="消費税、振込手数料（銀行振込の場合）" />
            <Row label="支払方法" value="クレジットカード決済（Stripe社の決済システムを利用）" />
            <Row label="支払時期" value="決済時に課金、サブスクリプションは毎月自動更新" />
            <Row label="サービス提供時期" value="決済完了後、即時利用可能。制作物は内容に応じて別途協議" />
            <Row label="返品・キャンセル" value="サービスの性質上、決済完了後の返品はお受けできません。ただし契約解約時に残期間分の日割り返金を行う場合があります" />
            <Row label="解約方法" value="マイページの「アカウント解約」または「契約解約」より手続き可能" />
            <Row label="動作環境" value="最新版の Chrome / Safari / Firefox / Edge の使用を推奨" />
          </div>

          <footer className="border-t pt-4 mt-8 text-xs text-gray-500">
            <p>株式会社データノート</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-gray-100">
      <div className="text-gray-500 sm:w-44 shrink-0 font-medium text-xs sm:text-sm">{label}</div>
      <div className="sm:flex-1 mt-1 sm:mt-0 text-sm">{value}</div>
    </div>
  );
}

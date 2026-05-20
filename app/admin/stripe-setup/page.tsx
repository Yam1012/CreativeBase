import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isStripeReady } from "@/lib/stripe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";
import { StripeSetupButton } from "./stripe-setup-button";

export default async function StripeSetupPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const stripeReady = isStripeReady();
  const courses = await prisma.course.findMany({
    where: { type: "subscription" },
    orderBy: { monthlyFee: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6" /> Stripe セットアップ
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          各コースに対応するStripe Product / Price を作成・確認します
        </p>
      </div>

      {/* 接続状態 */}
      <Card className={stripeReady ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <CardContent className="py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">
              Stripe APIキー: {stripeReady ? "✅ 設定済み" : "❌ 未設定"}
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {stripeReady
                ? "環境変数 STRIPE_SECRET_KEY が有効です"
                : "環境変数 STRIPE_SECRET_KEY にテストキー（sk_test_xxx）または本番キー（sk_live_xxx）を設定してください"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* コース別Stripe設定状況 */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">コース別Product/Price 状況</CardTitle>
          {stripeReady && <StripeSetupButton />}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courses.map((course) => {
              const hasProduct = !!course.stripeProductId;
              const hasPrice = !!course.stripePriceId;
              const hasInitial = !!course.stripeInitialPriceId;
              return (
                <div key={course.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{course.name}</div>
                    <Badge className={hasProduct && hasPrice ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                      {hasProduct && hasPrice ? "設定済" : "未設定"}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    月額: ¥{course.monthlyFee.toLocaleString()} | 初期費用: ¥{course.initialFee.toLocaleString()}
                  </div>
                  <div className="text-xs space-y-1 font-mono">
                    <div>
                      <span className="text-gray-400">Product:</span>{" "}
                      {hasProduct ? <code className="bg-gray-100 px-1.5 py-0.5 rounded">{course.stripeProductId}</code> : <span className="text-gray-400">—</span>}
                    </div>
                    <div>
                      <span className="text-gray-400">月額 Price:</span>{" "}
                      {hasPrice ? <code className="bg-gray-100 px-1.5 py-0.5 rounded">{course.stripePriceId}</code> : <span className="text-gray-400">—</span>}
                    </div>
                    <div>
                      <span className="text-gray-400">初期費用 Price:</span>{" "}
                      {hasInitial ? <code className="bg-gray-100 px-1.5 py-0.5 rounded">{course.stripeInitialPriceId}</code> : <span className="text-gray-400">—</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 操作手順 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">セットアップ手順</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-gray-700">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li><a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripeダッシュボード</a> からテストキー（sk_test_xxx / pk_test_xxx）を取得</li>
            <li>Vercelの環境変数に <code className="bg-gray-100 px-1 rounded">STRIPE_SECRET_KEY</code>, <code className="bg-gray-100 px-1 rounded">STRIPE_PUBLISHABLE_KEY</code>, <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> を設定</li>
            <li>「Stripe Product / Priceを作成」ボタンを押す</li>
            <li>Stripeダッシュボードで Webhook URL <code className="bg-gray-100 px-1 rounded">/api/webhooks/stripe</code> を登録、<code className="bg-gray-100 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> を取得</li>
            <li>新規登録テスト（テストカード <code className="bg-gray-100 px-1 rounded">4242 4242 4242 4242</code>）</li>
            <li>本番化時は環境変数だけ <code className="bg-gray-100 px-1 rounded">sk_live_xxx</code> / <code className="bg-gray-100 px-1 rounded">pk_live_xxx</code> に差し替え</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

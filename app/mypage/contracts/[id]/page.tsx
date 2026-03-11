import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, XCircle, ShoppingBag } from "lucide-react";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const contract = await prisma.contract.findFirst({
    where: { id, userId },
    include: { course: true },
  });

  if (!contract) notFound();

  // 年間クォータ計算
  const yearlyLimit = contract.course.maxCreationsPerMonth * 12;
  const usedCount = await prisma.spotOrder.count({
    where: {
      contractId: id,
      status: { not: "cancelled" },
    },
  });
  const remaining = yearlyLimit - usedCount;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage/contracts">
            <ArrowLeft className="w-4 h-4 mr-1" />
            契約一覧に戻る
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">契約詳細・管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">{contract.course.name}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">現在の契約内容</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">プラン</div>
            <div className="font-semibold">{contract.course.name}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">ステータス</div>
            <Badge className="bg-green-100 text-green-700">{contract.status === "active" ? "契約中" : "処理中"}</Badge>
          </div>
          <div>
            <div className="text-gray-500 text-xs">年額（税別）</div>
            <div className="font-semibold">¥{(contract.course.monthlyFee * 12).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">年間作成数</div>
            <div className="font-semibold">{contract.course.maxCreationsPerMonth * 12}本</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">契約開始日</div>
            <div className="font-semibold">{new Date(contract.startDate).toLocaleDateString("ja-JP")}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">次回請求日</div>
            <div className="font-semibold">{new Date(contract.nextBillingDate).toLocaleDateString("ja-JP")}</div>
          </div>
        </CardContent>
      </Card>

      {/* 年間制作枠 */}
      {contract.status === "active" && yearlyLimit > 0 && (
        <Card className={remaining > 0 ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-700">年間制作枠</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {usedCount}本使用済み / {yearlyLimit}本中
                </div>
              </div>
              {remaining > 0 ? (
                <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
                  残り {remaining} 本
                </Badge>
              ) : (
                <Badge className="bg-gray-200 text-gray-600 text-sm px-3 py-1">
                  枠消化済み
                </Badge>
              )}
            </div>
            {/* プログレスバー */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${remaining > 0 ? "bg-green-500" : "bg-gray-400"}`}
                style={{ width: `${Math.min((usedCount / yearlyLimit) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* オーダーボタン */}
      {contract.status === "active" && remaining > 0 && (
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-200 bg-purple-50">
          <Link href={`/mypage/contracts/${contract.id}/order`}>
            <CardContent className="pt-6 pb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-purple-700">オーダーする</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  動画・LP制作を依頼します（残り{remaining}本）
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      )}

      {contract.status === "active" && remaining <= 0 && yearlyLimit > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
          年間の制作枠をすべて消化しました。追加制作は
          <Link href="/mypage/orders/new" className="text-blue-600 underline ml-1">
            スポットオーダー
          </Link>
          をご利用ください。
        </div>
      )}

      {/* 操作メニュー */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href={`/mypage/contracts/${contract.id}/change`}>
            <CardContent className="pt-6 pb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-sm">コースを変更する</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  別のプランに変更します。差額が発生します。
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer border-red-100">
          <Link href={`/mypage/contracts/${contract.id}/cancel`}>
            <CardContent className="pt-6 pb-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="font-semibold text-sm text-red-700">このコースを解約する</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  解約後は日割りで残金を計算します。
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}

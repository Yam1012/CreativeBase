import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ShoppingBag, CreditCard, Plus } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  active: "契約中",
  cancelled: "解約済",
  pending: "処理中",
};

const STATUS_COLOR: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default async function MypagePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const [contracts, recentPayments, spotOrders] = await Promise.all([
    prisma.contract.findMany({
      where: { userId, status: { not: "cancelled" } },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.spotOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const totalMonthly = contracts
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + c.course.monthlyFee, 0);

  return (
    <div className="space-y-6">
      {/* ウェルカム */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            こんにちは、{session.user.name} さん
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">マイページダッシュボード</p>
        </div>
        {contracts.length === 0 && (
          <Button asChild className="bg-blue-600 hover:bg-blue-500">
            <Link href="/register/course">
              <Plus className="w-4 h-4 mr-1" />
              コースに申し込む
            </Link>
          </Button>
        )}
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">契約中コース</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.filter(c => c.status === "active").length}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">月額合計（税別）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalMonthly.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">オーダー数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{spotOrders.length}件</div>
          </CardContent>
        </Card>
      </div>

      {/* 契約中コース */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" /> 契約中コース
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mypage/contracts">すべて表示</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {contracts.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              契約中のコースはありません
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{contract.course.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      月額 ¥{contract.course.monthlyFee.toLocaleString()} |
                      次回請求: {new Date(contract.nextBillingDate).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                  <Badge className={STATUS_COLOR[contract.status]}>
                    {STATUS_LABEL[contract.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 追加オーダー */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> 追加オーダー
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mypage/orders">すべて表示</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {spotOrders.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              追加オーダーはありません
            </div>
          ) : (
            <div className="space-y-2">
              {spotOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <span className="font-medium">{order.type === "video" ? "動画制作" : "LP制作"}</span>
                    <span className="text-gray-500 ml-2">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <Badge className={STATUS_COLOR[order.status] || "bg-gray-100 text-gray-600"}>
                    {order.status === "pending" ? "受付中" : order.status === "in_progress" ? "制作中" : "完了"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 決済履歴 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> 最近の決済
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">決済履歴はありません</div>
          ) : (
            <div className="space-y-2">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <div className="font-medium">{payment.description || payment.type}</div>
                    <div className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString("ja-JP")}</div>
                  </div>
                  <div className="font-semibold">¥{payment.amount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

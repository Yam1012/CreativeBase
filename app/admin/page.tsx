import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ShoppingBag, CreditCard, Clock, RotateCcw, Star, TrendingUp } from "lucide-react";
import {
  MonthlyRevenueChart, UserGrowthChart, StatusDistributionChart,
} from "@/components/admin/charts";

export default async function AdminPage() {
  const [
    totalUsers,
    activeContracts,
    pendingOrders,
    totalRevenue,
    recentUsers,
    recentOrders,
    allPayments,
    allUsers,
    allOrders,
    allReviews,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "user" } }),
    prisma.contract.count({ where: { status: "active" } }),
    prisma.spotOrder.count({ where: { status: "pending" } }),
    prisma.payment.aggregate({
      where: { status: "completed", type: { not: "refund" } },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      where: { role: "user" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.spotOrder.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // 月別売上計算用
    prisma.payment.findMany({
      where: {
        status: "completed",
        type: { not: "refund" },
        createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) },
      },
      select: { amount: true, createdAt: true },
    }),
    // 月別新規ユーザー
    prisma.user.findMany({
      where: {
        role: "user",
        createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) },
      },
      select: { createdAt: true },
    }),
    // ステータス分布・KPI計算用
    prisma.spotOrder.findMany({
      select: { status: true, createdAt: true, updatedAt: true, notes: true },
    }),
    // 平均満足度
    prisma.orderReview.findMany({ select: { rating: true } }),
  ]);

  // 月別データ集計
  const monthLabels: string[] = [];
  const monthKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    monthLabels.push(`${d.getMonth() + 1}月`);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const revenueByMonth: Record<string, number> = {};
  allPayments.forEach((p) => {
    const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, "0")}`;
    revenueByMonth[key] = (revenueByMonth[key] || 0) + p.amount;
  });
  const revenueData = monthKeys.map((k, i) => ({
    label: monthLabels[i],
    value: revenueByMonth[k] || 0,
  }));

  const usersByMonth: Record<string, number> = {};
  allUsers.forEach((u) => {
    const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, "0")}`;
    usersByMonth[key] = (usersByMonth[key] || 0) + 1;
  });
  const userGrowthData = monthKeys.map((k, i) => ({
    label: monthLabels[i],
    value: usersByMonth[k] || 0,
  }));

  // ステータス分布
  const statusCounts: Record<string, number> = {};
  allOrders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const statusData = [
    { label: "受付中", value: statusCounts.pending || 0, color: "#eab308" },
    { label: "制作中", value: statusCounts.in_progress || 0, color: "#2563eb" },
    { label: "確認待ち", value: statusCounts.review_pending || 0, color: "#6366f1" },
    { label: "修正依頼中", value: statusCounts.revision_requested || 0, color: "#f97316" },
    { label: "完了", value: statusCounts.completed || 0, color: "#16a34a" },
  ].filter((s) => s.value > 0);

  // 平均納期（completed のみ・直近30日）
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentCompleted = allOrders.filter(
    (o) => o.status === "completed" && o.updatedAt >= thirtyDaysAgo
  );
  const avgDeliveryDays = recentCompleted.length > 0
    ? (recentCompleted.reduce((sum, o) => {
        const days = (o.updatedAt.getTime() - o.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / recentCompleted.length).toFixed(1)
    : "—";

  // 修正依頼率
  const completedTotal = allOrders.filter((o) => o.status === "completed").length;
  const revisionRequested = allOrders.filter((o) => o.status === "revision_requested").length;
  const revisionRate = completedTotal + revisionRequested > 0
    ? Math.round((revisionRequested / (completedTotal + revisionRequested)) * 100)
    : 0;

  // 平均満足度
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(2)
    : "—";

  const stats = [
    { label: "総ユーザー数", value: `${totalUsers}人`, icon: Users, color: "text-blue-600" },
    { label: "有効契約数", value: `${activeContracts}件`, icon: FileText, color: "text-green-600" },
    { label: "未対応オーダー", value: `${pendingOrders}件`, icon: ShoppingBag, color: "text-orange-600" },
    { label: "累計売上（税別）", value: `¥${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: CreditCard, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-0.5">Creative Base 管理画面</p>
      </div>

      {/* メインKPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 運用指標 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-7 h-7 text-blue-500" />
              <div>
                <div className="text-xl font-bold">{avgDeliveryDays}{avgDeliveryDays !== "—" && <span className="text-sm font-normal ml-1">日</span>}</div>
                <div className="text-xs text-gray-500">平均納期（直近30日）</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-7 h-7 text-orange-500" />
              <div>
                <div className="text-xl font-bold">{revisionRate}%</div>
                <div className="text-xs text-gray-500">修正依頼率</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Star className="w-7 h-7 text-amber-500 fill-amber-400" />
              <div>
                <div className="text-xl font-bold">{avgRating}<span className="text-sm font-normal text-gray-500 ml-1">/ 5</span></div>
                <div className="text-xs text-gray-500">平均満足度（{allReviews.length}件）</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* グラフ */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              月別売上推移（直近12ヶ月）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyRevenueChart data={revenueData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              新規ユーザー推移（直近12ヶ月）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowthData} />
          </CardContent>
        </Card>
      </div>

      {statusData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              オーダーステータス分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart data={statusData} />
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* 最近のユーザー */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />最近の登録ユーザー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 最近のオーダー */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />最近のオーダー
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div>
                  <div className="font-medium">{order.user.name}</div>
                  <div className="text-xs text-gray-500">{order.type === "video" ? "動画制作" : "LP制作"}</div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-700"
                    : order.status === "in_progress" ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}>
                  {order.status === "pending" ? "受付中" : order.status === "in_progress" ? "制作中" : "完了"}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

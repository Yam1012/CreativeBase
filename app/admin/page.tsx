import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, ShoppingBag, CreditCard, ChevronRight, AlertCircle } from "lucide-react";

export default async function AdminPage() {
  const [
    totalUsers,
    activeContracts,
    pendingOrders,
    totalRevenue,
    recentUsers,
    recentOrders,
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
  ]);

  const stats = [
    { label: "総ユーザー数", value: `${totalUsers}人`, icon: Users, color: "text-blue-600", href: "/admin/users" },
    { label: "有効契約数", value: `${activeContracts}件`, icon: FileText, color: "text-green-600", href: "/admin/contracts" },
    { label: "未対応オーダー", value: `${pendingOrders}件`, icon: ShoppingBag, color: "text-orange-600", href: "/admin/orders" },
    { label: "累計売上（税別）", value: `¥${(totalRevenue._sum.amount || 0).toLocaleString()}`, icon: CreditCard, color: "text-purple-600", href: "/admin/payments" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">運用管理ダッシュボード</h1>
        <p className="text-gray-500 text-sm mt-0.5">ユーザー・契約・オーダー・売上の全体管理</p>
      </div>

      {/* 未対応オーダーのアラート */}
      {pendingOrders > 0 && (
        <Link href="/admin/orders" className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-amber-800">未対応のオーダーが {pendingOrders}件 あります</div>
            <div className="text-xs text-amber-600 mt-0.5">クリックしてオーダー管理へ移動</div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </Link>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 最近の登録ユーザー */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />最近の登録ユーザー
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">すべて表示</Link>
            </Button>
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
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />最近のオーダー
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">すべて表示</Link>
            </Button>
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

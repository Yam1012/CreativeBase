import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AdminOrderActions from "./order-actions";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
};

export default async function AdminOrdersPage() {
  const orders = await prisma.spotOrder.findMany({
    include: {
      user: { select: { name: true, email: true } },
      files: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">オーダー管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">追加オーダーの管理・ステータス変更</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">オーダー一覧（{orders.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>最速納品</TableHead>
                <TableHead>ファイル</TableHead>
                <TableHead>注文日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const s = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{order.user.name}</div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </TableCell>
                    <TableCell>{order.type === "video" ? "動画制作" : "LP制作"}</TableCell>
                    <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                    <TableCell>{order.rushDelivery ? "あり" : "なし"}</TableCell>
                    <TableCell>{order.files.length}件</TableCell>
                    <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell>
                      <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, FileText, Video } from "lucide-react";
import AdminOrderActions from "./order-actions";
import { OrderFilter } from "./order-filter";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
  review_pending: { label: "確認待ち", color: "bg-indigo-100 text-indigo-700" },
  revision_requested: { label: "修正依頼中", color: "bg-orange-100 text-orange-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
};

interface SearchParams {
  q?: string;
  status?: string;
  type?: string;
  purpose?: string;
  from?: string;
  to?: string;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Prisma WHERE 構築
  const where: Record<string, unknown> = {};
  if (params.status && params.status !== "all") where.status = params.status;
  if (params.type && params.type !== "all") where.type = params.type;
  if (params.purpose && params.purpose !== "all") where.purpose = params.purpose;
  if (params.from || params.to) {
    const created: Record<string, Date> = {};
    if (params.from) created.gte = new Date(params.from);
    if (params.to) {
      const end = new Date(params.to);
      end.setHours(23, 59, 59, 999);
      created.lte = end;
    }
    where.createdAt = created;
  }
  if (params.q) {
    where.user = {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { email: { contains: params.q, mode: "insensitive" } },
      ],
    };
  }

  const orders = await prisma.spotOrder.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      files: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">オーダー管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">追加オーダーの管理・ステータス変更（行クリックで詳細）</p>
      </div>

      <OrderFilter showUserSearch={true} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">オーダー一覧（{orders.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {/* デスクトップ: テーブル */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>目的</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>最速納品</TableHead>
                  <TableHead>ファイル</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>注文日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const s = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <TableRow key={order.id} className="hover:bg-blue-50/50 cursor-pointer">
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          <div className="font-medium text-sm hover:underline text-blue-600">{order.user.name}</div>
                          <div className="text-xs text-gray-500">{order.user.email}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-1.5">
                          {order.type === "video" ? <Video className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-purple-500" />}
                          {order.type === "video" ? "動画制作" : "LP制作"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="block">
                          {order.purpose === "presentation" ? <Badge variant="outline" className="text-indigo-600 border-indigo-300">プレゼン</Badge>
                            : order.purpose === "promotion" ? <Badge variant="outline" className="text-pink-600 border-pink-300">プロモ</Badge>
                            : <span className="text-xs text-gray-400">—</span>}
                        </Link>
                      </TableCell>
                      <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                      <TableCell className="text-sm">{order.rushDelivery ? "あり" : "なし"}</TableCell>
                      <TableCell className="text-sm">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                          {order.files.length}件
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {order.totalPrice > 0 ? `¥${order.totalPrice.toLocaleString()}` : <span className="text-gray-400">未確定</span>}
                      </TableCell>
                      <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <AdminOrderActions orderId={order.id} currentStatus={order.status} />
                          <Button variant="ghost" size="sm" asChild title="詳細を開く">
                            <Link href={`/admin/orders/${order.id}`}>
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* モバイル: カード */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => {
              const s = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100" };
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="block">
                  <div className="bg-gray-50 hover:bg-blue-50 rounded-lg p-3 space-y-1.5 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium">{order.user.name}</div>
                        <div className="text-xs text-gray-400">{order.user.email}</div>
                      </div>
                      <Badge className={`shrink-0 ${s.color}`}>{s.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {order.type === "video" ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <FileText className="w-3.5 h-3.5 text-purple-500" />}
                      <span>{order.type === "video" ? "動画" : "LP"}</span>
                      {order.purpose && (
                        <Badge variant="outline" className="text-xs">
                          {order.purpose === "presentation" ? "プレゼン" : "プロモ"}
                        </Badge>
                      )}
                      <span className="text-gray-400">・ファイル{order.files.length}件</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {order.totalPrice > 0 ? `¥${order.totalPrice.toLocaleString()}` : <span className="text-gray-400">未確定</span>}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Video, FileText, ChevronRight } from "lucide-react";
import { OrderFilter } from "@/app/admin/orders/order-filter";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
  review_pending: { label: "確認待ち", color: "bg-indigo-100 text-indigo-700" },
  revision_requested: { label: "修正依頼中", color: "bg-orange-100 text-orange-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
};

interface SearchParams {
  status?: string;
  type?: string;
  purpose?: string;
  from?: string;
  to?: string;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;
  const params = await searchParams;

  const where: Record<string, unknown> = { userId };
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

  const orders = await prisma.spotOrder.findMany({
    where,
    include: { files: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">オーダー一覧</h1>
          <p className="text-gray-500 text-sm mt-0.5">動画・LP制作の進捗管理（クリックで詳細）</p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 shadow-sm">
          <Link href="/mypage/orders/new">
            <Plus className="w-5 h-5 mr-1" />
            新規オーダーを申し込む
          </Link>
        </Button>
      </div>

      <OrderFilter />

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p>オーダーはまだありません</p>
            <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-500">
              <Link href="/mypage/orders/new">最初のオーダーを申し込む</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Link key={order.id} href={`/mypage/orders/${order.id}`} className="block group">
              <Card className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {order.type === "video" ? (
                        <Video className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-500" />
                      )}
                      {order.type === "video" ? "動画制作" : "LP制作"}
                      {order.purpose && (
                        <Badge variant="outline" className="text-xs ml-1">
                          {order.purpose === "presentation" ? "プレゼン用" : "プロモーション用"}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={status.color}>{status.label}</Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">注文日</div>
                    <div className="font-medium">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">金額（税別）</div>
                    <div className="font-medium">
                      {order.totalPrice > 0 ? `¥${order.totalPrice.toLocaleString()}` : "未確定"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">最速納品</div>
                    <div className="font-medium">{order.rushDelivery ? "あり" : "なし"}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">ファイル</div>
                    <div className="font-medium">{order.files.length}件</div>
                  </div>
                  {order.notes && (
                    <div className="col-span-full">
                      <div className="text-gray-500 text-xs">備考</div>
                      <div className="text-gray-700">{order.notes}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

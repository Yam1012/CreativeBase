import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Video, FileText } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const orders = await prisma.spotOrder.findMany({
    where: { userId },
    include: { files: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">追加オーダー</h1>
          <p className="text-gray-500 text-sm mt-0.5">動画・LP制作の単発注文</p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-500">
          <Link href="/mypage/orders/new">
            <Plus className="w-4 h-4 mr-1" />
            新規オーダー
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p>追加オーダーはありません</p>
            <Button asChild className="mt-4 bg-blue-600 hover:bg-blue-500">
              <Link href="/mypage/orders/new">オーダーを申し込む</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {order.type === "video" ? (
                        <Video className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-purple-500" />
                      )}
                      {order.type === "video" ? "動画制作" : "LP制作"}
                    </CardTitle>
                    <Badge className={status.color}>{status.label}</Badge>
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
            );
          })}
        </div>
      )}
    </div>
  );
}

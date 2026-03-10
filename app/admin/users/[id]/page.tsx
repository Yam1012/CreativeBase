import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const CONTRACT_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "契約中", color: "bg-green-100 text-green-700" },
  cancelled: { label: "解約済", color: "bg-red-100 text-red-700" },
  pending: { label: "処理中", color: "bg-yellow-100 text-yellow-700" },
};

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
};

const PAYMENT_TYPE: Record<string, string> = {
  initial: "初期費用",
  monthly: "月額",
  spot: "スポット",
  refund: "返金",
};

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      contracts: { include: { course: true }, orderBy: { createdAt: "desc" } },
      spotOrders: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
      inquiries: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) notFound();

  const roleBadge = user.role === "admin"
    ? { label: "管理者", color: "bg-purple-100 text-purple-700" }
    : user.role === "cancelled"
    ? { label: "解約済", color: "bg-red-100 text-red-700" }
    : { label: "会員", color: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/users"><ArrowLeft className="w-4 h-4 mr-1" />ユーザー一覧に戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">ユーザー詳細</h1>
      </div>

      {/* 基本情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">氏名</span>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <span className="text-gray-500">氏名（カナ）</span>
              <p className="font-medium">{user.nameKana || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">メールアドレス</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-gray-500">電話番号</span>
              <p className="font-medium">{user.phone || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">住所</span>
              <p className="font-medium">{user.address || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">ロール</span>
              <p><Badge className={roleBadge.color}>{roleBadge.label}</Badge></p>
            </div>
            <div>
              <span className="text-gray-500">登録日</span>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString("ja-JP")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 契約一覧 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">契約一覧（{user.contracts.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {user.contracts.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">契約なし</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>コース</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>月額</TableHead>
                  <TableHead>開始日</TableHead>
                  <TableHead>次回請求</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.contracts.map((c) => {
                  const s = CONTRACT_STATUS[c.status] || { label: c.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.course.name}</TableCell>
                      <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                      <TableCell>¥{c.course.monthlyFee.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{new Date(c.startDate).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell className="text-sm">
                        {c.status === "active" ? new Date(c.nextBillingDate).toLocaleDateString("ja-JP") : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* オーダー一覧 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">オーダー一覧（{user.spotOrders.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {user.spotOrders.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">オーダーなし</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>種別</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>最速納品</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>備考</TableHead>
                  <TableHead>注文日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.spotOrders.map((o) => {
                  const s = ORDER_STATUS[o.status] || { label: o.status, color: "bg-gray-100 text-gray-600" };
                  return (
                    <TableRow key={o.id}>
                      <TableCell>{o.type === "video" ? "動画制作" : "LP制作"}</TableCell>
                      <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                      <TableCell>{o.rushDelivery ? "あり" : "なし"}</TableCell>
                      <TableCell>{o.totalPrice > 0 ? `¥${o.totalPrice.toLocaleString()}` : "未確定"}</TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">{o.notes || "—"}</TableCell>
                      <TableCell className="text-sm">{new Date(o.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 決済履歴 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">決済履歴（直近20件）</CardTitle>
        </CardHeader>
        <CardContent>
          {user.payments.length === 0 ? (
            <p className="text-gray-400 text-sm py-4 text-center">決済履歴なし</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>種別</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>日付</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{PAYMENT_TYPE[p.type] || p.type}</TableCell>
                    <TableCell className={p.type === "refund" ? "text-red-600" : ""}>
                      {p.type === "refund" ? "-" : ""}¥{p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        p.status === "completed" ? "bg-green-100 text-green-700"
                        : p.status === "failed" ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                      }>
                        {p.status === "completed" ? "完了" : p.status === "failed" ? "失敗" : "処理中"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{p.description || "—"}</TableCell>
                    <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 問い合わせ一覧 */}
      {user.inquiries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">問い合わせ履歴（{user.inquiries.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ステータス</TableHead>
                  <TableHead className="w-[60%]">内容</TableHead>
                  <TableHead>受付日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell>
                      <Badge className={
                        inq.status === "new" ? "bg-red-100 text-red-700"
                        : inq.status === "replied" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                      }>
                        {inq.status === "new" ? "新規" : inq.status === "replied" ? "対応済" : "完了"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm whitespace-pre-wrap">{inq.message}</TableCell>
                    <TableCell className="text-sm">{new Date(inq.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

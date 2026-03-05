import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TYPE_MAP: Record<string, string> = {
  initial: "初期費用",
  monthly: "月額",
  spot: "スポット",
  refund: "返金",
};
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
  pending: { label: "処理中", color: "bg-yellow-100 text-yellow-700" },
  failed: { label: "失敗", color: "bg-red-100 text-red-700" },
};

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const total = payments
    .filter((p) => p.status === "completed" && p.type !== "refund")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">決済管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">決済履歴の確認</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">¥{total.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">累計売上（税別）</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{payments.filter(p => p.type !== "refund").length}件</div>
            <div className="text-xs text-gray-500 mt-1">決済件数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              ¥{payments.filter(p => p.type === "refund").reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">返金合計</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">決済履歴</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>備考</TableHead>
                <TableHead>日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const s = STATUS_MAP[p.status] || { label: p.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{p.user.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={p.type === "refund" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                        {TYPE_MAP[p.type] || p.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-semibold ${p.type === "refund" ? "text-red-600" : ""}`}>
                      {p.type === "refund" ? "-" : ""}¥{p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                    <TableCell className="text-xs text-gray-500 max-w-40 truncate">{p.description}</TableCell>
                    <TableCell className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString("ja-JP")}</TableCell>
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

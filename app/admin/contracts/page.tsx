import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ContractActions from "./contract-actions";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "契約中", color: "bg-green-100 text-green-700" },
  cancelled: { label: "解約済", color: "bg-red-100 text-red-700" },
  pending: { label: "処理中", color: "bg-yellow-100 text-yellow-700" },
};

export default async function AdminContractsPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      user: { select: { name: true, email: true } },
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">契約管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">全ユーザーの契約状況の確認・ステータス変更</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">契約一覧（{contracts.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>コース</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>月額</TableHead>
                <TableHead>契約開始</TableHead>
                <TableHead>次回請求</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((c) => {
                const s = STATUS_MAP[c.status] || { label: c.status, color: "bg-gray-100 text-gray-600" };
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{c.user.name}</div>
                      <div className="text-xs text-gray-500">{c.user.email}</div>
                    </TableCell>
                    <TableCell>{c.course.name}</TableCell>
                    <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                    <TableCell>¥{c.course.monthlyFee.toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{new Date(c.startDate).toLocaleDateString("ja-JP")}</TableCell>
                    <TableCell className="text-sm">
                      {c.status === "active" ? new Date(c.nextBillingDate).toLocaleDateString("ja-JP") : "—"}
                    </TableCell>
                    <TableCell>
                      <ContractActions contractId={c.id} currentStatus={c.status} />
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

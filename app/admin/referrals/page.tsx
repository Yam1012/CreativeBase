import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Gift, ExternalLink } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "未払い", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "支払済", color: "bg-green-100 text-green-700" },
  cancelled: { label: "キャンセル", color: "bg-red-100 text-red-700" },
};

export default async function AdminReferralsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const commissions = await prisma.referralCommission.findMany({
    include: {
      referrer: { select: { id: true, name: true, email: true, referralCode: true } },
      referred: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6" /> 紹介報酬管理
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          紹介経由で発生した報酬の一覧（決済額の17%）
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">報酬件数</div>
            <div className="text-2xl font-bold">{commissions.length}<span className="text-sm font-normal ml-0.5">件</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">未払い総額</div>
            <div className="text-2xl font-bold text-yellow-600">¥{totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">支払済総額</div>
            <div className="text-2xl font-bold text-green-600">¥{totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 一覧 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">報酬一覧（{commissions.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Gift className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>紹介報酬はまだありません</p>
            </div>
          ) : (
            <>
              {/* デスクトップ: テーブル */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>発生日</TableHead>
                      <TableHead>紹介者（報酬受取）</TableHead>
                      <TableHead>紹介された側</TableHead>
                      <TableHead>決済額</TableHead>
                      <TableHead>報酬額（17%）</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((c) => {
                      const s = STATUS_MAP[c.status] || { label: c.status, color: "bg-gray-100" };
                      return (
                        <TableRow key={c.id}>
                          <TableCell className="text-sm">
                            {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{c.referrer.name}</div>
                            <div className="text-xs text-gray-400">
                              {c.referrer.referralCode}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{c.referred.name}</div>
                            <div className="text-xs text-gray-400">{c.referred.email}</div>
                          </TableCell>
                          <TableCell className="text-sm">¥{c.baseAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-sm font-bold text-amber-600">
                            ¥{c.commissionAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={s.color}>{s.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/users/${c.referrer.id}`}>
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* モバイル: カード */}
              <div className="md:hidden space-y-3">
                {commissions.map((c) => {
                  const s = STATUS_MAP[c.status] || { label: c.status, color: "bg-gray-100" };
                  return (
                    <div key={c.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium">{c.referrer.name}</div>
                          <div className="text-xs text-gray-400">紹介者</div>
                        </div>
                        <Badge className={`shrink-0 ${s.color}`}>{s.label}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        {c.referred.name} の決済（¥{c.baseAmount.toLocaleString()}）
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-amber-600">
                          ¥{c.commissionAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString("ja-JP")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

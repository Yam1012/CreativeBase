import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink } from "lucide-react";

const TYPE_MAP: Record<string, string> = {
  initial: "初期費用＋初月分",
  monthly: "月額",
  spot: "スポット",
  refund: "返金",
};
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
  pending: { label: "処理中", color: "bg-yellow-100 text-yellow-700" },
  failed: { label: "失敗", color: "bg-red-100 text-red-700" },
};

// Stripeダッシュボードのリンクを生成（テスト/本番モード自動判定）
function getStripeDashboardUrl(payment: { stripePaymentId: string | null; stripeInvoiceId: string | null }): string | null {
  const isLive = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");
  const prefix = isLive
    ? "https://dashboard.stripe.com"
    : "https://dashboard.stripe.com/test";

  if (payment.stripeInvoiceId) {
    return `${prefix}/invoices/${payment.stripeInvoiceId}`;
  }
  if (payment.stripePaymentId && !payment.stripePaymentId.startsWith("mock_")) {
    return `${prefix}/payments/${payment.stripePaymentId}`;
  }
  return null;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>;
}) {
  const { type: filterType, status: filterStatus } = await searchParams;

  const where: Record<string, unknown> = {};
  if (filterType && filterType !== "all") where.type = filterType;
  if (filterStatus && filterStatus !== "all") where.status = filterStatus;

  const payments = await prisma.payment.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // 全件集計（フィルター無視）
  const all = await prisma.payment.findMany();
  const total = all.filter((p) => p.status === "completed" && p.type !== "refund").reduce((s, p) => s + p.amount, 0);
  const refundTotal = all.filter((p) => p.status === "completed" && p.type === "refund").reduce((s, p) => s + p.amount, 0);
  const monthlyTotal = all.filter((p) => p.status === "completed" && p.type === "monthly").reduce((s, p) => s + p.amount, 0);

  const typeTabs = [
    { key: "all", label: "全て" },
    { key: "initial", label: "初期＋初月" },
    { key: "monthly", label: "月額" },
    { key: "refund", label: "返金" },
  ];
  const statusTabs = [
    { key: "all", label: "全ステータス" },
    { key: "completed", label: "完了" },
    { key: "failed", label: "失敗" },
  ];

  const activeType = filterType || "all";
  const activeStatus = filterStatus || "all";

  const buildLink = (t: string, s: string) => {
    const params = new URLSearchParams();
    if (t !== "all") params.set("type", t);
    if (s !== "all") params.set("status", s);
    const qs = params.toString();
    return `/admin/payments${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">決済管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">Stripe決済履歴の確認・Stripeダッシュボード連携</p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">累計売上</div>
            <div className="text-xl sm:text-2xl font-bold">¥{total.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">月額課金累計</div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">¥{monthlyTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">返金合計</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">¥{refundTotal.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">決済件数</div>
            <div className="text-xl sm:text-2xl font-bold">{all.filter(p => p.type !== "refund").length}件</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {typeTabs.map((t) => (
            <Button
              key={t.key}
              variant={activeType === t.key ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={buildLink(t.key, activeStatus)}>{t.label}</Link>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((t) => (
            <Button
              key={t.key}
              variant={activeStatus === t.key ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={buildLink(activeType, t.key)}>{t.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* 履歴 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">決済履歴（{payments.length}件 / 直近200件まで表示）</CardTitle>
        </CardHeader>
        <CardContent>
          {/* デスクトップ */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日時</TableHead>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>備考</TableHead>
                  <TableHead>Stripe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => {
                  const s = STATUS_MAP[p.status] || { label: p.status, color: "bg-gray-100" };
                  const stripeUrl = getStripeDashboardUrl(p);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleString("ja-JP", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/users/${p.user.id}`} className="text-sm font-medium hover:underline">
                          {p.user.name}
                        </Link>
                        <div className="text-xs text-gray-400">{p.user.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={p.type === "refund" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                          {TYPE_MAP[p.type] || p.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${p.type === "refund" ? "text-orange-600" : ""}`}>
                        {p.type === "refund" ? "-" : ""}¥{p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell><Badge className={s.color}>{s.label}</Badge></TableCell>
                      <TableCell className="text-xs text-gray-500 max-w-[200px] truncate" title={p.description || ""}>
                        {p.description || "—"}
                      </TableCell>
                      <TableCell>
                        {stripeUrl ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={stripeUrl} target="_blank" rel="noopener noreferrer" title="Stripeダッシュボードで開く">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* モバイル */}
          <div className="md:hidden space-y-3">
            {payments.map((p) => {
              const s = STATUS_MAP[p.status] || { label: p.status, color: "bg-gray-100" };
              const stripeUrl = getStripeDashboardUrl(p);
              return (
                <div key={p.id} className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{p.user.name}</div>
                      <div className="text-xs text-gray-400">{p.user.email}</div>
                    </div>
                    <Badge className={`shrink-0 ${s.color}`}>{s.label}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge className={p.type === "refund" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}>
                      {TYPE_MAP[p.type] || p.type}
                    </Badge>
                    <div className={`text-lg font-bold ${p.type === "refund" ? "text-orange-600" : ""}`}>
                      {p.type === "refund" ? "-" : ""}¥{p.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(p.createdAt).toLocaleDateString("ja-JP")}</span>
                    {stripeUrl && (
                      <a href={stripeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        Stripe <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

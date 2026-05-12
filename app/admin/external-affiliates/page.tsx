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
import { Network, ExternalLink } from "lucide-react";

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  rentracks: { label: "レントラックス", color: "bg-purple-100 text-purple-700" },
  moshimo: { label: "もしも", color: "bg-pink-100 text-pink-700" },
  other: { label: "その他", color: "bg-gray-100 text-gray-700" },
};

const EVENT_LABELS: Record<string, string> = {
  registration: "新規登録",
  payment: "決済発生",
  subscription_renewal: "継続課金",
};

export default async function ExternalAffiliatesPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; period?: string }>;
}) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const { source: filterSource, period: filterPeriod } = await searchParams;

  const where: Record<string, unknown> = {};
  if (filterSource && filterSource !== "all") where.source = filterSource;
  if (filterPeriod === "month") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (filterPeriod === "last_month") {
    const start = new Date();
    start.setMonth(start.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setDate(1);
    end.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start, lt: end };
  }

  const logs = await prisma.externalAffiliateLog.findMany({
    where,
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  // ASP別件数
  const allLogs = await prisma.externalAffiliateLog.groupBy({
    by: ["source"],
    _count: true,
    _sum: { baseAmount: true },
  });
  const sourceCounts: Record<string, { count: number; amount: number }> = {};
  allLogs.forEach((g) => {
    sourceCounts[g.source] = { count: g._count, amount: g._sum.baseAmount || 0 };
  });
  const totalCount = allLogs.reduce((s, g) => s + g._count, 0);
  const totalAmount = allLogs.reduce((s, g) => s + (g._sum.baseAmount || 0), 0);

  const sourceTabs = [
    { key: "all", label: "全て", count: totalCount },
    { key: "rentracks", label: "レントラックス", count: sourceCounts.rentracks?.count || 0 },
    { key: "moshimo", label: "もしも", count: sourceCounts.moshimo?.count || 0 },
    { key: "other", label: "その他", count: sourceCounts.other?.count || 0 },
  ];
  const periodTabs = [
    { key: "all", label: "全期間" },
    { key: "month", label: "今月" },
    { key: "last_month", label: "先月" },
  ];

  const activeSource = filterSource || "all";
  const activePeriod = filterPeriod || "all";

  const buildLink = (s: string, p: string) => {
    const params = new URLSearchParams();
    if (s !== "all") params.set("source", s);
    if (p !== "all") params.set("period", p);
    const qs = params.toString();
    return `/admin/external-affiliates${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Network className="w-6 h-6" /> 外部アフィリエイト履歴
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          レントラックス・もしも経由の登録・決済を記録（ASP側ダッシュボードと併用）
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">総件数</div>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">レントラックス</div>
            <div className="text-xl font-bold text-purple-600">{sourceCounts.rentracks?.count || 0}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">もしも</div>
            <div className="text-xl font-bold text-pink-600">{sourceCounts.moshimo?.count || 0}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-xs text-gray-500">総決済額</div>
            <div className="text-xl font-bold">¥{totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* フィルター */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {sourceTabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeSource === tab.key ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={buildLink(tab.key, activePeriod)}>
                {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {periodTabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activePeriod === tab.key ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={buildLink(activeSource, tab.key)}>{tab.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      {/* 一覧 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">履歴一覧（{logs.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Network className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>該当する履歴はありません</p>
            </div>
          ) : (
            <>
              {/* デスクトップ: テーブル */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>発生日時</TableHead>
                      <TableHead>ユーザー</TableHead>
                      <TableHead>ASP</TableHead>
                      <TableHead>アフィリエイトID</TableHead>
                      <TableHead>イベント</TableHead>
                      <TableHead>決済額</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const s = SOURCE_LABELS[log.source] || { label: log.source, color: "bg-gray-100" };
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {new Date(log.createdAt).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" })}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{log.user.name}</div>
                            <div className="text-xs text-gray-400">{log.user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={s.color}>{s.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{log.affiliateId}</code>
                          </TableCell>
                          <TableCell className="text-sm">
                            {EVENT_LABELS[log.eventType] || log.eventType}
                          </TableCell>
                          <TableCell className="text-sm">¥{log.baseAmount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/users/${log.user.id}`}>
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
                {logs.map((log) => {
                  const s = SOURCE_LABELS[log.source] || { label: log.source, color: "bg-gray-100" };
                  return (
                    <Link key={log.id} href={`/admin/users/${log.user.id}`}>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-medium">{log.user.name}</div>
                            <div className="text-xs text-gray-400">{log.user.email}</div>
                          </div>
                          <Badge className={`shrink-0 ${s.color}`}>{s.label}</Badge>
                        </div>
                        <div className="text-xs text-gray-500">
                          {EVENT_LABELS[log.eventType]} ・ ¥{log.baseAmount.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-white px-2 py-0.5 rounded border">{log.affiliateId}</code>
                          <span className="text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleDateString("ja-JP")}
                          </span>
                        </div>
                      </div>
                    </Link>
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

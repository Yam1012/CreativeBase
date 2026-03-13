import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Globe } from "lucide-react";
import { LP_STATUS_MAP } from "@/lib/lp-status";

export default async function AdminLpDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;

  const where = filterStatus && filterStatus !== "all"
    ? { status: filterStatus }
    : {};

  const lpGenerations = await prisma.lpGeneration.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      template: { select: { name: true } },
      spotOrder: { select: { id: true, type: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // ステータス別カウント
  const allLps = await prisma.lpGeneration.groupBy({
    by: ["status"],
    _count: true,
  });
  const statusCounts: Record<string, number> = {};
  allLps.forEach((g) => {
    statusCounts[g.status] = g._count;
  });
  const totalCount = allLps.reduce((sum, g) => sum + g._count, 0);

  const tabs = [
    { key: "all", label: "全て", count: totalCount },
    { key: "pending", label: "受付中", count: statusCounts.pending || 0 },
    { key: "reviewing", label: "確認中", count: statusCounts.reviewing || 0 },
    { key: "generating", label: "生成中", count: statusCounts.generating || 0 },
    { key: "editing", label: "編集中", count: statusCounts.editing || 0 },
    { key: "preview_ready", label: "プレビュー待ち", count: statusCounts.preview_ready || 0 },
    { key: "revision", label: "修正依頼", count: statusCounts.revision || 0 },
    { key: "published", label: "公開中", count: statusCounts.published || 0 },
  ];

  const activeTab = filterStatus || "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">LP管理</h1>
        <p className="text-gray-500 text-sm mt-0.5">LP生成・編集・公開の管理</p>
      </div>

      {/* ステータスタブ */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/admin/lp${tab.key === "all" ? "" : `?status=${tab.key}`}`}>
              {tab.label} <span className="ml-1 opacity-70">({tab.count})</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* LP一覧テーブル */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            LP一覧（{lpGenerations.length}件）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lpGenerations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>該当するLPがありません</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー</TableHead>
                  <TableHead>タイトル / スラッグ</TableHead>
                  <TableHead>テンプレート</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>更新日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lpGenerations.map((lp) => {
                  const s = LP_STATUS_MAP[lp.status as keyof typeof LP_STATUS_MAP] || {
                    label: lp.status,
                    color: "bg-gray-100 text-gray-600",
                  };
                  return (
                    <TableRow key={lp.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{lp.user.name}</div>
                        <div className="text-xs text-gray-500">{lp.user.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{lp.metaTitle || "未設定"}</div>
                        <div className="text-xs text-gray-400">/{lp.slug}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {lp.template?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={s.color}>{s.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(lp.updatedAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {["editing", "revision", "preview_ready", "approved"].includes(lp.status) && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/lp/${lp.id}/edit`}>編集</Link>
                            </Button>
                          )}
                          {lp.status === "published" && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/lp/${lp.slug}`} target="_blank">表示</Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/admin/lp/${lp.id}/preview`}>プレビュー</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

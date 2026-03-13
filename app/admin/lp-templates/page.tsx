import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Layout, Edit } from "lucide-react";

export default async function AdminLpTemplatesPage() {
  const templates = await prisma.lpTemplate.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lpGenerations: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LPテンプレート管理</h1>
          <p className="text-gray-500 text-sm mt-0.5">LP生成用HTMLテンプレートの管理</p>
        </div>
        <Button asChild>
          <Link href="/admin/lp-templates/new">
            <Plus className="w-4 h-4 mr-1" /> 新規作成
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">テンプレート一覧（{templates.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Layout className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>テンプレートがありません</p>
              <p className="text-sm mt-1">「新規作成」からテンプレートを追加してください</p>
            </div>
          ) : (
            <>
              {/* デスクトップ: テーブル */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>テンプレート名</TableHead>
                      <TableHead>説明</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>使用数</TableHead>
                      <TableHead>作成日</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">
                          {t.description || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge className={t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                            {t.isActive ? "有効" : "無効"}
                          </Badge>
                        </TableCell>
                        <TableCell>{t._count.lpGenerations}件</TableCell>
                        <TableCell className="text-sm">
                          {new Date(t.createdAt).toLocaleDateString("ja-JP")}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/lp-templates/${t.id}`}>編集</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* モバイル: カードリスト */}
              <div className="md:hidden space-y-3">
                {templates.map((t) => (
                  <div key={t.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{t.name}</div>
                        {t.description && (
                          <div className="text-xs text-gray-500 mt-0.5 truncate">{t.description}</div>
                        )}
                      </div>
                      <Badge className={`shrink-0 ml-2 ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {t.isActive ? "有効" : "無効"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        使用: {t._count.lpGenerations}件 | {new Date(t.createdAt).toLocaleDateString("ja-JP")}
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <Link href={`/admin/lp-templates/${t.id}`}>
                          <Edit className="w-3 h-3 mr-1" /> 編集
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

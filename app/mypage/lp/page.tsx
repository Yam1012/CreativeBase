import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Eye, ExternalLink, Copy, ArrowLeft } from "lucide-react";
import { LP_STATUS_MAP, type LpStatus } from "@/lib/lp-status";

export default async function UserLpListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const lps = await prisma.lpGeneration.findMany({
    where: { userId },
    include: {
      spotOrder: { select: { id: true, type: true, createdAt: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { affiliateCode: true },
  });

  const publishedCount = lps.filter((lp) => lp.status === "published").length;
  const previewCount = lps.filter((lp) => lp.status === "preview_ready").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6" /> マイLP
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">LP制作の状況と公開ページ</p>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-gray-500">LP合計</div>
            <div className="text-2xl font-bold">{lps.length}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-gray-500">公開中</div>
            <div className="text-2xl font-bold text-green-600">{publishedCount}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-gray-500">確認待ち</div>
            <div className="text-2xl font-bold text-indigo-600">{previewCount}件</div>
          </CardContent>
        </Card>
      </div>

      {/* アフィリエイトコード */}
      {user?.affiliateCode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">アフィリエイトコード</div>
              <p className="text-xs text-blue-600 mt-0.5">
                公開LPのリンクに自動埋め込みされます
              </p>
            </div>
            <code className="bg-white px-3 py-1.5 rounded border border-blue-200 text-sm font-mono text-blue-800">
              {user.affiliateCode}
            </code>
          </CardContent>
        </Card>
      )}

      {/* LP一覧 */}
      {lps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>LPはまだありません</p>
            <p className="text-xs mt-1">LP制作のオーダー後にこちらに表示されます</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lps.map((lp) => {
            const statusInfo = LP_STATUS_MAP[lp.status as LpStatus] || {
              label: lp.status,
              color: "bg-gray-100 text-gray-600",
            };

            return (
              <Card key={lp.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {lp.metaTitle || `LP #${lp.id.slice(0, 8)}`}
                        </span>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>/{lp.slug}</span>
                        <span>更新: {new Date(lp.updatedAt).toLocaleDateString("ja-JP")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      {lp.status === "preview_ready" && (
                        <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-500">
                          <Link href={`/mypage/lp/${lp.id}/preview`}>
                            <Eye className="w-4 h-4 mr-1" /> 確認する
                          </Link>
                        </Button>
                      )}
                      {lp.status === "published" && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" /> 公開ページ
                          </a>
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/mypage/orders/${lp.spotOrder.id}`}>
                          詳細
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

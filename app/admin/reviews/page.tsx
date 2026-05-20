import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ExternalLink, Video, FileText } from "lucide-react";

export default async function AdminReviewsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "admin") {
    redirect("/login");
  }

  const reviews = await prisma.orderReview.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      spotOrder: { select: { id: true, type: true, purpose: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCount = reviews.length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(2)
    : "0.00";

  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    rating: n,
    count: reviews.filter((r) => r.rating === n).length,
    percent: totalCount > 0 ? (reviews.filter((r) => r.rating === n).length / totalCount) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Star className="w-6 h-6 text-amber-500 fill-amber-400" /> 顧客レビュー
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          完了オーダーに対するユーザー評価とコメント
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">平均評価</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-amber-600">{avgRating}</span>
              <span className="text-sm text-gray-500">/ 5</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-4 h-4 ${n <= Math.round(Number(avgRating)) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-2">{totalCount}件のレビュー</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">評価分布</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {ratingDist.map((r) => (
              <div key={r.rating} className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-0.5 w-10">
                  <span>{r.rating}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 bg-gray-100 rounded h-3 overflow-hidden">
                  <div className="h-full bg-amber-400 transition-all" style={{ width: `${r.percent}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{r.count}件</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* レビュー一覧 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">レビュー一覧（{totalCount}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>レビューはまだありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`w-4 h-4 ${n <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {r.spotOrder.type === "video" ? (
                          <><Video className="w-3 h-3 mr-1 text-blue-500" />動画</>
                        ) : (
                          <><FileText className="w-3 h-3 mr-1 text-purple-500" />LP</>
                        )}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("ja-JP")}
                    </div>
                  </div>

                  {r.comment && (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-3 whitespace-pre-wrap">
                      {r.comment}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <Link href={`/admin/users/${r.user.id}`} className="text-blue-600 hover:underline">
                        {r.user.name}
                      </Link>
                      <span className="text-gray-400 ml-1">({r.user.email})</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/orders/${r.spotOrder.id}`}>
                        <ExternalLink className="w-3 h-3 mr-1" /> オーダー
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, FileText, Video, ExternalLink, Eye, Clock, CheckCircle2, Circle,
} from "lucide-react";
import { toast } from "sonner";
import { LP_STATUS_MAP, LP_TIMELINE_STATUSES, type LpStatus } from "@/lib/lp-status";

interface OrderData {
  id: string;
  type: string;
  status: string;
  notes: string | null;
  totalPrice: number;
  rushDelivery: boolean;
  createdAt: string;
  files: { id: string; filename: string; createdAt: string }[];
  lpGeneration: {
    id: string;
    status: string;
    slug: string;
    metaTitle: string | null;
    affiliateCode: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    revisionNotes: string | null;
  } | null;
}

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
  in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
  completed: { label: "完了", color: "bg-green-100 text-green-700" },
};

export default function UserOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/mypage/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setOrder)
      .catch(() => {
        toast.error("オーダーが見つかりません");
        router.push("/mypage/orders");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !order) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>;
  }

  const lp = order.lpGeneration;
  const orderStatus = ORDER_STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage/orders"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            {order.type === "video" ? <Video className="w-5 h-5 text-blue-500" /> : <FileText className="w-5 h-5 text-purple-500" />}
            {order.type === "video" ? "動画制作" : "LP制作"} オーダー
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">
            注文日: {new Date(order.createdAt).toLocaleDateString("ja-JP")}
          </p>
        </div>
        <Badge className={orderStatus.color}>{orderStatus.label}</Badge>
      </div>

      {/* オーダー情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">オーダー情報</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500 text-xs">種類</div>
            <div className="font-medium">{order.type === "video" ? "動画制作" : "LP制作"}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">金額（税別）</div>
            <div className="font-medium">
              {order.totalPrice > 0 ? `¥${order.totalPrice.toLocaleString()}` : "未確定"}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">最速納品</div>
            <div className="font-medium">{order.rushDelivery ? "あり" : "なし"}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs">添付ファイル</div>
            <div className="font-medium">{order.files.length}件</div>
          </div>
          {order.notes && (
            <div className="col-span-full">
              <div className="text-gray-500 text-xs">備考</div>
              <div className="text-gray-700 bg-gray-50 rounded p-2 mt-1">{order.notes}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LP生成セクション */}
      {order.type === "lp" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" /> LP制作の進捗
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!lp ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">LP制作の準備中です</p>
                <p className="text-xs mt-1">制作が開始されるまでお待ちください</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* タイムライン */}
                <div className="flex items-center gap-0 overflow-x-auto pb-2">
                  {LP_TIMELINE_STATUSES.map((s, i) => {
                    const info = LP_STATUS_MAP[s];
                    const currentOrder = LP_STATUS_MAP[lp.status as LpStatus]?.order || 0;
                    const stepOrder = info.order;
                    const isActive = lp.status === s;
                    const isDone = stepOrder < currentOrder;
                    // revision は editing の前に戻った状態
                    const isRevision = lp.status === "revision" && s === "editing";

                    return (
                      <div key={s} className="flex items-center">
                        <div className="flex flex-col items-center min-w-[70px]">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isActive || isRevision
                              ? "bg-blue-600 text-white"
                              : isDone
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}>
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                          </div>
                          <span className={`text-[10px] mt-1 text-center leading-tight ${
                            isActive || isRevision ? "text-blue-600 font-semibold" : isDone ? "text-green-600" : "text-gray-400"
                          }`}>
                            {isRevision ? "修正中" : info.label}
                          </span>
                        </div>
                        {i < LP_TIMELINE_STATUSES.length - 1 && (
                          <div className={`h-0.5 w-6 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 現在のステータスと情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">
                      現在のステータス:
                      <Badge className={`ml-2 ${LP_STATUS_MAP[lp.status as LpStatus]?.color || "bg-gray-100 text-gray-600"}`}>
                        {LP_STATUS_MAP[lp.status as LpStatus]?.label || lp.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">
                      更新: {new Date(lp.updatedAt).toLocaleDateString("ja-JP")}
                    </span>
                  </div>

                  {/* 修正依頼ノート */}
                  {lp.status === "revision" && lp.revisionNotes && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-3 text-sm">
                      <div className="font-medium text-red-700 text-xs mb-1">修正依頼内容:</div>
                      <div className="text-red-800">{lp.revisionNotes}</div>
                    </div>
                  )}

                  {/* プレビュー待ち → 承認 or 修正依頼 */}
                  {lp.status === "preview_ready" && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-500">
                        <Link href={`/mypage/lp/${lp.id}/preview`}>
                          <Eye className="w-4 h-4 mr-1" /> プレビューを確認する
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* 公開中 → リンク表示 */}
                  {lp.status === "published" && lp.slug && (
                    <div className="mt-3 space-y-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" /> 公開ページを見る
                        </a>
                      </Button>
                      {lp.affiliateCode && (
                        <div className="text-xs text-gray-500">
                          アフィリエイトコード: <code className="bg-gray-200 px-1.5 py-0.5 rounded">{lp.affiliateCode}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ファイル一覧 */}
      {order.files.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">添付ファイル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span>{file.filename}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(file.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

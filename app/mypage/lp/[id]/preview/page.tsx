"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, CheckCircle, MessageSquareWarning, Loader2, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { LP_STATUS_MAP, type LpStatus } from "@/lib/lp-status";
import { renderLpHtml, parseContentData } from "@/lib/lp-render";

interface LpPreviewData {
  id: string;
  status: string;
  slug: string;
  metaTitle: string | null;
  metaDescription: string | null;
  generatedHtml: string | null;
  editedHtml: string | null;
  contentData: string | null;
  affiliateCode: string | null;
  revisionNotes: string | null;
  template: {
    htmlBody: string;
    cssBody: string | null;
  } | null;
}

export default function UserLpPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lp, setLp] = useState<LpPreviewData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  useEffect(() => {
    // ユーザー向けAPI（admin APIと同じ構造のデータが必要）
    // orders API 経由でLPデータ取得 → 足りないのでadmin APIのGETを流用
    // ただしユーザー向けに専用エンドポイント追加が安全
    fetch(`/api/mypage/lp/${id}/preview`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setLp)
      .catch(() => {
        toast.error("プレビューを取得できません");
        router.push("/mypage/lp");
      });
  }, [id, router]);

  const getPreviewHtml = (): string => {
    if (!lp) return "";
    if (lp.editedHtml) return lp.editedHtml;
    if (lp.template && lp.contentData) {
      const content = parseContentData(lp.contentData);
      return renderLpHtml(
        lp.template.htmlBody,
        lp.template.cssBody,
        content,
        {
          affiliateCode: lp.affiliateCode || undefined,
          metaTitle: lp.metaTitle || undefined,
          metaDescription: lp.metaDescription || undefined,
        }
      );
    }
    return lp.generatedHtml || "<p>プレビューデータがありません</p>";
  };

  const handleApprove = async () => {
    if (!confirm("このLPを承認しますか？承認後、管理者が公開手続きを行います。")) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/mypage/lp/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "承認に失敗しました");
        return;
      }
      toast.success("LPを承認しました！公開までしばらくお待ちください。");
      router.push("/mypage/lp");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setProcessing(false);
    }
  };

  const handleRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("修正内容を入力してください");
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch(`/api/mypage/lp/${id}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: revisionNotes }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "修正依頼に失敗しました");
        return;
      }
      toast.success("修正依頼を送信しました");
      router.push("/mypage/lp");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setProcessing(false);
    }
  };

  if (!lp) {
    return <div className="text-center py-12 text-gray-400">読み込み中...</div>;
  }

  const statusInfo = LP_STATUS_MAP[lp.status as LpStatus] || { label: lp.status, color: "bg-gray-100 text-gray-600" };
  const canAct = lp.status === "preview_ready";

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* ツールバー */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mypage/lp"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              {lp.metaTitle || "LPプレビュー"}
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </h1>
            <p className="text-xs text-gray-400">内容をご確認ください</p>
          </div>
        </div>

        {canAct && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevisionForm(!showRevisionForm)}
              disabled={processing}
            >
              <MessageSquareWarning className="w-4 h-4 mr-1" /> 修正依頼
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1" />}
              承認する
            </Button>
          </div>
        )}

        {lp.status === "published" && (
          <Button size="sm" variant="outline" asChild>
            <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer">
              <Globe className="w-4 h-4 mr-1" /> 公開ページを見る
            </a>
          </Button>
        )}

        {lp.status === "approved" && (
          <Badge className="bg-emerald-100 text-emerald-700">承認済み — 公開準備中</Badge>
        )}
      </div>

      {/* 修正依頼フォーム（トグル） */}
      {showRevisionForm && canAct && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 shrink-0">
          <Card className="border-yellow-300">
            <CardContent className="py-3 space-y-3">
              <div className="text-sm font-medium text-yellow-800">修正内容をお知らせください</div>
              <Textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="例: ヘッダーの文言を「○○○」に変更してください..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowRevisionForm(false); setRevisionNotes(""); }}
                >
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                  onClick={handleRevision}
                  disabled={processing || !revisionNotes.trim()}
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareWarning className="w-4 h-4 mr-1" />}
                  修正依頼を送信
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LP プレビュー */}
      <div className="flex-1 bg-gray-100">
        <iframe
          srcDoc={getPreviewHtml()}
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
          title="LP Preview"
        />
      </div>
    </div>
  );
}

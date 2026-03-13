"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Edit, Send, Globe, Archive, EyeOff, Loader2, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { LP_STATUS_MAP } from "@/lib/lp-status";
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
  publishedAt: string | null;
  template: {
    id: string;
    name: string;
    htmlBody: string;
    cssBody: string | null;
  } | null;
  user: { name: string; email: string };
  spotOrder: { id: string };
}

export default function LpPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lp, setLp] = useState<LpPreviewData | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/lp/${id}/update`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          router.push("/admin/lp");
          return;
        }
        setLp(data);
      });
  }, [id, router]);

  const getPreviewHtml = (): string => {
    if (!lp) return "";
    // editedHtml があればそれを優先
    if (lp.editedHtml) return lp.editedHtml;
    // テンプレート + contentData からレンダリング
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

  const handleAction = async (
    endpoint: string,
    method: string,
    successMessage: string,
    redirectTo?: string
  ) => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/lp/${id}/${endpoint}`, { method });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "操作に失敗しました");
        return;
      }
      toast.success(successMessage);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        // リロード
        const r = await fetch(`/api/admin/lp/${id}/update`);
        const data = await r.json();
        setLp(data);
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setProcessing(false);
    }
  };

  if (!lp) {
    return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  }

  const statusInfo = LP_STATUS_MAP[lp.status as keyof typeof LP_STATUS_MAP] || {
    label: lp.status,
    color: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="h-screen flex flex-col">
      {/* ツールバー */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/lp"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">LPプレビュー</h1>
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
            </div>
            <p className="text-xs text-gray-400">
              /{lp.slug} | {lp.user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* エディタへ */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/lp/${id}/edit`}>
              <Edit className="w-4 h-4 mr-1" /> エディタ
            </Link>
          </Button>

          {/* ステータスに応じたアクション */}
          {(lp.status === "editing" || lp.status === "revision") && (
            <Button
              size="sm"
              onClick={() => handleAction("submit-preview", "POST", "プレビューを提出しました")}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              プレビュー提出
            </Button>
          )}

          {lp.status === "approved" && (
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleAction("publish", "POST", "公開しました")}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 mr-1" />}
              公開する
            </Button>
          )}

          {lp.status === "published" && (
            <>
              <Button variant="outline" size="sm" asChild>
                <a href={`/lp/${lp.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" /> 公開ページ
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction("unpublish", "POST", "非公開にしました")}
                disabled={processing}
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4 mr-1" />}
                非公開
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("アーカイブしますか？公開URLにアクセスできなくなります。")) {
                    handleAction("archive", "POST", "アーカイブしました", "/admin/lp");
                  }
                }}
                disabled={processing}
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4 mr-1" />}
                アーカイブ
              </Button>
            </>
          )}
        </div>
      </div>

      {/* LP プレビュー (全画面) */}
      <div className="flex-1 bg-gray-100">
        <iframe
          srcDoc={getPreviewHtml()}
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
          title="LP Full Preview"
        />
      </div>
    </div>
  );
}

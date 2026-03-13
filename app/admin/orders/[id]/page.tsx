"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Download, Wand2, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface OrderDetail {
  id: string;
  type: string;
  status: string;
  orderCategory: string;
  notes: string | null;
  rushDelivery: boolean;
  createdAt: string;
  user: { name: string; email: string };
  files: { id: string; filename: string; path: string }[];
  lpGeneration: {
    id: string;
    status: string;
    slug: string;
    metaTitle: string | null;
    templateId: string | null;
  } | null;
}

interface Template {
  id: string;
  name: string;
  isActive: boolean;
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // オーダー詳細取得
    fetch(`/api/admin/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          router.push("/admin/orders");
          return;
        }
        setOrder(data);
        if (data.lpGeneration?.templateId) {
          setSelectedTemplate(data.lpGeneration.templateId);
        }
      });

    // テンプレート一覧取得
    fetch("/api/admin/lp-templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTemplates(data.filter((t: Template) => t.isActive));
        }
      });
  }, [id, router]);

  const handleGenerate = async () => {
    if (!selectedTemplate) {
      toast.error("テンプレートを選択してください");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`/api/admin/lp/${order?.lpGeneration?.id || id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          templateId: selectedTemplate,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "生成に失敗しました");
        return;
      }
      toast.success("LP生成が完了しました");
      router.push(`/admin/lp/${data.lpGenerationId}/edit`);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  if (!order) {
    return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  }

  const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: "受付中", color: "bg-yellow-100 text-yellow-700" },
    in_progress: { label: "制作中", color: "bg-blue-100 text-blue-700" },
    completed: { label: "完了", color: "bg-green-100 text-green-700" },
  };
  const s = STATUS_MAP[order.status] || { label: order.status, color: "bg-gray-100 text-gray-600" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">オーダー詳細</h1>
          <p className="text-gray-500 text-sm mt-0.5">ID: {order.id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* オーダー情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">オーダー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-500 text-xs">ユーザー</Label>
              <div className="font-medium">{order.user.name}</div>
              <div className="text-xs text-gray-500">{order.user.email}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">種別</Label>
              <div className="font-medium">{order.type === "video" ? "動画制作" : "LP制作"}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">ステータス</Label>
              <div><Badge className={s.color}>{s.label}</Badge></div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">注文日</Label>
              <div className="text-sm">{new Date(order.createdAt).toLocaleDateString("ja-JP")}</div>
            </div>
          </div>
          {order.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <Label className="text-gray-500 text-xs">備考</Label>
              <p className="text-sm mt-1 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* アップロードファイル */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">アップロードファイル（{order.files.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {order.files.length === 0 ? (
            <p className="text-sm text-gray-500">ファイルなし</p>
          ) : (
            <div className="space-y-2">
              {order.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{file.filename}</span>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={file.path} download><Download className="w-4 h-4" /></a>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LP生成セクション（LP制作オーダーのみ） */}
      {order.type === "lp" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">LP生成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.lpGeneration ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500 text-xs">LP ステータス</Label>
                    <div className="text-sm font-medium mt-1">{order.lpGeneration.status}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/lp/${order.lpGeneration.id}/edit`}>
                        <ExternalLink className="w-4 h-4 mr-1" /> エディタを開く
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium">LP生成を開始</p>
                  <p className="text-xs text-blue-600 mt-1">テンプレートを選択してAI生成を実行します</p>
                </div>
                <div className="space-y-2">
                  <Label>テンプレート選択</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="テンプレートを選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerate} disabled={generating || !selectedTemplate} className="w-full">
                  {generating ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 生成中...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" /> LP生成を開始</>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

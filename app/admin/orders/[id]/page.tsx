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
import { ArrowLeft, FileText, Download, Wand2, Loader2, ExternalLink, Play, Save, Edit2, Trash2, Package2, Upload } from "lucide-react";
import { CommentThread } from "@/components/comment-thread";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadField } from "@/components/file-upload-field";
import { toast } from "sonner";

interface OrderDetail {
  id: string;
  type: string;
  status: string;
  orderCategory: string;
  notes: string | null;
  rushDelivery: boolean;
  basePrice: number;
  extraMinutes: number;
  totalPrice: number;
  purpose: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    nameKana: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    companyName: string | null;
    chatworkId: string | null;
    role: string;
    referralCode: string | null;
    createdAt: string;
  };
  files: { id: string; filename: string; path: string; category: string; uploadedBy: string; createdAt: string }[];
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
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    basePrice: 0,
    extraMinutes: 0,
    totalPrice: 0,
    rushDelivery: false,
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
        setEditForm({
          basePrice: data.basePrice || 0,
          extraMinutes: data.extraMinutes || 0,
          totalPrice: data.totalPrice || 0,
          rushDelivery: data.rushDelivery || false,
          notes: data.notes || "",
        });
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

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        toast.error("保存に失敗しました");
        return;
      }
      toast.success("オーダー内容を更新しました");
      setEditMode(false);
      if (order) {
        setOrder({ ...order, ...editForm });
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSavingEdit(false);
    }
  };

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

      {/* ユーザー登録情報 */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">ユーザー登録情報</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${order.user.id}`}>
              <ExternalLink className="w-4 h-4 mr-1" /> ユーザー詳細
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-gray-500 text-xs">氏名</Label>
              <div className="font-medium">{order.user.name}</div>
              {order.user.nameKana && <div className="text-xs text-gray-500">{order.user.nameKana}</div>}
            </div>
            <div>
              <Label className="text-gray-500 text-xs">メール</Label>
              <div className="font-medium break-all">{order.user.email}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">電話番号</Label>
              <div className="font-medium">{order.user.phone || "—"}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">法人名</Label>
              <div className="font-medium">{order.user.companyName || "—"}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">Chatwork ID</Label>
              <div className="font-medium">{order.user.chatworkId || "—"}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">紹介コード</Label>
              <div className="font-medium font-mono text-xs">{order.user.referralCode || "—"}</div>
            </div>
            <div className="md:col-span-3">
              <Label className="text-gray-500 text-xs">住所</Label>
              <div className="font-medium">{order.user.address || "—"}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">登録日</Label>
              <div className="font-medium text-xs">{new Date(order.user.createdAt).toLocaleDateString("ja-JP")}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">ロール</Label>
              <div>
                <Badge className={
                  order.user.role === "admin" ? "bg-purple-100 text-purple-700" :
                  order.user.role === "cancelled" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
                }>
                  {order.user.role === "admin" ? "管理者" : order.user.role === "cancelled" ? "解約済" : "ユーザー"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* オーダー情報 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">オーダー情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-500 text-xs">種別</Label>
              <div className="font-medium">{order.type === "video" ? "動画制作" : "LP制作"}</div>
            </div>
            <div>
              <Label className="text-gray-500 text-xs">目的</Label>
              <div className="font-medium">
                {order.purpose === "presentation" ? "プレゼン用" : order.purpose === "promotion" ? "プロモーション用" : <span className="text-gray-400">未設定</span>}
              </div>
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

      {/* オーダー編集（金額・内容） */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">オーダー編集</CardTitle>
          {!editMode ? (
            <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
              <Edit2 className="w-4 h-4 mr-1" /> 編集
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                キャンセル
              </Button>
              <Button size="sm" onClick={handleSaveEdit} disabled={savingEdit}>
                {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> 保存</>}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">基本料金（円）</Label>
              <Input
                type="number"
                disabled={!editMode}
                value={editForm.basePrice}
                onChange={(e) => setEditForm({ ...editForm, basePrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">追加分（分）</Label>
              <Input
                type="number"
                disabled={!editMode}
                value={editForm.extraMinutes}
                onChange={(e) => setEditForm({ ...editForm, extraMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">合計請求額（円）</Label>
              <Input
                type="number"
                disabled={!editMode}
                value={editForm.totalPrice}
                onChange={(e) => setEditForm({ ...editForm, totalPrice: Number(e.target.value) })}
                className="font-bold"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rushDelivery"
              disabled={!editMode}
              checked={editForm.rushDelivery}
              onChange={(e) => setEditForm({ ...editForm, rushDelivery: e.target.checked })}
              className="w-4 h-4"
            />
            <Label htmlFor="rushDelivery" className="text-sm">最速納品</Label>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">備考・作業メモ</Label>
            <Textarea
              disabled={!editMode}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ユーザーからの参考素材 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            ユーザーからの参考素材（{order.files.filter(f => f.category === "material").length}件）
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.files.filter(f => f.category === "material").length === 0 ? (
            <p className="text-sm text-gray-500">参考素材なし</p>
          ) : (
            <div className="space-y-2">
              {order.files.filter(f => f.category === "material").map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm truncate">{file.filename}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8" asChild>
                      <a href={file.path} download={file.filename} target="_blank" rel="noopener noreferrer" title="ダウンロード">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-600 hover:bg-red-50"
                      title="削除"
                      onClick={async () => {
                        if (!confirm(`「${file.filename}」を削除しますか？`)) return;
                        const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
                        if (!res.ok) {
                          const d = await res.json();
                          toast.error(d.error || "削除に失敗しました");
                          return;
                        }
                        toast.success("ファイルを削除しました");
                        if (order) {
                          setOrder({ ...order, files: order.files.filter((f) => f.id !== file.id) });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 完成品アップロード（管理者用） */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package2 className="w-4 h-4 text-green-600" />
            完成品データ（{order.files.filter(f => f.category === "deliverable").length}件）
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            ここにアップロードしたファイルはユーザーがマイページからダウンロードできます
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 完成品ファイル一覧 */}
          {order.files.filter(f => f.category === "deliverable").length > 0 && (
            <div className="space-y-2">
              {order.files.filter(f => f.category === "deliverable").map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package2 className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate font-medium">{file.filename}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(file.createdAt).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8" asChild>
                      <a href={file.path} download={file.filename} target="_blank" rel="noopener noreferrer" title="ダウンロード">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-600 hover:bg-red-50"
                      title="削除"
                      onClick={async () => {
                        if (!confirm(`完成品「${file.filename}」を削除しますか？`)) return;
                        const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
                        if (!res.ok) {
                          toast.error("削除に失敗しました");
                          return;
                        }
                        toast.success("削除しました");
                        if (order) {
                          setOrder({ ...order, files: order.files.filter((f) => f.id !== file.id) });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 完成品アップロードフォーム */}
          <div className="border-t border-green-200 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">完成品をアップロード</span>
            </div>
            <FileUploadField
              uploadedFiles={[]}
              category="deliverable"
              spotOrderId={id}
              onFilesChange={async (files) => {
                if (files.length === 0) return;
                // 即時 spotOrderId 紐付け済み → リロード
                toast.success("完成品をアップロードしました");
                window.location.reload();
              }}
              maxFiles={20}
            />
          </div>
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

      {/* 制作管理（動画＆LPオーダー共通） */}
      {order.type === "video" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">制作ステータス管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <Label className="text-gray-500 text-xs">現在のステータス</Label>
                <div className="mt-1"><Badge className={s.color}>{s.label}</Badge></div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 text-xs">ステータス変更（双方向可・誤操作時は巻き戻し可能）</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={order.status === "pending" ? "default" : "outline"}
                  className={order.status === "pending" ? "bg-yellow-500 hover:bg-yellow-400" : ""}
                  disabled={order.status === "pending"}
                  onClick={async () => {
                    if (!confirm("ステータスを「受付中」に戻しますか？")) return;
                    const res = await fetch(`/api/admin/orders/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "pending" }),
                    });
                    if (res.ok) {
                      setOrder({ ...order, status: "pending" });
                      toast.success("「受付中」に変更しました");
                    } else {
                      toast.error("変更に失敗しました");
                    }
                  }}
                >
                  受付中
                </Button>

                <Button
                  size="sm"
                  variant={order.status === "in_progress" ? "default" : "outline"}
                  className={order.status === "in_progress" ? "bg-blue-600 hover:bg-blue-500" : ""}
                  disabled={order.status === "in_progress"}
                  onClick={async () => {
                    const fromCompleted = order.status === "completed";
                    if (fromCompleted && !confirm("完了状態を解除して「制作中」に戻しますか？")) return;
                    const res = await fetch(`/api/admin/orders/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "in_progress" }),
                    });
                    if (res.ok) {
                      setOrder({ ...order, status: "in_progress" });
                      toast.success("「制作中」に変更しました");
                    } else {
                      toast.error("変更に失敗しました");
                    }
                  }}
                >
                  <Play className="w-4 h-4 mr-1" /> 制作中
                </Button>

                <Button
                  size="sm"
                  variant={order.status === "completed" ? "default" : "outline"}
                  className={order.status === "completed" ? "bg-green-600 hover:bg-green-500" : ""}
                  disabled={order.status === "completed"}
                  onClick={async () => {
                    const res = await fetch(`/api/admin/orders/${id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "completed" }),
                    });
                    if (res.ok) {
                      setOrder({ ...order, status: "completed" });
                      toast.success("「完了」に変更しました");
                    } else {
                      toast.error("変更に失敗しました");
                    }
                  }}
                >
                  完了
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                ※ 完了 → 制作中、制作中 → 受付中など、いつでも戻せます
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* コメント */}
      <CommentThread orderId={id} currentUserRole="admin" />
    </div>
  );
}

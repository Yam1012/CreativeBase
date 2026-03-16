"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Eye, EyeOff, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";
import { renderLpHtml, generateMockContentData } from "@/lib/lp-render";

interface LpTemplate {
  id: string;
  name: string;
  description: string | null;
  htmlBody: string;
  cssBody: string | null;
  sections: string;
  isActive: boolean;
  _count: { lpGenerations: number };
}

export default function EditLpTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [template, setTemplate] = useState<LpTemplate | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [cssBody, setCssBody] = useState("");
  const [sections, setSections] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    fetch(`/api/admin/lp-templates/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
          router.push("/admin/lp-templates");
          return;
        }
        setTemplate(data);
        setName(data.name);
        setDescription(data.description || "");
        setHtmlBody(data.htmlBody);
        setCssBody(data.cssBody || "");
        setSections(data.sections);
        setIsActive(data.isActive);
      });
  }, [id, router]);

  const handleSave = async () => {
    if (!name.trim() || !htmlBody.trim()) {
      toast.error("テンプレート名とHTML本文は必須です");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/lp-templates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, htmlBody, cssBody, sections, isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "保存に失敗しました");
        return;
      }
      toast.success("テンプレートを更新しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("このテンプレートを削除しますか？")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/lp-templates/${id}`, { method: "DELETE" });
      const data = await res.json();
      toast.success(data.message);
      router.push("/admin/lp-templates");
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  };

  const previewHtml = useMemo(() => {
    if (!showPreview || !htmlBody) return "";
    const mockData = generateMockContentData(sections);
    return renderLpHtml(htmlBody, cssBody || null, mockData, {
      metaTitle: name || "プレビュー",
    });
  }, [showPreview, htmlBody, cssBody, sections, name]);

  if (!template) {
    return <div className="text-center py-12 text-gray-500">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/lp-templates"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">テンプレート編集</h1>
            <p className="text-gray-500 text-sm mt-0.5">{template.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showPreview ? "プレビューを閉じる" : "プレビュー"}
          </Button>
          <Badge className={isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
            {isActive ? "有効" : "無効"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => setIsActive(!isActive)}>
            {isActive ? "無効にする" : "有効にする"}
          </Button>
        </div>
      </div>

      <div className={showPreview ? "grid grid-cols-1 xl:grid-cols-2 gap-6" : ""}>
        {/* Editor Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>テンプレート名 <span className="text-red-500">*</span></Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>説明</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                使用中のLP: {template._count.lpGenerations}件
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">HTML テンプレート <span className="text-red-500">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">カスタムCSS（任意）</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={cssBody}
                onChange={(e) => setCssBody(e.target.value)}
                className="font-mono text-sm min-h-[120px]"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">セクション定義（JSON）</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sections}
                onChange={(e) => setSections(e.target.value)}
                className="font-mono text-sm min-h-[200px]"
              />
              <p className="text-xs text-gray-500 mt-2">
                各セクションの key はHTMLの {"{{key}}"} に対応します。
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              <Trash2 className="w-4 h-4 mr-1" /> {deleting ? "削除中..." : "削除"}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin/lp-templates">キャンセル</Link>
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "保存中..." : "変更を保存"}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="space-y-3">
            <Card className="sticky top-4">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">ライブプレビュー</CardTitle>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-md p-0.5">
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "ghost"}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  セクション定義に基づくモックデータで表示しています
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className={`border rounded-lg overflow-hidden bg-white mx-auto transition-all ${
                    previewDevice === "mobile" ? "max-w-[375px]" : "w-full"
                  }`}
                >
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0"
                      style={{ height: "600px" }}
                      title="テンプレートプレビュー"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[400px] text-gray-400 text-sm">
                      HTMLテンプレートを入力するとプレビューが表示されます
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

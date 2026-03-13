"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Send, Eye, Loader2, Code, FormInput } from "lucide-react";
import { toast } from "sonner";
import { LP_STATUS_MAP } from "@/lib/lp-status";
import { renderLpHtml, parseTemplateSections, parseContentData, type TemplateSection } from "@/lib/lp-render";

interface LpData {
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
    id: string;
    name: string;
    htmlBody: string;
    cssBody: string | null;
    sections: string;
  } | null;
  user: { name: string; email: string };
  spotOrder: { id: string; notes: string | null };
}

export default function LpEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lp, setLp] = useState<LpData | null>(null);
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [contentData, setContentData] = useState<Record<string, string>>({});
  const [editedHtml, setEditedHtml] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [mode, setMode] = useState<"structured" | "code">("structured");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        setMetaTitle(data.metaTitle || "");
        setMetaDescription(data.metaDescription || "");
        setEditedHtml(data.editedHtml || data.generatedHtml || "");
        if (data.template) setSections(parseTemplateSections(data.template.sections));
        setContentData(parseContentData(data.contentData));
      });
  }, [id, router]);

  const previewHtml = useCallback(() => {
    if (mode === "code") return editedHtml;
    if (!lp?.template) return editedHtml;
    return renderLpHtml(lp.template.htmlBody, lp.template.cssBody, contentData, {
      affiliateCode: lp.affiliateCode || undefined,
      metaTitle,
      metaDescription,
    });
  }, [mode, editedHtml, lp, contentData, metaTitle, metaDescription]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const html = mode === "structured" ? previewHtml() : editedHtml;
      const res = await fetch(`/api/admin/lp/${id}/update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editedHtml: html, contentData: JSON.stringify(contentData), metaTitle, metaDescription }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "保存に失敗しました"); return; }
      toast.success("保存しました");
    } catch { toast.error("エラーが発生しました"); }
    finally { setSaving(false); }
  };

  const handleSubmitPreview = async () => {
    if (!confirm("ユーザーにプレビュー確認を送信しますか？")) return;
    setSubmitting(true);
    try {
      await handleSave();
      const res = await fetch(`/api/admin/lp/${id}/submit-preview`, { method: "POST" });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "提出に失敗しました"); return; }
      toast.success("プレビューを提出しました");
      router.push("/admin/lp");
    } catch { toast.error("エラーが発生しました"); }
    finally { setSubmitting(false); }
  };

  const updateContent = (key: string, value: string) => {
    setContentData((prev) => ({ ...prev, [key]: value }));
  };

  if (!lp) return <div className="text-center py-12 text-gray-500">読み込み中...</div>;

  const statusInfo = LP_STATUS_MAP[lp.status as keyof typeof LP_STATUS_MAP] || { label: lp.status, color: "bg-gray-100 text-gray-600" };
  const canEdit = ["editing", "revision"].includes(lp.status);

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/lp"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">LPエディタ</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              <span className="text-xs text-gray-400 truncate max-w-[140px] sm:max-w-none">/{lp.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-10 sm:pl-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/lp/${id}/preview`} target="_blank">
              <Eye className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">プレビュー</span>
            </Link>
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">保存</span></>}
              </Button>
              <Button size="sm" onClick={handleSubmitPreview} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 sm:mr-1" /><span className="hidden sm:inline">プレビュー提出</span></>}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 修正依頼メモ */}
      {lp.status === "revision" && lp.revisionNotes && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <p className="text-sm font-medium text-red-800">修正依頼コメント</p>
          <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap">{lp.revisionNotes}</p>
        </div>
      )}

      {/* モード切替 */}
      <div className="flex gap-1 border-b">
        <button onClick={() => setMode("structured")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm border-b-2 transition-colors ${mode === "structured" ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <FormInput className="w-4 h-4" /> 構造化
        </button>
        <button onClick={() => { if (mode === "structured") setEditedHtml(previewHtml()); setMode("code"); }}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm border-b-2 transition-colors ${mode === "code" ? "border-blue-600 text-blue-600 font-medium" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <Code className="w-4 h-4" /> コード
        </button>
      </div>

      {/* メタ情報 */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">メタ情報</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">メタタイトル</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} disabled={!canEdit} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">メタディスクリプション</Label>
              <Input value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} disabled={!canEdit} className="h-8 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* エディタ + プレビュー */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-3">
          {mode === "structured" ? (
            sections.map((section) => (
              <Card key={section.key}>
                <CardContent className="pt-4 pb-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      {section.label}
                      {section.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {section.hint && <p className="text-xs text-gray-400">{section.hint}</p>}
                    {section.type === "textarea" || section.type === "html" ? (
                      <Textarea value={contentData[section.key] || ""} onChange={(e) => updateContent(section.key, e.target.value)} disabled={!canEdit} className="text-sm min-h-[80px]" />
                    ) : (
                      <Input value={contentData[section.key] || ""} onChange={(e) => updateContent(section.key, e.target.value)} disabled={!canEdit} className="text-sm h-8" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-4">
                <Textarea value={editedHtml} onChange={(e) => setEditedHtml(e.target.value)} disabled={!canEdit} className="font-mono text-xs min-h-[350px] lg:min-h-[500px]" />
              </CardContent>
            </Card>
          )}
        </div>

        {/* プレビュー */}
        <div className="lg:col-span-2">
          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">プレビュー</CardTitle></CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-white h-[300px] lg:h-[500px]">
                <iframe srcDoc={previewHtml()} className="w-full h-full" sandbox="allow-same-origin" title="LP Preview" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

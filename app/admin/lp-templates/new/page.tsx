"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function NewLpTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [htmlBody, setHtmlBody] = useState(DEFAULT_HTML);
  const [cssBody, setCssBody] = useState("");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !htmlBody.trim()) {
      toast.error("テンプレート名とHTML本文は必須です");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/lp-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, htmlBody, cssBody, sections }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "作成に失敗しました");
        return;
      }

      toast.success("テンプレートを作成しました");
      router.push("/admin/lp-templates");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/lp-templates"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">テンプレート新規作成</h1>
          <p className="text-gray-500 text-sm mt-0.5">LP生成用HTMLテンプレートを作成</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>テンプレート名 <span className="text-red-500">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: Standard LP" />
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="テンプレートの用途や特徴" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">HTML テンプレート <span className="text-red-500">*</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
              placeholder="<!DOCTYPE html>..."
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
              placeholder="/* 追加のCSS */"
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
              placeholder='[{"key":"hero_title","label":"タイトル","type":"text"}]'
            />
            <p className="text-xs text-gray-500 mt-2">
              各セクションの key はHTMLの {"{{key}}"} に対応します。type: text / textarea / html / image
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/admin/lp-templates">キャンセル</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "作成中..." : "テンプレートを作成"}
          </Button>
        </div>
      </form>
    </div>
  );
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{meta_title}}</title>
  <meta name="description" content="{{meta_description}}">
  {{tracking_script}}
</head>
<body>
  <h1>{{hero_title}}</h1>
  <p>{{hero_subtitle}}</p>
</body>
</html>`;

const DEFAULT_SECTIONS = JSON.stringify(
  [
    { key: "hero_title", label: "ヒーロータイトル", type: "text", hint: "メインの見出し", required: true },
    { key: "hero_subtitle", label: "サブタイトル", type: "text", hint: "補足説明", required: true },
  ],
  null,
  2
);

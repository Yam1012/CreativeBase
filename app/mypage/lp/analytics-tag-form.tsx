"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart3, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialGa4Tag: string;
  initialUaTag: string;
}

export function AnalyticsTagForm({ initialGa4Tag, initialUaTag }: Props) {
  const [ga4Tag, setGa4Tag] = useState(initialGa4Tag);
  const [uaTag, setUaTag] = useState(initialUaTag);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/mypage/analytics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ga4Tag: ga4Tag || null, uaTag: uaTag || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "保存に失敗しました");
        return;
      }
      toast.success("アナリティクスタグを保存しました");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const hasGa4 = !!ga4Tag.trim();
  const hasUa = !!uaTag.trim();
  const previewScript = buildPreviewScript(ga4Tag.trim(), uaTag.trim());

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          アナリティクスタグ設定
        </CardTitle>
        <p className="text-xs text-gray-500">
          公開LPに自動挿入されるGoogle Analyticsタグを設定します
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">GA4 測定ID</Label>
            <Input
              value={ga4Tag}
              onChange={(e) => setGa4Tag(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="font-mono text-sm bg-white"
            />
            <p className="text-xs text-gray-400">Google Analytics 4の測定ID</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">UA トラッキングID（旧）</Label>
            <Input
              value={uaTag}
              onChange={(e) => setUaTag(e.target.value)}
              placeholder="UA-XXXXXXXXXX-1"
              className="font-mono text-sm bg-white"
            />
            <p className="text-xs text-gray-400">ユニバーサルアナリティクスのID（任意）</p>
          </div>
        </div>

        {/* プレビュー */}
        {(hasGa4 || hasUa) && (
          <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
            <p className="text-xs text-gray-400 mb-2">
              {hasGa4 && hasUa ? "GA4 + UA 両方のタグ" : hasGa4 ? "GA4のみ" : "UAのみ"}
              が公開LPに挿入されます
            </p>
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">{previewScript}</pre>
          </div>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function buildPreviewScript(ga4: string, ua: string): string {
  if (!ga4 && !ua) return "";
  const primaryId = ga4 || ua;
  let script = `<!-- Google tag (gtag.js) -->\n`;
  script += `<script async src="https://www.googletagmanager.com/gtag/js?id=${primaryId}"></script>\n`;
  script += `<script>\n`;
  script += `  window.dataLayer = window.dataLayer || [];\n`;
  script += `  function gtag(){dataLayer.push(arguments);}\n`;
  script += `  gtag('js', new Date());\n`;
  if (ga4) script += `  gtag('config', '${ga4}');\n`;
  if (ua) script += `  gtag('config', '${ua}');\n`;
  script += `</script>`;
  return script;
}

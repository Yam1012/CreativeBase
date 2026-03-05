"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Video, FileText, Info } from "lucide-react";
import { toast } from "sonner";

export default function NewOrderPage() {
  const router = useRouter();
  const [type, setType] = useState<"video" | "lp" | "">("");
  const [rushDelivery, setRushDelivery] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // 金額は未定（空箱）
  const basePrice = 0; // TBD

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) { toast.error("種別を選択してください"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, rushDelivery, notes, basePrice }),
      });
      if (!res.ok) { toast.error("申し込みに失敗しました"); return; }
      toast.success("オーダーを受け付けました");
      router.push("/mypage/orders");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage/orders"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">追加オーダー申し込み</h1>
        <p className="text-gray-500 text-sm mt-0.5">動画またはLP制作をご依頼ください</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">追加オーダーについて</p>
          <p className="mt-1">料金は内容確認後に担当者よりご連絡いたします。申し込み時点での請求はありません。</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 種別選択 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">制作種別 <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-4">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${type === "video" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setType("video")}
            >
              <div className="flex items-center gap-3">
                <Video className={`w-6 h-6 ${type === "video" ? "text-blue-500" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-sm">動画制作</div>
                  <div className="text-xs text-gray-500">プロモーション動画など</div>
                </div>
              </div>
            </div>
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${type === "lp" ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => setType("lp")}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-6 h-6 ${type === "lp" ? "text-purple-500" : "text-gray-400"}`} />
                <div>
                  <div className="font-semibold text-sm">LP制作</div>
                  <div className="text-xs text-gray-500">ランディングページ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* オプション */}
        <div className="space-y-3">
          <label className="text-sm font-medium">オプション</label>
          <div
            className={`border rounded-lg p-4 cursor-pointer flex items-center justify-between ${rushDelivery ? "border-orange-300 bg-orange-50" : "border-gray-200"}`}
            onClick={() => setRushDelivery(!rushDelivery)}
          >
            <div>
              <div className="text-sm font-medium">最速納品</div>
              <div className="text-xs text-gray-500">通常より優先的に対応（追加料金：要相談）</div>
            </div>
            <input type="checkbox" checked={rushDelivery} onChange={() => {}} className="w-4 h-4" />
          </div>
        </div>

        {/* 備考 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">ご要望・備考</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="制作に関するご要望やご質問をご記入ください..."
            rows={4}
          />
        </div>

        <Button type="submit" disabled={loading || !type} className="w-full bg-blue-600 hover:bg-blue-500">
          {loading ? "送信中..." : "申し込む"}
        </Button>
      </form>
    </div>
  );
}

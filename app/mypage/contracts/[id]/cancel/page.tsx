"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Preview { refund: number; courseName: string; monthlyFee: number }

export default function ContractCancelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/contracts/${id}/cancel`)
      .then((r) => r.json())
      .then(setPreview);
  }, [id]);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${id}/cancel`, { method: "POST" });
      if (!res.ok) { toast.error("解約処理に失敗しました"); return; }
      toast.success("コースを解約しました");
      router.push("/mypage/contracts");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/mypage/contracts/${id}`}><ArrowLeft className="w-4 h-4 mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">コース解約</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            解約前にご確認ください
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-700 space-y-1">
          <p>• 解約後はすぐにサービスが停止されます</p>
          <p>• 未使用分は日割りで計算し、ご返金いたします</p>
          <p>• この操作は取り消せません</p>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">解約内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">解約コース</span>
              <span className="font-semibold">{preview.courseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">月額（税別）</span>
              <span>¥{preview.monthlyFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-500">返金予定額（日割り・税別）</span>
              <span className="font-semibold text-green-700">
                {preview.refund > 0 ? `¥${preview.refund.toLocaleString()}` : "返金なし"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-sm cursor-pointer" onClick={() => setConfirmed(!confirmed)}>
        <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)} className="w-4 h-4" />
        <span>上記の内容を確認し、解約に同意します</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/mypage/contracts/${id}`}>キャンセル</Link>
        </Button>
        <Button
          onClick={handleCancel}
          disabled={!confirmed || loading}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white"
        >
          {loading ? "処理中..." : "解約する"}
        </Button>
      </div>
    </div>
  );
}

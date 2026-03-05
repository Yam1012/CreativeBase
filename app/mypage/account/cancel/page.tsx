"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AccountCancelInfo {
  activeContracts: number;
  totalRefund: number;
  contracts: Array<{ courseName: string; refund: number }>;
}

export default function AccountCancelPage() {
  const router = useRouter();
  const [info, setInfo] = useState<AccountCancelInfo | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/account/cancel")
      .then((r) => r.json())
      .then(setInfo);
  }, []);

  async function handleCancel() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/cancel", { method: "POST" });
      if (!res.ok) { toast.error("解約処理に失敗しました"); return; }
      toast.success("アカウントを解約しました");
      router.push("/login");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage/profile"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">アカウント解約</h1>
      </div>

      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            重要なお知らせ
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-red-700 space-y-1">
          <p>• アカウント解約後、すべての契約が即時解約されます</p>
          <p>• 保存されているデータはすべて削除されます</p>
          <p>• 未使用分は日割りで計算しご返金いたします</p>
          <p>• この操作は取り消せません</p>
        </CardContent>
      </Card>

      {info && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">解約内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">解約対象コース数</span>
              <span className="font-semibold">{info.activeContracts}件</span>
            </div>
            {info.contracts.map((c, i) => (
              <div key={i} className="flex justify-between text-gray-600">
                <span>{c.courseName}</span>
                <span>返金 ¥{c.refund.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-3 font-bold text-green-700">
              <span>合計返金予定額（日割り・税別）</span>
              <span>{info.totalRefund > 0 ? `¥${info.totalRefund.toLocaleString()}` : "返金なし"}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div
        className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg text-sm cursor-pointer"
        onClick={() => setConfirmed(!confirmed)}
      >
        <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)} className="w-4 h-4" />
        <span>上記の内容を理解し、アカウント解約に同意します</span>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/mypage/profile">キャンセル</Link>
        </Button>
        <Button
          onClick={handleCancel}
          disabled={!confirmed || loading}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white"
        >
          {loading ? "処理中..." : "アカウントを解約する"}
        </Button>
      </div>
    </div>
  );
}

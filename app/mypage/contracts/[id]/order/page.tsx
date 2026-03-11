"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Film, Layout, CheckCircle, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { FileUploadField } from "@/components/file-upload-field";

interface ContractData {
  id: string;
  course: {
    name: string;
    maxCreationsPerMonth: number;
  };
}

interface QuotaData {
  total: number;
  used: number;
  remaining: number;
}

interface UploadedFile {
  fileId: string;
  filename: string;
  path: string;
}

export default function ContractOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [contract, setContract] = useState<ContractData | null>(null);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [selectedType, setSelectedType] = useState<"video" | "lp" | null>(null);
  const [notes, setNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // 契約情報を取得
    fetch(`/api/contracts/${id}`)
      .then((r) => r.json())
      .then((d) => setContract(d))
      .catch(() => router.push("/mypage/contracts"));

    // クォータ情報を取得
    fetch(`/api/contracts/${id}/quota`)
      .then((r) => r.json())
      .then((d) => setQuota(d))
      .catch(() => {});
  }, [id, router]);

  async function handleSubmit() {
    if (!selectedType) {
      toast.error("制作タイプを選択してください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/contracts/${id}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          notes,
          fileIds: uploadedFiles.map((f) => f.fileId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "オーダーに失敗しました");
        return;
      }

      setCompleted(true);
      toast.success("オーダーを受け付けました");
    } catch {
      toast.error("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  // 完了画面
  if (completed) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold">オーダーを受け付けました</h2>
              <p className="text-gray-500 text-sm mt-1">
                制作準備が整い次第、ご連絡いたします。
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Button variant="outline" asChild>
                <Link href={`/mypage/contracts/${id}`}>契約詳細に戻る</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-500">
                <Link href="/mypage">マイページへ</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* 戻るボタン */}
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/mypage/contracts/${id}`}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            契約詳細に戻る
          </Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">オーダー</h1>
        <p className="text-gray-500 text-sm mt-0.5">制作内容を選択してください</p>
      </div>

      {/* 契約情報・残り枠 */}
      {contract && quota && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{contract.course.name}</span>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                残り {quota.remaining} / {quota.total} 本
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 制作タイプ選択 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">1. 制作タイプを選択</h2>
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`border-2 rounded-xl p-5 cursor-pointer transition-all text-center ${
              selectedType === "video"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedType("video")}
          >
            <Film className={`w-10 h-10 mx-auto mb-2 ${selectedType === "video" ? "text-blue-500" : "text-gray-400"}`} />
            <div className="font-semibold text-sm">動画制作</div>
            <p className="text-xs text-gray-500 mt-1">商品紹介・PR動画など</p>
            {selectedType === "video" && (
              <CheckCircle className="w-5 h-5 text-blue-500 mx-auto mt-2" />
            )}
          </div>
          <div
            className={`border-2 rounded-xl p-5 cursor-pointer transition-all text-center ${
              selectedType === "lp"
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedType("lp")}
          >
            <Layout className={`w-10 h-10 mx-auto mb-2 ${selectedType === "lp" ? "text-blue-500" : "text-gray-400"}`} />
            <div className="font-semibold text-sm">LP制作</div>
            <p className="text-xs text-gray-500 mt-1">ランディングページ制作</p>
            {selectedType === "lp" && (
              <CheckCircle className="w-5 h-5 text-blue-500 mx-auto mt-2" />
            )}
          </div>
        </div>
      </div>

      {/* ファイルアップロード */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">2. 参考資料をアップロード（任意）</h2>
        <p className="text-xs text-gray-500 mb-3">
          議事録、商談動画、参考資料などをアップロードしてください。後からでも追加できます。
        </p>
        <FileUploadField
          uploadedFiles={uploadedFiles}
          onFilesChange={setUploadedFiles}
        />
      </div>

      {/* 備考 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">3. 備考・ご要望（任意）</h2>
        <Textarea
          placeholder="制作に関するご要望やご指示があればご記入ください"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/mypage/contracts/${id}`}>キャンセル</Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedType || loading}
          className="flex-1 bg-blue-600 hover:bg-blue-500"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              処理中...
            </>
          ) : (
            "オーダーする"
          )}
        </Button>
      </div>
    </div>
  );
}

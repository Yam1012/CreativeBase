"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertTriangle, FileText, Mail, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildRentracksCvTag, buildMoshimoCvTag } from "@/lib/affiliate-config";

interface CompletionInfo {
  email: string;
  courseName: string;
  amount: number;
  nextBillingDate: string;
  receiptUrl?: string;
}

function CompleteInner() {
  const searchParams = useSearchParams();
  const finalized = useRef(false);
  const cvFired = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [info, setInfo] = useState<CompletionInfo | null>(null);

  useEffect(() => {
    if (finalized.current) return;
    finalized.current = true;

    const paymentIntentId = searchParams.get("payment_intent");
    const registerDataStr = sessionStorage.getItem("registerData");

    if (!paymentIntentId || !registerDataStr) {
      // 旧フロー（モック決済後の直接遷移）も許容
      setStatus("success");
      fireCvTags();
      return;
    }

    const registerData = JSON.parse(registerDataStr);

    const courseName = sessionStorage.getItem("cvCourseName") || "";
    const priceStr = sessionStorage.getItem("cvPrice") || "0";
    const price = parseInt(priceStr, 10);

    fetch("/api/register/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentIntentId, registerData }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setErrorMessage(data.error || "登録処理に失敗しました");
          setStatus("error");
          return;
        }
        setStatus("success");

        // 完了情報セット
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        setInfo({
          email: registerData.email || "",
          courseName,
          amount: price,
          nextBillingDate: nextBilling.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" }),
          receiptUrl: data.receiptUrl,
        });

        // sessionStorageクリーンアップ
        sessionStorage.removeItem("registerData");
        sessionStorage.removeItem("selectedCourseId");
        sessionStorage.removeItem("selectedCourseName");
        sessionStorage.removeItem("referredByCode");
        sessionStorage.removeItem("externalAffId");
        sessionStorage.removeItem("externalAffSource");
        sessionStorage.removeItem("externalAffClickedAt");
        sessionStorage.removeItem("paymentCourseId");

        fireCvTags();
      })
      .catch(() => {
        setErrorMessage("通信エラーが発生しました");
        setStatus("error");
      });
  }, [searchParams]);

  const fireCvTags = () => {
    if (cvFired.current) return;
    cvFired.current = true;

    const courseName = sessionStorage.getItem("cvCourseName") || "";
    const price = parseInt(sessionStorage.getItem("cvPrice") || "0", 10);
    const cinfo = `course_${courseName}_${Date.now()}`;

    sessionStorage.removeItem("cvCourseName");
    sessionStorage.removeItem("cvPrice");

    if (price > 0) {
      const rtDiv = document.createElement("div");
      rtDiv.innerHTML = buildRentracksCvTag(price, cinfo);
      rtDiv.querySelectorAll("script").forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });

      const msDiv = document.createElement("div");
      msDiv.innerHTML = buildMoshimoCvTag(price, cinfo);
      msDiv.querySelectorAll("script").forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });
    }
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">登録処理中です。お待ちください...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm text-red-600">{errorMessage}</p>
            <p className="text-xs text-gray-500">
              決済は完了している可能性があります。サポートまでお問い合わせください。
            </p>
            <Button variant="outline" asChild>
              <Link href="/login">ログインを試す</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4 py-8">
      <div className="w-full max-w-lg">
        <Card className="shadow-xl border-0">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">ご登録ありがとうございます</h2>
              <p className="text-gray-500 text-sm">
                アカウント開設と決済が正常に完了しました
              </p>
            </div>

            {/* 契約サマリー */}
            {info && (
              <div className="border rounded-lg p-4 space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">ご契約コース</span>
                  </div>
                  <Badge className="bg-blue-600 text-white">{info.courseName}</Badge>
                </div>
                {info.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">登録メール</span>
                    </div>
                    <span className="text-sm text-gray-800 font-mono">{info.email}</span>
                  </div>
                )}
                {info.amount > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-blue-100">
                    <span className="text-sm text-gray-700">お支払金額</span>
                    <span className="text-lg font-bold text-gray-900">¥{info.amount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">次回課金予定日</span>
                  </div>
                  <span className="text-sm text-gray-800">{info?.nextBillingDate}</span>
                </div>
              </div>
            )}

            {/* 次のステップ */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-medium text-gray-800">次のステップ</p>
              <ul className="space-y-1.5 text-gray-600">
                <li className="flex gap-2"><span className="text-blue-600 font-bold">1.</span><span>確認メールをご確認ください（迷惑メールフォルダもご確認ください）</span></li>
                <li className="flex gap-2"><span className="text-blue-600 font-bold">2.</span><span>マイページからサービスをご利用いただけます</span></li>
                <li className="flex gap-2"><span className="text-blue-600 font-bold">3.</span><span>年間の制作枠内で「動画」か「LP制作」をオーダー</span></li>
                <li className="flex gap-2"><span className="text-blue-600 font-bold">4.</span><span>領収書は「マイページ → 支払い履歴」からいつでも取得できます</span></li>
              </ul>
            </div>

            {/* CTAボタン */}
            <div className="space-y-2">
              <Button asChild className="w-full bg-slate-800 hover:bg-slate-700">
                <Link href="/login">ログインしてマイページへ</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/mypage/payments">
                  <FileText className="w-4 h-4 mr-2" />領収書を確認する
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterCompletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
      <CompleteInner />
    </Suspense>
  );
}

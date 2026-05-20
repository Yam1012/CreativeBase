"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildRentracksCvTag, buildMoshimoCvTag } from "@/lib/affiliate-config";

function CompleteInner() {
  const searchParams = useSearchParams();
  const finalized = useRef(false);
  const cvFired = useRef(false);
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 text-center">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">登録が完了しました</h2>
              <p className="text-gray-500 mt-2 text-sm">
                アカウント開設のご確認メールをお送りしました。<br />
                ご登録いただいたメールアドレスをご確認ください。
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-left space-y-1 text-gray-600">
              <p className="font-medium text-gray-800">次のステップ</p>
              <p>1. 確認メールをご確認ください</p>
              <p>2. マイページからサービスをご利用いただけます</p>
              <p>3. 年間の制作枠内で「動画」か「LP制作」をオーダーしてください</p>
            </div>
            <Button asChild className="w-full bg-slate-800 hover:bg-slate-700">
              <Link href="/login">ログインする</Link>
            </Button>
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

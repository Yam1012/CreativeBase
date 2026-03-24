"use client";

import { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildRentracksCvTag, buildMoshimoCvTag } from "@/lib/affiliate-config";

export default function RegisterCompletePage() {
  const cvFired = useRef(false);

  useEffect(() => {
    if (cvFired.current) return;
    cvFired.current = true;

    const courseName = sessionStorage.getItem("cvCourseName") || "";
    const price = parseInt(sessionStorage.getItem("cvPrice") || "0", 10);
    const cinfo = `course_${courseName}_${Date.now()}`;

    // CVタグを発火させたらセッションストレージをクリア
    sessionStorage.removeItem("cvCourseName");
    sessionStorage.removeItem("cvPrice");

    if (price > 0) {
      // レントラックス CVタグ
      const rtDiv = document.createElement("div");
      rtDiv.innerHTML = buildRentracksCvTag(price, cinfo);
      const rtScripts = rtDiv.querySelectorAll("script");
      rtScripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });

      // もしもアフィリエイト CVタグ
      const msDiv = document.createElement("div");
      msDiv.innerHTML = buildMoshimoCvTag(price, cinfo);
      const msScripts = msDiv.querySelectorAll("script");
      msScripts.forEach((script) => {
        const newScript = document.createElement("script");
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
      });
    }
  }, []);

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

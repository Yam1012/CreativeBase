"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

const PLANS = [
  {
    id: "startup",
    name: "Start Up",
    monthlyFee: 10000,
    initialFee: 100000,
    creations: 1,
    languages: 68,
    description: "毎月1本、動画またはLP制作",
    recommended: false,
  },
  {
    id: "standard",
    name: "Standard",
    monthlyFee: 50000,
    initialFee: 100000,
    creations: 2,
    languages: 68,
    description: "毎月2本、動画またはLP制作",
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyFee: 100000,
    initialFee: 100000,
    creations: 4,
    languages: 68,
    description: "毎月4本、動画またはLP制作",
    recommended: false,
  },
];

export default function CourseSelectPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // 登録データの確認
    const data = sessionStorage.getItem("registerData");
    if (!data) {
      router.push("/register");
      return;
    }

    // DBからコースIDを取得
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => setCourses(data))
      .catch(() => {});
  }, [router]);

  function handleSelect(planName: string) {
    setSelected(planName);
  }

  function handleNext() {
    if (!selected) return;
    // コース名は必ず保存（APIが未ロードでも進める）
    sessionStorage.setItem("selectedCourseName", selected);
    const course = courses.find((c) => c.name === selected);
    if (course) {
      sessionStorage.setItem("selectedCourseId", course.id);
    } else {
      // APIが未ロードの場合はIDを空にして決済ページで再取得
      sessionStorage.removeItem("selectedCourseId");
    }
    router.push("/register/payment");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Creative Base</h1>
          <p className="text-slate-300 mt-1 text-sm">コースを選択してください</p>
        </div>

        {/* ステップ */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-slate-300">基本情報</span>
          </div>
          <div className="text-slate-400">──</div>
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-white font-medium">コース選択</span>
          </div>
          <div className="text-slate-400">──</div>
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center text-xs">3</span>
            <span className="text-slate-400">決済</span>
          </div>
        </div>

        {/* 初期費用の説明 */}
        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 text-blue-200 text-sm text-center">
          ※ 全プラン共通で初期設定費用 <strong>¥100,000（税別）</strong> が別途かかります
        </div>

        {/* プランカード */}
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative cursor-pointer rounded-xl border-2 transition-all ${
                selected === plan.name
                  ? "border-blue-400 shadow-lg shadow-blue-500/20 scale-105"
                  : "border-slate-600 hover:border-slate-400"
              }`}
              onClick={() => handleSelect(plan.name)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-3">人気</Badge>
                </div>
              )}
              <Card className={`border-0 h-full ${plan.recommended ? "bg-slate-800" : "bg-slate-900/80"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-white">
                      ¥{plan.monthlyFee.toLocaleString()}
                      <span className="text-lg font-normal text-slate-400">/月</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">税別</div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>月{plan.creations}本制作</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{plan.languages}言語対応</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>動画・LP選択可</span>
                    </div>
                  </div>
                  {selected === plan.name && (
                    <div className="flex items-center gap-1 text-blue-400 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      選択中
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-transparent text-white border-white/30 hover:bg-white/10"
          >
            戻る
          </Button>
          <Button
            onClick={handleNext}
            disabled={!selected}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8"
          >
            次へ：お支払い情報
          </Button>
        </div>
      </div>
    </div>
  );
}

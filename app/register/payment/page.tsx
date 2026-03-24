"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";

const PLAN_FEES: Record<string, { monthly: number; initial: number }> = {
  "Start Up": { monthly: 10000, initial: 100000 },
  Standard: { monthly: 50000, initial: 100000 },
  Enterprise: { monthly: 100000, initial: 100000 },
};

export default function PaymentPage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    const name = sessionStorage.getItem("selectedCourseName");
    const id = sessionStorage.getItem("selectedCourseId");
    const registerData = sessionStorage.getItem("registerData");

    // 基本情報がなければ最初からやり直し
    if (!registerData) {
      router.push("/register");
      return;
    }
    // コース名がなければコース選択に戻す
    if (!name) {
      router.push("/register/course");
      return;
    }

    setCourseName(name);

    if (id) {
      // sessionStorageにIDがあればそのまま使う
      setCourseId(id);
    } else {
      // IDがない場合（APIが遅延していた場合）はAPIから再取得
      fetch("/api/courses")
        .then((r) => r.json())
        .then((courses: Array<{ id: string; name: string }>) => {
          const course = courses.find((c) => c.name === name);
          if (course) {
            setCourseId(course.id);
            sessionStorage.setItem("selectedCourseId", course.id);
          } else {
            router.push("/register/course");
          }
        })
        .catch(() => {
          router.push("/register/course");
        });
    }
  }, [router]);

  const fees = PLAN_FEES[courseName] || { monthly: 0, initial: 100000 };
  const total = fees.initial + fees.monthly;

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const registerData = JSON.parse(sessionStorage.getItem("registerData") || "{}");

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...registerData, courseId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "登録に失敗しました");
        return;
      }

      // CV計測用にコース名と金額を保持
      sessionStorage.setItem("cvCourseName", courseName);
      sessionStorage.setItem("cvPrice", String(total));

      // セッションストレージをクリア（登録データのみ）
      sessionStorage.removeItem("registerData");
      sessionStorage.removeItem("selectedCourseId");
      sessionStorage.removeItem("selectedCourseName");

      router.push("/register/complete");
    } catch {
      toast.error("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Creative Base</h1>
          <p className="text-slate-300 mt-1 text-sm">お支払い情報</p>
        </div>

        {/* ステップ */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {["基本情報", "コース選択"].map((s) => (
            <span key={s} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-slate-300">{s}</span>
              <span className="text-slate-400">──</span>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-white font-medium">決済</span>
          </div>
        </div>

        {/* 金額サマリー */}
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <span>ご請求内容</span>
              <Badge className="bg-blue-600">{courseName}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-300">
            <div className="flex justify-between">
              <span>初期設定費用</span>
              <span>¥{fees.initial.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>初月分（月額）</span>
              <span>¥{fees.monthly.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-white text-base">
              <span>合計（税別）</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">※ 翌月以降は月額 ¥{fees.monthly.toLocaleString()}（税別）が毎月請求されます</p>
          </CardContent>
        </Card>

        {/* 決済フォーム（モック） */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              クレジットカード情報
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Lock className="w-3 h-3" />
              ※ これはデモ環境です。実際の決済は行われません
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">カード番号</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  required
                  maxLength={19}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">カード名義人</Label>
                <Input
                  id="cardName"
                  placeholder="TARO YAMADA"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">有効期限</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    required
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">セキュリティコード</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    required
                    maxLength={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  戻る
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
                  disabled={loading}
                >
                  {loading ? "処理中..." : `¥${total.toLocaleString()} を支払う`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

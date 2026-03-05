"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Course { id: string; name: string; monthlyFee: number; initialFee: number; maxCreationsPerMonth: number; type: string }

export default function ContractAddPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [step, setStep] = useState<"select" | "confirm" | "payment">("select");
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d: Course[]) => setCourses(d.filter((c) => c.type === "subscription")));
  }, []);

  const selectedCourse = courses.find((c) => c.id === selected);

  async function handleAdd() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/contracts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selected }),
      });
      if (!res.ok) { toast.error("追加に失敗しました"); return; }
      toast.success("コースを追加しました");
      router.push("/mypage/contracts");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage/contracts"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">コースを追加</h1>
        <p className="text-gray-500 text-sm mt-0.5">追加するコースを選択してください</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        ※ 初期設定費用 <strong>¥100,000（税別）</strong> + 初月分がかかります
      </div>

      {step === "select" && (
        <>
          <div className="grid gap-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selected === course.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelected(course.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selected === course.id && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    <div>
                      <div className="font-semibold">{course.name}</div>
                      <div className="text-sm text-gray-500">月{course.maxCreationsPerMonth}本 | 月額 ¥{course.monthlyFee.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => setStep("confirm")}
            disabled={!selected}
            className="w-full bg-blue-600 hover:bg-blue-500"
          >
            次へ：内容確認
          </Button>
        </>
      )}

      {step === "confirm" && selectedCourse && (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">追加内容の確認</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">コース</span><span className="font-semibold">{selectedCourse.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">初期費用</span><span>¥{selectedCourse.initialFee.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">初月分</span><span>¥{selectedCourse.monthlyFee.toLocaleString()}</span></div>
              <div className="flex justify-between border-t pt-3 font-bold text-base">
                <span>今回のお支払い（税別）</span>
                <span>¥{(selectedCourse.initialFee + selectedCourse.monthlyFee).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-400">翌月以降は月額 ¥{selectedCourse.monthlyFee.toLocaleString()} が毎月請求されます</p>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("select")} className="flex-1">戻る</Button>
            <Button onClick={() => setStep("payment")} className="flex-1 bg-blue-600 hover:bg-blue-500">お支払いへ進む</Button>
          </div>
        </>
      )}

      {step === "payment" && selectedCourse && (
        <>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" />クレジットカード情報</CardTitle>
              <CardDescription className="text-xs">※ デモ環境 - 実際の決済は行われません</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">カード番号</label>
                <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="4242 4242 4242 4242" value={card.number} onChange={e => setCard({...card, number: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">カード名義</label>
                <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="TARO YAMADA" value={card.name} onChange={e => setCard({...card, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">有効期限</label>
                  <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="MM/YY" value={card.expiry} onChange={e => setCard({...card, expiry: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">セキュリティコード</label>
                  <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="123" value={card.cvc} onChange={e => setCard({...card, cvc: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep("confirm")} className="flex-1">戻る</Button>
                <Button onClick={handleAdd} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500">
                  {loading ? "処理中..." : `¥${(selectedCourse.initialFee + selectedCourse.monthlyFee).toLocaleString()} を支払う`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, Lock, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const PLAN_FEES: Record<string, { monthly: number; initial: number }> = {
  Entry: { monthly: 10000, initial: 100000 },
  "Start Up": { monthly: 50000, initial: 100000 },
  Standard: { monthly: 100000, initial: 100000 },
};

interface PaymentIntentInfo {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
  amount: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [courseName, setCourseName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [paymentInfo, setPaymentInfo] = useState<PaymentIntentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    const name = sessionStorage.getItem("selectedCourseName");
    const id = sessionStorage.getItem("selectedCourseId");
    const registerData = sessionStorage.getItem("registerData");

    if (!registerData) {
      router.push("/register");
      return;
    }
    if (!name) {
      router.push("/register/course");
      return;
    }

    setCourseName(name);
    const data = JSON.parse(registerData);

    // courseId取得
    const resolveCourseId = async () => {
      if (id) {
        setCourseId(id);
        return id;
      }
      const courses: Array<{ id: string; name: string }> = await fetch("/api/courses").then((r) => r.json());
      const course = courses.find((c) => c.name === name);
      if (!course) {
        router.push("/register/course");
        return null;
      }
      sessionStorage.setItem("selectedCourseId", course.id);
      setCourseId(course.id);
      return course.id;
    };

    // PaymentIntent作成
    const init = async () => {
      const cid = await resolveCourseId();
      if (!cid) return;

      const referredByCode = sessionStorage.getItem("referredByCode");
      const externalAffId = sessionStorage.getItem("externalAffId");
      const externalAffSource = sessionStorage.getItem("externalAffSource");

      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          name: data.name,
          courseId: cid,
          mode: "register",
          registerData: { referredByCode, externalAffId, externalAffSource },
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "決済の準備に失敗しました");
        return;
      }
      setPaymentInfo(result);
      setStripePromise(loadStripe(result.publishableKey));
    };

    init();
  }, [router]);

  const fees = PLAN_FEES[courseName] || { monthly: 0, initial: 100000 };
  const total = fees.initial + fees.monthly;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={() => router.push("/register/course")}>
              コース選択に戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!paymentInfo || !stripePromise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
        <div className="text-white flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          決済を準備しています...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Creative Base</h1>
          <p className="text-slate-300 mt-1 text-sm">お支払い情報</p>
        </div>

        {/* ステップ */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm">
          {["基本情報", "コース選択"].map((s) => (
            <span key={s} className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">{s}</span>
              <span className="text-slate-400">──</span>
            </span>
          ))}
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold">3</span>
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
            <div className="flex justify-between"><span>初期設定費用</span><span>¥{fees.initial.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>初月分（月額）</span><span>¥{fees.monthly.toLocaleString()}</span></div>
            <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-white text-base">
              <span>合計（税別）</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400">※ 翌月以降は月額 ¥{fees.monthly.toLocaleString()}（税別）が毎月請求されます</p>
          </CardContent>
        </Card>

        {/* 決済フォーム（Stripe Payment Element） */}
        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              お支払い情報
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Lock className="w-3 h-3" />
              Stripeにより安全に処理されます
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret: paymentInfo.clientSecret, locale: "ja" }}>
              <CheckoutForm courseId={courseId} amount={total} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckoutForm({ courseId, amount }: { courseId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      // courseIdをsessionに残してreturn後に使えるように
      sessionStorage.setItem("paymentCourseId", courseId);
      sessionStorage.setItem("cvCourseName", sessionStorage.getItem("selectedCourseName") || "");
      sessionStorage.setItem("cvPrice", String(amount));

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/register/complete`,
        },
      });
      if (error) {
        toast.error(error.message || "決済に失敗しました");
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
        disabled={!stripe || processing}
      >
        {processing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 処理中...</>
        ) : (
          `¥${amount.toLocaleString()} を支払う`
        )}
      </Button>
    </form>
  );
}

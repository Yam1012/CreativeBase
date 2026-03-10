"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Step = "input" | "confirm" | "complete";

export default function InquiryPage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("input");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 氏名を自動入力
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("氏名を入力してください"); return; }
    if (!message.trim()) { toast.error("お問い合わせ内容を入力してください"); return; }
    if (message.length > 1000) { toast.error("お問い合わせ内容は1000文字以内でお願いします"); return; }
    setStep("confirm");
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "送信に失敗しました");
        return;
      }
      setStep("complete");
    } finally {
      setLoading(false);
    }
  }

  // 完了画面
  if (step === "complete") {
    return (
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">お問い合わせを受け付けました</h2>
            <p className="text-gray-500 text-sm">
              ご入力いただいたメールアドレスに確認メールをお送りしました。<br />
              担当者より2〜3営業日以内にご返信いたします。
            </p>
            <Button asChild className="mt-4">
              <Link href="/mypage">マイページに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 確認画面
  if (step === "confirm") {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Button variant="ghost" size="sm" onClick={() => setStep("input")}>
            <ArrowLeft className="w-4 h-4 mr-1" />戻る
          </Button>
          <h1 className="text-2xl font-bold mt-2">お問い合わせ内容の確認</h1>
          <p className="text-gray-500 text-sm mt-0.5">以下の内容で送信します。よろしければ「送信する」を押してください。</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">送信内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">氏名</label>
              <p className="mt-1">{name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">お問い合わせ内容</label>
              <p className="mt-1 whitespace-pre-wrap">{message}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("input")} className="flex-1">
            修正する
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-500">
            <Send className="w-4 h-4 mr-1" />
            {loading ? "送信中..." : "送信する"}
          </Button>
        </div>
      </div>
    );
  }

  // 入力画面
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage"><ArrowLeft className="w-4 h-4 mr-1" />マイページに戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">お問い合わせ</h1>
        <p className="text-gray-500 text-sm mt-0.5">ご質問やご要望をお気軽にお寄せください</p>
      </div>

      <form onSubmit={handleConfirm} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">氏名 <span className="text-red-500">*</span></label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="お名前"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">お問い合わせ内容 <span className="text-red-500">*</span></label>
            <span className={`text-xs ${message.length > 1000 ? "text-red-500" : "text-gray-400"}`}>
              {message.length}/1000
            </span>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="お問い合わせ内容をご記入ください..."
            rows={8}
            maxLength={1000}
            required
          />
        </div>

        <Button type="submit" disabled={!name.trim() || !message.trim()} className="w-full bg-blue-600 hover:bg-blue-500">
          確認画面へ
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const categories = [
  { value: "contract", label: "ご契約について" },
  { value: "order", label: "制作オーダーについて" },
  { value: "payment", label: "お支払い・請求について" },
  { value: "technical", label: "技術的なご質問" },
  { value: "other", label: "その他" },
];

export default function ContactPage() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !subject || !message) {
      toast.error("すべての項目を入力してください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, message }),
      });
      if (!res.ok) {
        toast.error("送信に失敗しました");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mypage"><ArrowLeft className="w-4 h-4 mr-1" />ダッシュボードへ戻る</Link>
          </Button>
        </div>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold text-green-800 mb-2">お問い合わせを受け付けました</h2>
            <p className="text-sm text-green-700 mb-1">確認メールをお送りしましたのでご確認ください。</p>
            <p className="text-sm text-green-700">担当者より2営業日以内にご回答いたします。</p>
            <Button asChild className="mt-6 bg-green-600 hover:bg-green-500">
              <Link href="/mypage">ダッシュボードへ戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/mypage"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold mt-2">お問い合わせ</h1>
        <p className="text-gray-500 text-sm mt-0.5">ご不明な点やご要望がございましたら、お気軽にお問い合わせください</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">お問い合わせフォーム</CardTitle>
          <CardDescription className="text-xs">
            受付時間：平日 10:00〜18:00 | 2営業日以内にご回答いたします
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">カテゴリ <span className="text-red-500">*</span></label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="お問い合わせカテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">件名 <span className="text-red-500">*</span></label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="お問い合わせの件名を入力してください"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">お問い合わせ内容 <span className="text-red-500">*</span></label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="お問い合わせ内容を詳しくご記入ください..."
                rows={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !category || !subject || !message}
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              {loading ? (
                "送信中..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  送信する
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

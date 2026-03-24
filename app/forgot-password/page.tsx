"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        toast.error(data.error || "エラーが発生しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Creative Base</h1>
          <p className="text-slate-300 mt-1 text-sm">株式会社データノート</p>
        </div>

        <Card className="shadow-xl border-0">
          {sent ? (
            <>
              <CardHeader className="space-y-1 pb-4 text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl">メールを送信しました</CardTitle>
                <CardDescription>
                  入力されたメールアドレス宛にパスワード再設定のご案内を送信しました。
                  メールに記載されたURLからパスワードを再設定してください。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500 mb-4">
                  ※メールが届かない場合は、迷惑メールフォルダをご確認ください。
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-1" /> ログイン画面に戻る
                  </Link>
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">パスワード再設定</CardTitle>
                <CardDescription>
                  ご登録のメールアドレスを入力してください。パスワード再設定用のURLをお送りします。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-800 hover:bg-slate-700"
                    disabled={loading}
                  >
                    {loading ? "送信中..." : "再設定メールを送信"}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Link href="/login" className="text-sm text-slate-600 hover:underline">
                    <ArrowLeft className="w-3 h-3 inline mr-1" />
                    ログイン画面に戻る
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-slate-400">
          © 株式会社データノート. All rights reserved.
        </p>
      </div>
    </div>
  );
}

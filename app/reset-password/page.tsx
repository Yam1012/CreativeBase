"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">無効なリンク</CardTitle>
          <CardDescription>
            パスワード再設定リンクが無効です。再度リセットをお試しください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/forgot-password">パスワード再設定を再リクエスト</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("パスワードは8文字以上で設定してください");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        toast.error(data.error || "エラーが発生しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">パスワードを再設定しました</CardTitle>
          <CardDescription>
            新しいパスワードでログインしてください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full bg-slate-800 hover:bg-slate-700" asChild>
            <Link href="/login">ログイン画面へ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl">新しいパスワードを設定</CardTitle>
        <CardDescription>8文字以上の新しいパスワードを入力してください。</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">新しいパスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード（確認）</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="もう一度入力"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700"
            disabled={loading}
          >
            {loading ? "設定中..." : "パスワードを再設定"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">Creative Base</h1>
          <p className="text-slate-300 mt-1 text-sm">株式会社データノート</p>
        </div>

        <Suspense fallback={<div className="text-center text-slate-300">読み込み中...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <p className="text-center text-xs text-slate-400">
          © 株式会社データノート. All rights reserved.
        </p>
      </div>
    </div>
  );
}

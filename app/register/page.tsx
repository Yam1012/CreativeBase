"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    nameKana: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.name) newErrors.name = "氏名を入力してください";
    if (!form.email) newErrors.email = "メールアドレスを入力してください";
    if (!form.password) newErrors.password = "パスワードを入力してください";
    if (form.password.length < 8) newErrors.password = "パスワードは8文字以上で入力してください";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "パスワードが一致しません";
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // セッションストレージに一時保存してコース選択へ
    sessionStorage.setItem("registerData", JSON.stringify({
      name: form.name,
      nameKana: form.nameKana,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address,
    }));
    router.push("/register/course");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Creative Base</h1>
          <p className="text-slate-300 mt-1 text-sm">新規会員登録</p>
        </div>

        {/* ステップ表示 */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-white text-slate-800 flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-white font-medium">基本情報</span>
          </div>
          <div className="text-slate-400">──</div>
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center text-xs">2</span>
            <span className="text-slate-400">コース選択</span>
          </div>
          <div className="text-slate-400">──</div>
          <div className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center text-xs">3</span>
            <span className="text-slate-400">決済</span>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">基本情報の入力</CardTitle>
            <CardDescription>アカウントを作成するための情報を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">氏名 <span className="text-red-500">*</span></Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="山田 太郎" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameKana">氏名（フリガナ）</Label>
                  <Input id="nameKana" name="nameKana" value={form.nameKana} onChange={handleChange} placeholder="ヤマダ タロウ" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="example@email.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード <span className="text-red-500">*</span></Label>
                  <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="8文字以上" />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">パスワード確認 <span className="text-red-500">*</span></Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="再入力" />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="090-0000-0000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">住所</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} placeholder="東京都渋谷区..." />
              </div>

              <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-700 mt-2">
                次へ：コース選択
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              すでにアカウントをお持ちの方は{" "}
              <Link href="/login" className="text-slate-700 font-medium hover:underline">ログイン</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

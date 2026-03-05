"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  nameKana: string | null;
  email: string;
  phone: string | null;
  address: string | null;
}

export default function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    name: user.name,
    nameKana: user.nameKana || "",
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("パスワードが一致しません");
      return;
    }
    if (form.password && form.password.length < 8) {
      toast.error("パスワードは8文字以上にしてください");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          nameKana: form.nameKana,
          email: form.email,
          phone: form.phone,
          address: form.address,
          ...(form.password ? { password: form.password } : {}),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "更新に失敗しました");
        return;
      }
      toast.success("情報を更新しました");
      setForm({ ...form, password: "", confirmPassword: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">氏名 <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameKana">フリガナ</Label>
          <Input id="nameKana" name="nameKana" value={form.nameKana} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
        <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">住所</Label>
        <Input id="address" name="address" value={form.address} onChange={handleChange} />
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-3">パスワード変更（変更しない場合は空欄）</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password">新パスワード</Label>
            <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="8文字以上" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">パスワード確認</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="bg-slate-800 hover:bg-slate-700">
        {loading ? "更新中..." : "変更を保存"}
      </Button>
    </form>
  );
}

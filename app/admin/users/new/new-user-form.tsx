"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  name: string;
  monthlyFee: number;
}

export function NewUserForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    nameKana: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    companyName: "",
    chatworkId: "",
    role: "user",
    courseId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("氏名・メール・パスワードは必須です");
      return;
    }
    if (form.password.length < 8) {
      toast.error("パスワードは8文字以上にしてください");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "作成に失敗しました");
        return;
      }
      toast.success("ユーザーを作成しました");
      router.push(`/admin/users/${data.userId}`);
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">氏名 <span className="text-red-500">*</span></Label>
          <Input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameKana">フリガナ</Label>
          <Input id="nameKana" name="nameKana" value={form.nameKana} onChange={handleChange} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード <span className="text-red-500">*</span></Label>
          <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="8文字以上" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">法人名</Label>
          <Input id="companyName" name="companyName" value={form.companyName} onChange={handleChange} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">住所</Label>
        <Input id="address" name="address" value={form.address} onChange={handleChange} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="chatworkId">Chatwork ID</Label>
          <Input id="chatworkId" name="chatworkId" value={form.chatworkId} onChange={handleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">権限</Label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
          >
            <option value="user">一般ユーザー</option>
            <option value="admin">管理者</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="courseId">コース付与（任意・Stripe決済なしで直接付与）</Label>
        <select
          id="courseId"
          name="courseId"
          value={form.courseId}
          onChange={handleChange}
          className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm"
        >
          <option value="">付与しない</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}（月額 ¥{c.monthlyFee.toLocaleString()}）</option>
          ))}
        </select>
        <p className="text-xs text-gray-500">
          ※コース付与する場合、Stripe側のSubscriptionは作成されません（決済は手動管理）
        </p>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
          ユーザーを作成
        </Button>
      </div>
    </form>
  );
}

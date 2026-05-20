"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  id: string;
  name: string;
  nameKana: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  companyName: string | null;
  chatworkId: string | null;
  role: string;
}

export function UserActions({ user }: { user: UserData }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: user.name,
    nameKana: user.nameKana || "",
    email: user.email,
    phone: user.phone || "",
    address: user.address || "",
    companyName: user.companyName || "",
    chatworkId: user.chatworkId || "",
    role: user.role,
    password: "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { ...form };
      if (!body.password) delete body.password;
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "更新に失敗しました");
        return;
      }
      toast.success("ユーザー情報を更新しました");
      setEditOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "削除に失敗しました");
        return;
      }
      toast.success("ユーザーを削除しました");
      router.push("/admin/users");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* 編集 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit2 className="w-4 h-4 mr-1" /> 編集
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ユーザー情報の編集</DialogTitle>
            <DialogDescription>変更内容を入力して保存してください</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">氏名</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">フリガナ</Label>
              <Input value={form.nameKana} onChange={(e) => setForm({ ...form, nameKana: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">メール</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">電話番号</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs">住所</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">法人名</Label>
              <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Chatwork ID</Label>
              <Input value={form.chatworkId} onChange={(e) => setForm({ ...form, chatworkId: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">権限</Label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full h-10 border rounded-md px-3 text-sm bg-background"
              >
                <option value="user">一般ユーザー</option>
                <option value="admin">管理者</option>
                <option value="cancelled">解約済</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">パスワード（変更時のみ入力）</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="8文字以上" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除（管理者以外） */}
      {user.role !== "admin" && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-1" /> 削除
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-red-600">ユーザー削除の確認</DialogTitle>
              <DialogDescription className="text-sm space-y-2 mt-2">
                <span className="block font-medium text-gray-900">{user.name}（{user.email}）</span>
                <span className="block text-red-600">
                  このユーザーと関連する全データ（契約・オーダー・LP・決済履歴・コメント等）が完全に削除されます。<br />
                  この操作は取り消せません。
                </span>
                <span className="block">
                  ※ 一時的に無効化したい場合は「アカウント無効化」ボタンをご利用ください
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>キャンセル</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
                完全に削除する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

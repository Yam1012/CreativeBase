"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Edit2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OptionItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  periodType: string;
  periodDays: number | null;
  category: string;
  isActive: boolean;
  sortOrder: number;
}

interface Props {
  initialOptions: OptionItem[];
}

const PERIOD_LABELS: Record<string, string> = {
  none: "なし",
  limited: "有限",
  unlimited: "無限",
};

const CATEGORY_LABELS: Record<string, string> = {
  general: "汎用",
  video: "動画",
  lp: "LP",
};

export function OptionsManager({ initialOptions }: Props) {
  const [options, setOptions] = useState<OptionItem[]>(initialOptions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/admin/options");
    if (res.ok) setOptions(await res.json());
  };

  const handleCreate = async (data: Omit<OptionItem, "id" | "isActive">) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "作成に失敗しました");
        return;
      }
      toast.success("オプションを追加しました");
      setShowNewForm(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<OptionItem>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/options/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("更新に失敗しました");
        return;
      }
      toast.success("更新しました");
      setEditingId(null);
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このオプションを削除しますか？")) return;
    const res = await fetch(`/api/admin/options/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("削除に失敗しました");
      return;
    }
    toast.success("削除しました");
    await refresh();
  };

  const handleToggle = async (opt: OptionItem) => {
    await handleUpdate(opt.id, { isActive: !opt.isActive });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowNewForm(true)} disabled={showNewForm}>
          <Plus className="w-4 h-4 mr-1" /> 新規追加
        </Button>
      </div>

      {/* 新規追加フォーム */}
      {showNewForm && (
        <OptionForm
          onSave={handleCreate}
          onCancel={() => setShowNewForm(false)}
          saving={saving}
        />
      )}

      {/* オプション一覧 */}
      {options.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p>オプション項目がまだありません</p>
            <p className="text-xs mt-1">「新規追加」から作成してください</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => (
            <Card key={opt.id} className={opt.isActive ? "" : "opacity-60"}>
              {editingId === opt.id ? (
                <OptionForm
                  initial={opt}
                  onSave={(data) => handleUpdate(opt.id, data)}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{opt.name}</CardTitle>
                      <Badge variant={opt.isActive ? "default" : "outline"}>
                        {opt.isActive ? "有効" : "無効"}
                      </Badge>
                    </div>
                    {opt.description && (
                      <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-gray-400">料金</div>
                        <div className="font-bold text-base">¥{opt.price.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">期間</div>
                        <div>
                          {PERIOD_LABELS[opt.periodType]}
                          {opt.periodType === "limited" && opt.periodDays && (
                            <span className="ml-1">({opt.periodDays}日)</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">カテゴリ</div>
                        <div>{CATEGORY_LABELS[opt.category]}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleToggle(opt)}>
                        {opt.isActive ? "無効化" : "有効化"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(opt.id)}>
                        <Edit2 className="w-3 h-3 mr-1" /> 編集
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(opt.id)} className="text-red-600 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function OptionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: OptionItem;
  onSave: (data: Omit<OptionItem, "id" | "isActive">) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "0");
  const [periodType, setPeriodType] = useState(initial?.periodType || "none");
  const [periodDays, setPeriodDays] = useState(initial?.periodDays?.toString() || "");
  const [category, setCategory] = useState(initial?.category || "general");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() || "0");

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("オプション名を入力してください");
      return;
    }
    onSave({
      name: name.trim(),
      description: description.trim(),
      price: parseInt(price) || 0,
      periodType,
      periodDays: periodType === "limited" ? (parseInt(periodDays) || 0) : null,
      category,
      sortOrder: parseInt(sortOrder) || 0,
    });
  };

  return (
    <CardContent className="pt-4 space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">オプション名 <span className="text-red-500">*</span></Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">説明</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="text-sm min-h-[60px]" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">料金（円）</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">並び順</Label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="h-8 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">期間タイプ</Label>
          <select
            value={periodType}
            onChange={(e) => setPeriodType(e.target.value)}
            className="w-full h-8 text-sm border rounded px-2"
          >
            <option value="none">なし</option>
            <option value="limited">有限</option>
            <option value="unlimited">無限</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">カテゴリ</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-8 text-sm border rounded px-2"
          >
            <option value="general">汎用</option>
            <option value="video">動画</option>
            <option value="lp">LP</option>
          </select>
        </div>
      </div>
      {periodType === "limited" && (
        <div className="space-y-1">
          <Label className="text-xs">有効日数</Label>
          <Input type="number" value={periodDays} onChange={(e) => setPeriodDays(e.target.value)} className="h-8 text-sm" placeholder="例: 30" />
        </div>
      )}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="w-3 h-3 mr-1" /> キャンセル
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
          保存
        </Button>
      </div>
    </CardContent>
  );
}

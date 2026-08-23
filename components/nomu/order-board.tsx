"use client";

import { useMemo, useState } from "react";
import { Dices, Minus, Plus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  CATEGORY_STYLES,
  DRINK_CATEGORIES,
  formatYen,
  getQty,
  newId,
  pickRandomItem,
  setQty,
  type DrinkCategory,
  type Member,
  type MenuItem,
  type OrderMap,
} from "@/lib/nomu";

interface Props {
  items: MenuItem[];
  members: Member[];
  orders: OrderMap;
  onMembersChange: (members: Member[]) => void;
  onOrdersChange: (orders: OrderMap) => void;
}

export function OrderBoard({
  items,
  members,
  orders,
  onMembersChange,
  onOrdersChange,
}: Props) {
  const [activeMemberId, setActiveMemberId] = useState<string | null>(
    members[0]?.id ?? null
  );
  const [newMemberName, setNewMemberName] = useState("");

  const activeMember =
    members.find((m) => m.id === activeMemberId) ?? members[0] ?? null;

  /** カテゴリ順にグルーピングして、メニューを探しやすくする */
  const grouped = useMemo(() => {
    return DRINK_CATEGORIES.map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    })).filter((group) => group.items.length > 0);
  }, [items]);

  const activeTotals = useMemo(() => {
    if (!activeMember) return { qty: 0, amount: 0 };
    const byItem = orders[activeMember.id] ?? {};
    return items.reduce(
      (acc, item) => {
        const qty = byItem[item.id] ?? 0;
        return { qty: acc.qty + qty, amount: acc.amount + (item.price ?? 0) * qty };
      },
      { qty: 0, amount: 0 }
    );
  }, [activeMember, items, orders]);

  function addMember() {
    const name = newMemberName.trim() || `${members.length + 1}人目`;
    const member: Member = { id: newId("member"), name: name.slice(0, 20) };
    onMembersChange([...members, member]);
    setActiveMemberId(member.id);
    setNewMemberName("");
  }

  function removeMember(id: string) {
    const next = members.filter((m) => m.id !== id);
    onMembersChange(next);
    if (activeMemberId === id) setActiveMemberId(next[0]?.id ?? null);
  }

  function changeQty(itemId: string, delta: number) {
    if (!activeMember) {
      toast.error("先にメンバーを追加してください");
      return;
    }
    const next = Math.max(0, getQty(orders, activeMember.id, itemId) + delta);
    onOrdersChange(setQty(orders, activeMember.id, itemId, next));
  }

  function handleOmakase(softOnly: boolean) {
    if (!activeMember) {
      toast.error("先にメンバーを追加してください");
      return;
    }
    const picked = pickRandomItem(items, { softOnly });
    if (!picked) {
      toast.error("選べる品がありません");
      return;
    }
    changeQty(picked.id, 1);
    toast.success(`${activeMember.name} は「${picked.name}」に決まりました！`);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">メンバー</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {members.map((member) => {
              const qty = Object.values(orders[member.id] ?? {}).reduce(
                (sum, q) => sum + q,
                0
              );
              const isActive = member.id === activeMember?.id;
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-sm transition-colors ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveMemberId(member.id)}
                    className="flex items-center gap-1.5"
                  >
                    {member.name}
                    <span
                      className={`rounded-full px-1.5 text-[11px] ${
                        isActive ? "bg-white/20" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {qty}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${member.name}を削除`}
                    onClick={() => removeMember(member.id)}
                    className={`rounded-full p-0.5 ${
                      isActive ? "hover:bg-white/20" : "hover:bg-slate-100"
                    }`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Input
              value={newMemberName}
              placeholder="名前（空欄なら「◯人目」）"
              className="h-9"
              maxLength={20}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMember();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addMember}>
              <UserPlus />
              追加
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            {activeMember ? `${activeMember.name} の注文` : "注文"}
          </CardTitle>
          {activeMember && (
            <span className="text-sm text-slate-500">
              {activeTotals.qty}点 / {formatYen(activeTotals.amount)}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeMember && (
            <p className="py-4 text-center text-sm text-slate-500">
              メンバーを追加すると注文を入力できます。
            </p>
          )}

          {activeMember && items.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-500">
              メニューがまだありません。「メニュー」タブから読み取ってください。
            </p>
          )}

          {activeMember && items.length > 0 && (
            <>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleOmakase(false)}
                >
                  <Dices />
                  迷ったらおまかせ
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleOmakase(true)}
                >
                  ノンアルでおまかせ
                </Button>
              </div>

              {grouped.map((group) => (
                <div key={group.category} className="space-y-1.5">
                  <CategoryHeading category={group.category} />
                  {group.items.map((item) => {
                    const qty = getQty(orders, activeMember.id, item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 rounded-md border p-2 ${
                          qty > 0 ? "border-slate-900 bg-slate-50" : "border-slate-200"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {item.name || "（名称未設定）"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.price === null ? "価格不明" : formatYen(item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="outline"
                            disabled={qty === 0}
                            aria-label={`${item.name}を減らす`}
                            onClick={() => changeQty(item.id, -1)}
                          >
                            <Minus />
                          </Button>
                          <span className="w-6 text-center text-sm tabular-nums">{qty}</span>
                          <Button
                            type="button"
                            size="icon-sm"
                            aria-label={`${item.name}を追加`}
                            onClick={() => changeQty(item.id, 1)}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoryHeading({ category }: { category: DrinkCategory }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <span className={`rounded px-1.5 py-0.5 text-[11px] ${CATEGORY_STYLES[category]}`}>
        {category}
      </span>
      <span className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

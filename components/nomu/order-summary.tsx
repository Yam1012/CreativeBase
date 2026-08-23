"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardCopy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  aggregateOrders,
  buildOrderText,
  diffOrders,
  formatYen,
  splitEvenly,
  type Aggregation,
  type Member,
  type MenuItem,
  type OrderMap,
} from "@/lib/nomu";

interface Props {
  items: MenuItem[];
  members: Member[];
  orders: OrderMap;
  /** 既に店員さんに伝えた分 */
  confirmed: OrderMap;
  shopName: string;
  onConfirm: () => void;
}

export function OrderSummary({
  items,
  members,
  orders,
  confirmed,
  shopName,
  onConfirm,
}: Props) {
  const [includeMembers, setIncludeMembers] = useState(false);

  /** これまでの全注文（支払い計算用） */
  const total = useMemo(
    () => aggregateOrders(items, members, orders),
    [items, members, orders]
  );

  /** 今回店員さんに伝える分 */
  const pending = useMemo(
    () => aggregateOrders(items, members, diffOrders(orders, confirmed)),
    [items, members, orders, confirmed]
  );

  const orderText = useMemo(
    () =>
      buildOrderText(pending.totalQty > 0 ? pending : total, {
        includeMembers,
        shopName: shopName.trim() || undefined,
      }),
    [pending, total, includeMembers, shopName]
  );

  const evenShares = useMemo(
    () => splitEvenly(total.totalAmount, members.length),
    [total.totalAmount, members.length]
  );

  const hasConfirmed = total.totalQty > pending.totalQty;

  async function copyOrderText() {
    try {
      await navigator.clipboard.writeText(orderText);
      toast.success("注文内容をコピーしました");
    } catch {
      toast.error("コピーできませんでした。テキストを長押しして選択してください。");
    }
  }

  async function shareOrderText() {
    if (typeof navigator.share !== "function") {
      await copyOrderText();
      return;
    }
    try {
      await navigator.share({ title: "何飲む？の注文", text: orderText });
    } catch {
      // ユーザーがキャンセルした場合は何もしない
    }
  }

  function handleConfirm() {
    onConfirm();
    toast.success("発注済みにしました。次からは追加分だけが表示されます。");
  }

  if (total.totalQty === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-slate-500">
          まだ注文が入っていません。「注文」タブで飲みたいものを選んでください。
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {pending.totalQty > 0
              ? hasConfirmed
                ? "今回頼む分（追加）"
                : "店員さんに伝える注文"
              : "追加の注文はありません"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.totalQty > 0 ? (
            <>
              <OrderLines aggregation={pending} showUndecided={!hasConfirmed} />
              <Button type="button" variant="outline" className="w-full" onClick={handleConfirm}>
                <Check />
                この注文を伝えた（発注済みにする）
              </Button>
            </>
          ) : (
            <p className="py-2 text-center text-sm text-slate-500">
              いまの注文はすべて発注済みです。おかわりは「注文」タブから追加してください。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">共有用テキスト</CardTitle>
          <label className="flex items-center gap-1.5 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={includeMembers}
              onChange={(e) => setIncludeMembers(e.target.checked)}
            />
            誰が頼んだかを含める
          </label>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="max-h-60 overflow-auto whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm">
            {orderText}
          </pre>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" onClick={copyOrderText}>
              <ClipboardCopy />
              コピー
            </Button>
            <Button type="button" variant="outline" onClick={shareOrderText}>
              <Share2 />
              共有
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">これまでの合計</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderLines aggregation={total} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">支払い</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">飲んだ分だけ（実費）</p>
            <div className="space-y-1.5">
              {total.memberTotals.map((memberTotal) => (
                <div key={memberTotal.member.id} className="flex justify-between text-sm">
                  <span>
                    {memberTotal.member.name}
                    <span className="ml-1.5 text-xs text-slate-500">{memberTotal.qty}点</span>
                  </span>
                  <span className="tabular-nums">{formatYen(memberTotal.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {members.length > 1 && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                割り勘（100円単位・端数は後ろの人が調整）
              </p>
              <div className="space-y-1.5">
                {members.map((member, index) => (
                  <div key={member.id} className="flex justify-between text-sm">
                    <span>{member.name}</span>
                    <span className="tabular-nums">{formatYen(evenShares[index] ?? 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {total.hasUnknownPrice && (
            <p className="text-xs text-amber-700">
              価格が読み取れていない品があるため、金額は目安です。
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** 品目 × 杯数の一覧（今回分・累計で共通） */
function OrderLines({
  aggregation,
  showUndecided = true,
}: {
  aggregation: Aggregation;
  /** 「追加分」の表示では、単に追加が無いだけの人を未決定として出さない */
  showUndecided?: boolean;
}) {
  return (
    <div className="space-y-3">
      {aggregation.lines.map((line) => (
        <div
          key={line.item.id}
          className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="font-medium">
              {line.item.name || "（名称未設定）"}
              <span className="ml-2 text-lg font-bold tabular-nums">×{line.qty}</span>
            </p>
            <p className="truncate text-xs text-slate-500">
              {line.orderedBy
                .map((e) => (e.qty > 1 ? `${e.member.name}×${e.qty}` : e.member.name))
                .join("・")}
            </p>
          </div>
          <span className="shrink-0 text-sm tabular-nums text-slate-600">
            {line.subtotal === null ? "—" : formatYen(line.subtotal)}
          </span>
        </div>
      ))}

      <div className="flex items-center justify-between pt-1 text-base font-semibold">
        <span>合計 {aggregation.totalQty}点</span>
        <span className="tabular-nums">
          {formatYen(aggregation.totalAmount)}
          {aggregation.hasUnknownPrice && "〜"}
        </span>
      </div>

      {showUndecided && aggregation.undecided.length > 0 && (
        <p className="text-xs text-slate-500">
          まだ選んでいない人: {aggregation.undecided.map((m) => m.name).join("・")}
        </p>
      )}
    </div>
  );
}

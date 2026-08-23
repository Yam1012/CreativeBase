"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Beer, ClipboardList, RotateCcw, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MenuScanner } from "@/components/nomu/menu-scanner";
import { OrderBoard } from "@/components/nomu/order-board";
import { OrderSummary } from "@/components/nomu/order-summary";
import { toast } from "sonner";
import {
  aggregateOrders,
  newId,
  pruneOrders,
  type Member,
  type MenuItem,
  type OrderMap,
} from "@/lib/nomu";

const STORAGE_KEY = "nomu-app-state-v1";

type Tab = "menu" | "order" | "summary";

interface PersistedState {
  shopName: string;
  items: MenuItem[];
  members: Member[];
  orders: OrderMap;
  photoUrl: string | null;
  isMock: boolean;
}

const initialState: PersistedState = {
  shopName: "",
  items: [],
  members: [],
  orders: {},
  photoUrl: null,
  isMock: false,
};

export default function NomuPage() {
  const [state, setState] = useState<PersistedState>(initialState);
  const [tab, setTab] = useState<Tab>("menu");
  const [restored, setRestored] = useState(false);

  // 端末内に保存（席で回しながら使うので、リロードしても消えないようにする）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...initialState, ...JSON.parse(saved) });
    } catch {
      // 壊れた保存データは無視して初期状態で始める
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      // 写真は data URL で数MBになり保存容量を食い潰すため、メモリ上だけに置く
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...state, photoUrl: null })
      );
    } catch {
      // 保存できなくても操作は継続できる
    }
  }, [state, restored]);

  const update = useCallback((patch: Partial<PersistedState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleItemsChange = useCallback((items: MenuItem[]) => {
    setState((prev) => ({
      ...prev,
      items,
      orders: pruneOrders(prev.orders, prev.members, items),
    }));
  }, []);

  const handleMembersChange = useCallback((members: Member[]) => {
    setState((prev) => ({
      ...prev,
      members,
      orders: pruneOrders(prev.orders, members, prev.items),
    }));
  }, []);

  const totalQty = useMemo(
    () => aggregateOrders(state.items, state.members, state.orders).totalQty,
    [state.items, state.members, state.orders]
  );

  function startOrdering() {
    if (state.items.length === 0) {
      toast.error("先にメニューを読み取ってください");
      return;
    }
    // 初回はひとりぶんの枠を用意しておく（すぐ入力を始められるように）
    if (state.members.length === 0) {
      update({ members: [{ id: newId("member"), name: "1人目" }] });
    }
    setTab("order");
  }

  function resetAll() {
    if (!confirm("メニュー・メンバー・注文をすべて消して最初からやり直しますか？")) return;
    setState(initialState);
    setTab("menu");
    toast.success("リセットしました");
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: "menu", label: "メニュー", icon: <ScanLine className="size-4" />, badge: state.items.length },
    { key: "order", label: "注文", icon: <Beer className="size-4" />, badge: totalQty },
    { key: "summary", label: "集計", icon: <ClipboardList className="size-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3">
          <Beer className="size-5 text-amber-600" />
          <h1 className="text-lg font-bold">何飲む？</h1>
          <Input
            value={state.shopName}
            placeholder="お店の名前（任意）"
            maxLength={30}
            className="h-8 flex-1 border-none bg-slate-100 text-sm"
            onChange={(e) => update({ shopName: e.target.value })}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="リセット"
            onClick={resetAll}
          >
            <RotateCcw className="text-slate-400" />
          </Button>
        </div>

        <nav className="mx-auto flex max-w-2xl px-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 border-b-2 px-2 py-2 text-sm transition-colors ${
                tab === t.key
                  ? "border-amber-600 font-semibold text-amber-700"
                  : "border-transparent text-slate-500"
              }`}
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className="rounded-full bg-slate-100 px-1.5 text-[11px] text-slate-600">
                  {t.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-24">
        {tab === "menu" && (
          <>
            <MenuScanner
              items={state.items}
              onItemsChange={handleItemsChange}
              photoUrl={state.photoUrl}
              onPhotoChange={(photoUrl) => update({ photoUrl })}
              isMock={state.isMock}
              onIsMockChange={(isMock) => update({ isMock })}
            />
            <Button type="button" size="lg" className="w-full" onClick={startOrdering}>
              注文を入力する
            </Button>
          </>
        )}

        {tab === "order" && (
          <>
            <OrderBoard
              items={state.items}
              members={state.members}
              orders={state.orders}
              onMembersChange={handleMembersChange}
              onOrdersChange={(orders) => update({ orders })}
            />
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => setTab("summary")}
            >
              集計を見る{totalQty > 0 && `（${totalQty}点）`}
            </Button>
          </>
        )}

        {tab === "summary" && (
          <OrderSummary
            items={state.items}
            members={state.members}
            orders={state.orders}
            shopName={state.shopName}
          />
        )}
      </main>
    </div>
  );
}

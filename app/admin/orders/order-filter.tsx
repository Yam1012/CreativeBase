"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

export function OrderFilter({ showUserSearch = false }: { showUserSearch?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");
  const [purpose, setPurpose] = useState(searchParams.get("purpose") || "all");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");

  const apply = () => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);
    if (purpose !== "all") params.set("purpose", purpose);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname);
  };

  const reset = () => {
    setQ(""); setStatus("all"); setType("all"); setPurpose("all"); setFrom(""); setTo("");
    router.push(window.location.pathname);
  };

  const hasFilter = q || status !== "all" || type !== "all" || purpose !== "all" || from || to;

  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {showUserSearch && (
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label className="text-xs">ユーザー検索（名前・メール）</Label>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && apply()}
                placeholder="山田 / example@..."
                className="h-9 text-sm"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">ステータス</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 border rounded px-2 text-sm bg-background"
            >
              <option value="all">すべて</option>
              <option value="pending">受付中</option>
              <option value="in_progress">制作中</option>
              <option value="review_pending">確認待ち</option>
              <option value="revision_requested">修正依頼中</option>
              <option value="completed">完了</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">種別</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-9 border rounded px-2 text-sm bg-background"
            >
              <option value="all">すべて</option>
              <option value="video">動画</option>
              <option value="lp">LP</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">目的</Label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-9 border rounded px-2 text-sm bg-background"
            >
              <option value="all">すべて</option>
              <option value="presentation">プレゼン用</option>
              <option value="promotion">プロモーション用</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">期間 From</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">期間 To</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={apply}>
            <Search className="w-4 h-4 mr-1" /> 検索
          </Button>
          {hasFilter && (
            <Button size="sm" variant="outline" onClick={reset}>
              <X className="w-4 h-4 mr-1" /> リセット
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

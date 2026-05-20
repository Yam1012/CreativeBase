"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export function StripeSetupButton() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  const handleSetup = async () => {
    if (!confirm("Stripe Product / Price を作成しますか？\n既存のIDがあるコースはスキップされます。")) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/admin/stripe/setup-products", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "作成に失敗しました");
        return;
      }
      const createdCount = data.results.filter((r: { created: boolean }) => r.created).length;
      toast.success(`${createdCount}件のコースを新規作成しました（既存はスキップ）`);
      router.refresh();
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Button onClick={handleSetup} disabled={processing} size="sm">
      {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wand2 className="w-4 h-4 mr-1" />}
      Stripe Product / Priceを作成
    </Button>
  );
}

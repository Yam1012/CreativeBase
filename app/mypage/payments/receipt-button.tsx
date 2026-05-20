"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ReceiptButton({ paymentId }: { paymentId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/mypage/payments/${paymentId}/receipt`);
      const data = await res.json();
      if (!res.ok || !data.url) {
        toast.error(data.error || "領収書を取得できませんでした");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-2 h-7 text-xs"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin mr-1" />
      ) : (
        <FileText className="w-3 h-3 mr-1" />
      )}
      領収書
    </Button>
  );
}

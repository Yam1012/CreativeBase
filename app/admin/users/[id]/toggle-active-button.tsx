"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  currentRole: string;
}

export function ToggleActiveButton({ userId, currentRole }: Props) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const isActive = currentRole !== "cancelled";
  const isAdmin = currentRole === "admin";

  if (isAdmin) return null;

  const handleToggle = async () => {
    const action = isActive ? "無効化" : "有効化";
    if (!confirm(`このユーザーを${action}しますか？`)) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/toggle-active`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || `${action}に失敗しました`);
        return;
      }
      toast.success(`${action}しました`);
      router.refresh();
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Button
      variant={isActive ? "destructive" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={processing}
    >
      {processing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isActive ? (
        <><Ban className="w-4 h-4 mr-1" /> アカウント無効化</>
      ) : (
        <><CheckCircle className="w-4 h-4 mr-1" /> アカウント有効化</>
      )}
    </Button>
  );
}
